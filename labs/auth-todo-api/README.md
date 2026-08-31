# JWT Todo 实验室

同一份契约，五种语言：登录发 JWT，Todo 必须带 `Authorization: Bearer`。用来把全栈核心「第 4 天鉴权」变成可 curl。

预置账号（密码都是 `password`，启动时 bcrypt 哈希，库里不存明文）：

| username | role | 能看见什么 |
|----------|------|------------|
| `demo` | user | 只看见、改、删自己的 Todo |
| `admin` | admin | 看见全部；可改/删别人的 Todo |

## 契约

| 方法 | 路径 | 鉴权 | 请求体 | 成功 |
|------|------|------|--------|------|
| GET | `/health` | 公开 | | `{ "status": "ok" }` |
| POST | `/login` | 公开 | `{ "username", "password" }` | `{ "token", "user": { id, username, role } }` |
| GET | `/me` | Bearer | | `{ id, username, role }` |
| GET | `/todos` | Bearer | | `{ "items": Todo[] }` |
| POST | `/todos` | Bearer | `{ "title" }` | 201 + Todo |
| PATCH | `/todos/:id` | Bearer | `{ "title"?, "done"? }` | Todo |
| DELETE | `/todos/:id` | Bearer | | 204 |

Todo：`{ "id": number, "title": string, "done": boolean, "ownerId": number }`

失败（JSON 都是 `{ "error": "..." }`）：

- 登录失败：401 `invalid credentials`
- 缺 token / 坏 token：401 `unauthorized`
- 已登录但动别人的 Todo（且不是 admin）：403 `forbidden`
- Todo 不存在：404 `todo not found`

已开 CORS，网站 `http://localhost:3000` 可直接 fetch（Header 带 `Authorization`）。

| 目录 | 端口 | 启动 |
|------|------|------|
| `python-fastapi/` | 8021 | `python -m uvicorn main:app --port 8021` |
| `node-express/` | 8022 | `npm start` |
| `go-gin/` | 8023 | `go run .` |
| `rust-axum/` | 8024 | `cargo run` |
| `java-springboot/` | 8025 | `mvn -s settings-aliyun.xml package -DskipTests` 后跑 jar |

验证（把端口换成 8021–8025）：

```bash
curl http://localhost:8021/health

# 无 token → 401
curl -i http://localhost:8021/todos

# 登录拿 token
TOKEN=$(curl -s -X POST http://localhost:8021/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"demo\",\"password\":\"password\"}" | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

curl http://localhost:8021/me -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:8021/todos -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"title\":\"买牛奶\"}"
curl http://localhost:8021/todos -H "Authorization: Bearer $TOKEN"
```

Windows PowerShell 不要用 `curl -d "{\"username\":...}"`，引号会被吃掉。改用：

```powershell
$login = Invoke-RestMethod http://localhost:8021/login -Method POST -ContentType 'application/json' -Body '{"username":"demo","password":"password"}'
Invoke-RestMethod http://localhost:8021/me -Headers @{ Authorization = "Bearer $($login.token)" }
```
