package main_test

import (
	"context"
	"errors"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestMainPortEnvironment(t *testing.T) {
	binary := filepath.Join(t.TempDir(), "auth-todo")
	build := exec.CommandContext(t.Context(), "go", "build", "-o", binary, ".")
	if output, err := build.CombinedOutput(); err != nil {
		t.Fatalf("build server: %v\n%s", err, output)
	}

	for _, tc := range []struct {
		name string
		port *string
	}{
		{name: "unset keeps default"},
		{name: "empty keeps default", port: new(string)},
		{name: "custom port serves HTTP", port: new("custom")},
	} {
		t.Run(tc.name, func(t *testing.T) {
			port := "8023"
			if tc.port != nil && *tc.port == "custom" {
				listener, err := (&net.ListenConfig{}).Listen(t.Context(), "tcp", "127.0.0.1:0")
				if err != nil {
					t.Fatal(err)
				}
				_, port, err = net.SplitHostPort(listener.Addr().String())
				if closeErr := listener.Close(); closeErr != nil {
					t.Fatal(closeErr)
				}
				if err != nil {
					t.Fatal(err)
				}
			}
			command := exec.CommandContext(t.Context(), binary)
			for _, entry := range os.Environ() {
				if !strings.HasPrefix(entry, "PORT=") && !strings.HasPrefix(entry, "GIN_MODE=") {
					command.Env = append(command.Env, entry)
				}
			}
			command.Env = append(command.Env, "GIN_MODE=debug")
			if tc.port != nil {
				value := *tc.port
				if value == "custom" {
					value = port
				}
				command.Env = append(command.Env, "PORT="+value)
			}
			logPath := filepath.Join(t.TempDir(), "server.log")
			output, err := os.OpenFile(logPath, os.O_CREATE|os.O_WRONLY, 0o600)
			if err != nil {
				t.Fatal(err)
			}
			command.Stdout = output
			command.Stderr = output
			if err := command.Start(); err != nil {
				if closeErr := output.Close(); closeErr != nil {
					t.Error(closeErr)
				}
				t.Fatal(err)
			}
			t.Cleanup(func() {
				if err := command.Process.Kill(); err != nil && !errors.Is(err, os.ErrProcessDone) {
					t.Error(err)
				}
				var exitError *exec.ExitError
				if err := command.Wait(); err != nil && !errors.As(err, &exitError) && !errors.Is(err, context.Canceled) {
					t.Error(err)
				}
				if err := output.Close(); err != nil {
					t.Error(err)
				}
			})
			waitForPort(t, logPath, port, tc.port != nil && *tc.port == "custom")
		})
	}
}

func waitForPort(t *testing.T, logPath, port string, checkHTTP bool) {
	t.Helper()
	client := &http.Client{Timeout: 100 * time.Millisecond}
	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		output, err := os.ReadFile(logPath)
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(string(output), "Listening and serving HTTP on :"+port) {
			if !checkHTTP {
				return
			}
			request, err := http.NewRequestWithContext(t.Context(), http.MethodGet, "http://127.0.0.1:"+port+"/health", nil)
			if err != nil {
				t.Fatal(err)
			}
			response, err := client.Do(request)
			if err == nil {
				if err := response.Body.Close(); err != nil {
					t.Fatal(err)
				}
				if response.StatusCode == http.StatusOK {
					return
				}
			}
		}
		time.Sleep(20 * time.Millisecond)
	}
	output, err := os.ReadFile(logPath)
	if err != nil {
		t.Fatal(err)
	}
	t.Fatalf("PORT must select listener :%s; server output:\n%s", port, output)
}

func TestMainListenerFailure(t *testing.T) {
	binary := filepath.Join(t.TempDir(), "auth-todo")
	build := exec.CommandContext(t.Context(), "go", "build", "-o", binary, ".")
	if output, err := build.CombinedOutput(); err != nil {
		t.Fatalf("build server: %v\n%s", err, output)
	}
	command := exec.CommandContext(t.Context(), binary)
	for _, entry := range os.Environ() {
		if !strings.HasPrefix(entry, "PORT=") {
			command.Env = append(command.Env, entry)
		}
	}
	command.Env = append(command.Env, "PORT=invalid")
	if output, err := command.CombinedOutput(); err == nil {
		t.Fatalf("invalid PORT must fail startup with nonzero status; output:\n%s", output)
	}
}
