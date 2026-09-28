# 06 Todo CRUD 实验室：四个动词的完整链路

> 对应网站页签：🧪 动手实验室 → 第二关；源码 `labs/todo-api/`。网站数据源 `src/data/g4-labs.ts` 的 `todoRunbook`。

## 先说结论

前端表格背后的四个动词——列表、创建、改、删——在服务端就是四个路由函数加一个内存数组。这一篇带你跑通 Todo 实验室（端口 8011–8015），并读懂内存 CRUD 的标准写法。跑通它的意义在于：**你后面换 MySQL、加 Redis、加鉴权，改的都是这个骨架的某一块，骨架本身不再变**。

## 契约先行

五个实验室共用这一份契约（不依赖任何数据库，内存存储，已开 CORS）：

| 方法 | 路径 | 请求体 | 成功 |
|------|------|--------|------|
| GET | `/todos` | | `{ "items": Todo[] }` |
| POST | `/todos` | `{ "title": string }` | 201 + Todo |
| PATCH | `/todos/:id` | `{ "title"?, "done"? }` | 200 + Todo |
| DELETE | `/todos/:id` | | 204 |
| GET | `/health` | | `{ "status": "ok" }` |

Todo 的形状：`{ "id": number, "title": string, "done": boolean }`。

## 跑通四个动词（curl 全流程）

以 8011（FastAPI）为例，其他端口换数字即可：

```bash
cd labs/todo-api/python-fastapi
python -m uvicorn main:app --port 8011

# 健康检查
curl http://localhost:8011/health

# 创建
curl -X POST http://localhost:8011/todos -H "Content-Type: application/json" -d "{\"title\":\"买牛奶\"}"

# 列表
curl http://localhost:8011/todos

# 改完成（注意 PATCH 不是 PUT）
curl -X PATCH http://localhost:8011/todos/1 -H "Content-Type: application/json" -d "{\"done\":true}"

# 删除（204，无响应体）
curl -i -X DELETE http://localhost:8011/todos/1
```

Windows PowerShell 用户别用 `curl -d "{\"...\"}"`，引号会被吃掉，改用（这套写法在 JWT 实验室 README 里也备了）：

```powershell
Invoke-RestMethod http://localhost:8011/todos -Method POST -ContentType 'application/json' -Body '{"title":"买牛奶"}'
```

跑完一轮，你已经完成了后端工程师一天里最核心的动作：**用 curl 验证契约**。

## 内存 CRUD 长什么样

五语言实现都在 50–140 行之间。看 Python 版的骨架（`labs/todo-api/python-fastapi/main.py` 节选）：

```python
_todos: list[dict] = []

@app.post("/todos", status_code=201)
def create_todo(body: CreateIn):
    item = {"id": next(_ids), "title": body.title, "done": False}
    _todos.append(item)
    return item

@app.patch("/todos/{todo_id}")
def patch_todo(todo_id: int, body: PatchIn):
    item = _find(todo_id)
    if item is None:
        raise HTTPException(404, "todo not found")
    if body.done is not None:
        item["done"] = body.done
    return item
```

对照 Go 版（`labs/todo-api/go-gin/main.go` 节选）：

```go
var (
    mu    sync.Mutex
    todos = []Todo{}
)

func patchTodo(c *gin.Context) {
    mu.Lock()
    defer mu.Unlock()
    ...
}
```

三个值得咀嚼的差异：

1. **并发安全谁负责**：FastAPI 的 uvicorn 默认多 worker 但处理函数是异步的，这个 demo 够用；Go 是真并发，必须 `sync.Mutex` 锁住共享的 `todos` 切片——**内存存储一换并发模型，「全局变量 + 锁」的问题立刻现形**。这不是实验室偷懒，是刻意让你在数据量小的时候看见并发问题。
2. **PATCH 的部分更新语义**：`body.done is not None` 才改——「没传的字段不动」。换成 PUT 就得整对象覆盖。前端调 PATCH 时只传变化字段的习惯，背后是服务端的这种判断。
3. **404 从哪来**：`_find` 找不到就抛/返回 404 `todo not found`。记住这个形态，第 09 篇的全局异常处理就是把这个 if 换成统一出口。

## 从前端视角再走一遍

现在写一个最小前端页面打它（网站 localhost:3000 与实验室同源跨端口，CORS 已开）：

```javascript
const list = await (await fetch('http://localhost:8011/todos')).json();

await fetch('http://localhost:8011/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: '买牛奶' }),
});

await fetch('http://localhost:8011/todos/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ done: true }),
});

await fetch('http://localhost:8011/todos/1', { method: 'DELETE' });
```

这四段你全写过。区别只是 URL 从相对路径变成了带端口的绝对路径。**前后端分离开发的本质：前端多打一个 origin，后端多开一个 CORS 头。**

## 常见坑

- **端口串了**：五个服务长得一模一样，8012 上创建的 todo 在 8011 查不到（各自独立内存）。响应没有 language 字段帮你区分（Hello 实验室有），靠端口区分，启动时贴张纸条。
- **id 从 1 开始**：每次重启服务内存清空，id 重新从 1 计数。curl 报 404 `todo not found` 先想想是不是重启过。
- **DELETE 用 `-i` 看 204**：204 没有响应体，别在代码里写 `res.json()`，会抛异常。

## 练习

1. 五个端口全部跑通四个动词。建议顺序：先用最熟的一门，再用最不熟的一门。
2. 前端写一个 50 行的 todo 页面（表格 + 输入框）打 8011，完成你人生第一个全栈闭环。
3. 读 `labs/todo-api/rust-axum/src/main.rs`（135 行），对照网站实验室页签的并排源码。Rust 版是这个实验室里最长的，感受一下「没有 GC 的语言写 CRUD」多了哪些代码、换来的是什么。
4. 改造练习：给 PATCH 加「done 不能改别人的（当然现在没有用户系统）」这种业务规则是第 07 篇的事——但你可以先给 POST 加个「title 非空且不超过 50 字」的校验，五个语言各写一遍，体会校验代码放哪一层。

## 下一步

现在所有 todo 是公共的，谁都能看能删。下一篇上 JWT：登录发 token、中间件拦请求、401 和 403 到底什么时候返回——把实验室升级成 auth-todo-api（8021–8025）。
