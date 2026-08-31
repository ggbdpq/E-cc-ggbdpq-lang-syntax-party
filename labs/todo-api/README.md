# Todo CRUD 实验室

同一份契约，五种语言内存实现。用来练「前端表格背后的四个动词」，不依赖 MySQL。

## 契约

| 方法 | 路径 | 请求体 | 成功 |
|------|------|--------|------|
| GET | `/todos` | | `{ "items": Todo[] }` |
| POST | `/todos` | `{ "title": string }` | 201 + Todo |
| PATCH | `/todos/:id` | `{ "title"?, "done"? }` | Todo |
| DELETE | `/todos/:id` | | 204 |
| GET | `/health` | | `{ "status": "ok" }` |

Todo：`{ "id": number, "title": string, "done": boolean }`

已开 CORS，网站 `http://localhost:3000` 可直接 fetch。

| 目录 | 端口 | 启动 |
|------|------|------|
| `python-fastapi/` | 8011 | `python -m uvicorn main:app --port 8011` |
| `node-express/` | 8012 | `npm start` |
| `go-gin/` | 8013 | `go run .` |
| `rust-axum/` | 8014 | `cargo run` |
| `java-springboot/` | 8015 | `mvn -s settings-aliyun.xml package -DskipTests` 后跑 jar |

验证（把端口换成 8011–8015）：

```bash
curl http://localhost:8011/health
curl -X POST http://localhost:8011/todos -H "Content-Type: application/json" -d "{\"title\":\"买牛奶\"}"
curl http://localhost:8011/todos
curl -X PATCH http://localhost:8011/todos/1 -H "Content-Type: application/json" -d "{\"done\":true}"
curl -X DELETE http://localhost:8011/todos/1
```
