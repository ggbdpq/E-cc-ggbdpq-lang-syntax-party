# Go Hello API 结构

`main.go` 注册 `GET /hello` 并监听 `:8003`。服务不维护状态，成功响应仍为 message/language/framework 三字段。监听失败时启动入口终止进程并返回非零状态。

`main_test.go` 在真实进程边界占用默认端口，核验失败启动不会以状态 0 退出；用例结束关闭探测 listener。
