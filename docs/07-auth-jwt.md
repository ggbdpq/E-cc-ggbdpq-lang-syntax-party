# 07 鉴权层：JWT 实验室与 401/403 的来源

> 对应网站页签：🛠️ 全栈核心 → 鉴权层；🧪 动手实验室 → 第三关。数据源 `src/data/g5-fullstack-auth.ts`、`g4-labs.ts` 的 `authRunbook`；源码 `labs/auth-todo-api/`。

## 先说结论

鉴权这块前端转全栈最容易「知其然不知其所以然」，因为你在前端只负责两件事：存 token、塞 header。这一篇补上中间的黑盒：**token 从哪来、怎么验、401 和 403 分别在代码的哪一行被决定**。学完你会拿到一个可 curl 的完整鉴权系统（8021–8025）。

## 全景：一次受保护的请求走完一圈

```
POST /login {username, password}          ← 公开路由
  → 查用户 → bcrypt 比对 → 签发 JWT
  → 前端存 token（localStorage / 内存）

GET /todos + Authorization: Bearer <token>  ← 受保护路由
  → 鉴权中间件：解析 JWT → 验签名 → 取出 user
  → 业务层：只返回 ownerId === user.id 的 todo（admin 例外）
```

前端「跳登录页」的逻辑（401 时 `router.push('/login')`），对应的正是这条链上两处失败：**登录失败**（401 `invalid credentials`）和**token 失效**（401 `unauthorized`）。

## Cookie Session vs JWT：怎么选

网站「Cookie Session 与 JWT 怎么选」主题的核心对比：

| | Cookie + Session | JWT |
|--|-----------------|-----|
| 状态存在哪 | 服务端（session 表/Redis） | 客户端（token 自带） |
| 服务端要查吗 | 每次请求查 | 不查，验签名即可 |
| 天然适合 | 同域 Web 应用 | 跨域 API、多端（App/小程序）、微服务间传递 |
| 踢人下线 | 删 session 即刻生效 | 难，要等过期或加黑名单 |
| 前端配合 | 什么都不用做（自动带 cookie） | 手动存、手动塞 `Authorization` 头 |

一句话判断：**纯 Web 同域用 Session 省心，前后端分离 + 多端用 JWT 灵活**。本站实验室选 JWT，因为 CORS 场景下 cookie 还要折腾 `credentials` 和 `Allow-Credentials` 头，JWT 让演示聚焦在鉴权逻辑本身。

## 密码只存哈希

JWT 实验室预置了两个账号（`demo`/`admin`，密码都是 `password`），启动时 bcrypt 哈希、库里不存明文。这不是可选项，是底线：

```go
// 登录时：比对哈希，不是比对明文
err := bcrypt.CompareHashAndPassword(user.PasswordHash, []byte(rawPassword))

// 注册时：哈希后落库
hash, _ := bcrypt.GenerateFromPassword([]byte(raw), bcrypt.DefaultCost)
```

为什么是 bcrypt 而不是 MD5/SHA256：bcrypt 故意慢（可调代价参数），让暴力破解的成本以亿倍计。数据库泄漏时，攻击者拿到的是哈希不是密码——前提是你没存明文。「密码只存哈希」是网站鉴权层五个主题之一，其他四个是：前端跳登录那侧、Session vs JWT、鉴权中间件、RBAC。

## JWT 本体：三段式与验签

token 拆开是 `header.payload.signature` 三段 Base64。**前两段只是编码不是加密，任何人都能解开看**（去 jwt.io 粘贴就懂）。真正防伪的是第三段签名：服务器用只有自己知道的 secret 对前两段做 HMAC，改过 payload 的 token 验签必失败。

实验室里签名逻辑（Go 版，`labs/auth-todo-api/go-gin/main.go` 节选）：

```go
const secret = "syntax-party-jwt-lab"

token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "sub":  user.ID,
    "role": user.Role,
    "exp":  time.Now().Add(time.Hour * 24).Unix(),
})
signed, _ := token.SignedString([]byte(secret))
```

三个关键点：`sub`（用户标识）和 `role`（角色）放进 payload，中间件不用查库就能拿到身份；`exp` 过期时间让 token 自带生命周期；**secret 泄漏 = 全部 token 伪造**，所以真实项目 secret 必须进环境变量（第 08 篇），实验室为了简化写死了常量——你知道这是简化就行。

## 鉴权中间件：401 在这一行诞生

Go 版中间件的完整逻辑，这就是所有语言里鉴权中间件的最小通用形态：

```go
func auth() gin.HandlerFunc {
    return func(c *gin.Context) {
        header := c.GetHeader("Authorization")
        if !strings.HasPrefix(header, "Bearer ") {
            c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})
            return
        }
        token, err := jwt.Parse(header[7:], func(t *jwt.Token) (interface{}, error) {
            return []byte(secret), nil
        })
        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})
            return
        }
        c.Set("user", extractUser(token)) // 身份传给后续处理函数
        c.Next()
    }
}
```

读懂这段，401 的两种来源就分清了：**没带 token / 带了坏 token → 中间件 401**；**带了合法 token 但权限不够 → 业务层 403**。

## RBAC：admin 能改别人的 todo

实验室的角色规则：`demo` 只能动自己的 todo，`admin` 能看全部、能改删别人的。判断发生在业务层：

```
GET  /todos   → demo 只返回 ownerId 自己的；admin 返回全部
PATCH /todos/:id → 目标 todo 的 ownerId ≠ 当前用户 且 role ≠ admin → 403 forbidden
```

对应网站「角色与权限：按钮隐藏不够」主题的观点：**前端隐藏按钮只是体验优化，权限必须由服务端强制执行**。前端藏了按钮但接口没拦 = 裸奔，绕过 UI 直接 curl 就能越权。实验室的 403 就是服务端强制的证明。

## 跑通第三关

```bash
cd labs/auth-todo-api/python-fastapi
python -m uvicorn main:app --port 8021

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

完整的一关应该这样过：demo 登录创建自己的 todo → 另开一个 `admin` 的 token → 用 admin 的 token PATCH demo 的 todo（成功，200）→ 再用一个**第三个用户**的角色（把 admin 换成普通用户语义的 token）试越权（403）。401、403、404 三种错误各有实物，鉴权就算真的懂了。

## 前端对应物

你在前端写过的这些，服务端对应物全在这篇里了：

| 前端 | 服务端 |
|------|--------|
| 登录页提交表单 | `POST /login` + bcrypt 比对 |
| token 存进 localStorage / 状态管理 | 签发 JWT（payload 带 sub/role/exp） |
| axios 拦截器统一塞 `Authorization` | 鉴权中间件统一验 token |
| 401 跳登录、403 提示无权限 | 中间件 401 / 业务层 403 |
| 按角色隐藏按钮 | RBAC 服务端强制判断 |

## 练习

1. 跑通第三关完整流程，包括三种错误路径（401 无 token、403 越权、404 不存在）。
2. 把你的 token 粘到 jwt.io 解开看 payload，找到 `sub`、`role`、`exp` 三个字段——亲眼确认「payload 只是编码」。
3. 改 payload 里一个字符再请求，观察 401——签名校验在工作。
4. 前端写一个登录页 + token 存取 + 401 拦截跳转，打 8021。至此你已经有一个完整的「登录可用」全栈应用了。

## 下一步

数据还在内存里，重启即蒸发。第 08 篇把它落到 MySQL：环境变量管连接串、SQL CRUD 对应内存 CRUD 的每一行、事务保证「转账不能有中间态」、Redis 把热数据挡在库外。
