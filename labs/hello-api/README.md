# Hello API 实验室

同一个接口 `GET /hello`，五种语言的旗舰框架各实现一遍。用来把语法派对里的对照代码跑起来。

统一响应：

```json
{"message": "Hello World", "language": "<语言>", "framework": "<框架>"}
```

| 目录 | 语言 | 框架 | 端口 | 启动 |
|------|------|------|------|------|
| `python-fastapi/` | Python | FastAPI | 8001 | `python -m uvicorn main:app --port 8001` |
| `node-express/` | Node.js | Express 5 | 8002 | `npm start` |
| `go-gin/` | Go | Gin | 8003 | `go run .` |
| `rust-axum/` | Rust | Axum | 8004 | `cargo run` |
| `java-springboot/` | Java 8 | Spring Boot 2.7.18 | 8005 | `mvn -s settings-aliyun.xml package -DskipTests` 后 `java -jar target/hello-springboot-0.0.1.jar` |

Go 版监听失败时以非零状态退出，可在 `go-gin/` 执行 `go test ./...` 回归端口占用场景。

验证：`curl http://localhost:800X/hello`，X 为 1 到 5。

这套实验室从原来的 `backend/frame` 迁入。`backend/demo` 只是 Hello World 打印，没有额外学习增量，不再保留独立目录。
