# 05 HTTP 层：REST、CORS 与状态码信封

> 对应网站页签：🛠️ 全栈核心 → HTTP 层。数据源 `src/data/g5-fullstack-http.ts`、`g5-fullstack-map.ts`。

## 先说结论

前端转全栈，HTTP 层要建立四个认知：

1. `await fetch` 的另一端是一个函数，框架只是帮你把 method + path 绑上去。
2. 后端路由是资源不是动作，`/getTodos` 是前端思维残留。
3. CORS 报错是**浏览器**在拦，不是服务器；理解这一点，跨域问题就解决了九成。
4. 状态码 + 统一响应信封，是前端 `res.ok` 判断的服务端对应物。

## 从 fetch 到 Handler：一条链的两端

前端这条你写了无数遍：

```javascript
await fetch('/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '买牛奶' }),
});
```

后端的另一端，五门语言长这样（节选自网站「从 fetch 到 Handler」主题，源码 `g5-fullstack-http.ts`）：

```python
from pydantic import BaseModel

class CreateTodo(BaseModel):
    title: str

@app.post("/todos", status_code=201)
def create_todo(body: CreateTodo):
    return {"id": 1, "title": body.title, "done": False}
```

```javascript
app.post('/todos', (req, res) => {
  res.status(201).json({ id: 1, title: req.body.title, done: false });
});
```

```go
r.POST("/todos", func(c *gin.Context) {
    var body struct{ Title string `json:"title"` }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(201, gin.H{"id": 1, "title": body.Title, "done": false})
})
```

看 Go 那段：**绑定请求体这一步不会自动发生**。`ShouldBindJSON` 把 JSON 报文解析进结构体，失败要你自己返回 400。FastAPI 的 `body: CreateTodo` 参数和 Spring 的 `@RequestBody` 做的是同一件事，只是框架帮你做了校验和报错。**框架越「自动」，你越需要知道它替你做了什么**——这是从 Express（什么都要自己配）转到 FastAPI/Spring（什么都帮你做）时最容易翻车的地方。

## REST 资源与动词

前端路由是页面，后端路由是资源。同一份 `/todos`：

| 动词 | 路径 | 语义 | 成功状态码 |
|------|------|------|-----------|
| GET | `/todos` | 列表 | 200 |
| POST | `/todos` | 新建 | 201 |
| GET | `/todos/:id` | 详情 | 200 |
| PATCH | `/todos/:id` | 部分更新 | 200 |
| DELETE | `/todos/:id` | 删除 | 204 |

反例一眼识别：`POST /getTodos`、`POST /doDeleteTodo`——把动作写进 URL 是前端思维残留。**资源是名词，动词由 HTTP method 承担**。网站「REST 资源与动词」主题给了五语言的路由注册对照，五行五行地看，重点感受 URL 设计与语言无关。

为什么值得较真：REST 不是审美，是给前端省判断成本的约定。前端看到 POST 返回 201 就知道新资源已建，看到 204 就知道不用解析响应体——这些判断全靠两端共同遵守约定。

## 读一个请求：Path / Query / Header / Body

四个入口，各自的归属：

| 数据 | 前端写法 | 后端取法（Express 为例） |
|------|---------|------------------------|
| Path 参数 | `/todos/42` | `req.params.id` |
| Query | `?page=2&size=10` | `req.query.page` |
| Header | `Authorization: Bearer xxx` | `req.headers.authorization` |
| Body | `JSON.stringify({...})` | `req.body`（需 `express.json()` 中间件） |

Express 需要 `express.json()` 才有 `req.body`，FastAPI 的 Body 解析内建，Gin 用 `ShouldBindJSON`——又是「自动 vs 手动」的光谱。网站「读完一个请求」主题把这四个入口在五语言里的取法并排放好了。

## CORS：搞清楚谁在拦你

前端第一堵墙，但墙的位置 90% 的人说不清。事实是：

1. **浏览器**先发一个 `OPTIONS` 预检请求（当请求带自定义头、非简单 Content-Type、跨域时）。
2. 服务器如果响应里没有 `Access-Control-Allow-Origin` 等头，**浏览器**拒绝把响应交给你的 JS。
3. 服务器自己其实已经完整执行了你的请求——POST 甚至可能已经写库了。

所以「跨域报错」的正确翻译是：「服务器没告诉我浏览器它可以被跨域读取」。解决位置在**服务端**（或开发环境的代理），前端 `headers` 里加什么都没用。

Todo 和 JWT 实验室都开了 CORS，原理就是最朴素的中间件三行（Go 版，`labs/auth-todo-api/go-gin/main.go`）：

```go
c.Header("Access-Control-Allow-Origin", "*")
c.Header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
if c.Request.Method == http.MethodOptions {
    c.AbortWithStatus(204) // 预检请求直接短路
    return
}
```

注意 `Authorization` 必须出现在 `Allow-Headers` 里——这就是为什么不带 token 的简单请求有时不报 CORS、一加鉴权头就报：**带了自定义头，请求从「简单请求」升级成「需要预检的请求」**。你在前端调鉴权接口时莫名多出来的 OPTIONS 请求，来源就在这。

## 状态码与统一响应信封

前端 `res.ok` / `res.status` 的判断，服务端要负责给出**有意义**的状态码。网站「状态码与统一响应信封」主题的原则：

- 2xx 成功，201 新建，204 删除成功（无响应体）。
- 400 参数错，401 没登录，403 没权限，404 不存在，422 校验失败（FastAPI 的 pydantic 自动返回）。
- 5xx 服务器错——**永远不要把 5xx 当正常返回**，那是全局异常处理（第 09 篇）的失职。

统一信封是团队约定的常见形态：业务包一层 `{ code, message, data }`，HTTP 状态码表达传输层结果。两种风格（裸 REST vs 信封）各有拥趸，网站的态度是「先理解状态码语义，信封按团队规范来」。

## 练习

1. 打开 🛠️ 全栈核心页签 HTTP 层，五个主题读一遍。每读一个主题，回到第 04 篇跑着的 Hello/Todo 服务里找对应代码。
2. 用 curl 模拟浏览器预检：`curl -i -X OPTIONS http://localhost:8011/todos -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: POST"`，亲眼看到 `Access-Control-Allow-*` 响应头。
3. 故意 POST 一个缺 `title` 的请求体到 `8011/todos`，观察各语言实验室返回的 400/422 长什么样。

## 下一步

HTTP 层的图纸有了。下一篇把图纸变成实物：跑通 Todo CRUD 实验室，亲手用 curl 走完四个动词，再回头看内存 store 怎么写。
