package main_test

import (
	"net"
	"os/exec"
	"path/filepath"
	"testing"
)

func TestMainListenerFailure(t *testing.T) {
	listener, err := (&net.ListenConfig{}).Listen(t.Context(), "tcp", ":8003")
	if err != nil {
		t.Fatalf("reserve default port: %v", err)
	}
	t.Cleanup(func() {
		if err := listener.Close(); err != nil {
			t.Error(err)
		}
	})

	binary := filepath.Join(t.TempDir(), "hello-api")
	build := exec.CommandContext(t.Context(), "go", "build", "-o", binary, ".")
	if output, err := build.CombinedOutput(); err != nil {
		t.Fatalf("build server: %v\n%s", err, output)
	}

	command := exec.CommandContext(t.Context(), binary)
	if output, err := command.CombinedOutput(); err == nil {
		t.Fatalf("occupied port must fail startup with nonzero status; output:\n%s", output)
	}
}
