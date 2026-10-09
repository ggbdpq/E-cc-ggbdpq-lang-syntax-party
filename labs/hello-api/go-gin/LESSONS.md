# Go Hello API 经验

## 2026-10-10：监听失败必须使启动失败

- 规则：入口检查 `r.Run` 返回错误，失败时终止进程。
- 为什么：忽略绑定错误会让进程返回状态 0，使调用方误判服务启动成功。
- 证据：`main.go` / `TestMainListenerFailure`；旧代码 `go test ./... -run TestMainListenerFailure -v -count=1` 打印 `occupied port must fail startup with nonzero status`。
- Seen 1×（2026-10-10）。
