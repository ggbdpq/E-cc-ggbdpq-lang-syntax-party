# Go JWT Todo 经验

## 2026-10-10：监听配置必须走真实启动入口

- 规则：`PORT` 从环境传到 `r.Run`；空值保持默认端口，测试在独立进程用随机端口核验真实 HTTP。
- 为什么：写死 `:8023` 会让自定义端口无效，并使已有服务阻断测试。
- 证据：`main.go` / `main_test.go`；旧代码运行 `go test main.go main_test.go -run TestMainPortEnvironment -v -count=1`，自定义端口例失败 `PORT must select listener :61218`，服务日志仍为 `Listening and serving HTTP on :8023`。
- Seen 1×（2026-10-10）。
