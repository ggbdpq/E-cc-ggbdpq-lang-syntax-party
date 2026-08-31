import type { Category } from './types';

export const fullstackHttp: Category = {
  id: 'fs-http',
  title: { zh: 'HTTP 入口：前端发出去的那一下', en: 'HTTP: the fetch you already write' },
  topics: [
    {
      id: 'fs-fetch-handler',
      title: { zh: '从 fetch 到 Handler', en: 'From fetch to handler' },
      description: {
        zh: '前端 await fetch 的另一端，就是一个函数。框架只是帮你把 method + path 绑到这个函数上。',
        en: 'The other side of await fetch is a function. A framework only binds method + path onto that function.',
      },
      snippets: {
        python: `# 前端：
# await fetch('/todos', { method: 'POST',
#   headers: { 'Content-Type': 'application/json' },
#   body: JSON.stringify({ title: '买牛奶' }) })

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class CreateTodo(BaseModel):
    title: str

@app.post("/todos", status_code=201)
def create_todo(body: CreateTodo):
    return {"id": 1, "title": body.title, "done": False}`,
        javascript: `// 前端同一条 fetch，后端就是一个回调
const express = require('express');
const app = express();
app.use(express.json());

app.post('/todos', (req, res) => {
  res.status(201).json({
    id: 1,
    title: req.body.title,
    done: false,
  });
});

app.listen(8012);`,
        java: `// Spring：注解把 HTTP 绑到方法，返回值自动变 JSON
@RestController
@RequestMapping("/todos")
public class TodoController {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, String> body) {
        Map<String, Object> todo = new LinkedHashMap<>();
        todo.put("id", 1);
        todo.put("title", body.get("title"));
        todo.put("done", false);
        return todo;
    }
}`,
        go: `r := gin.Default()
r.POST("/todos", func(c *gin.Context) {
    var body struct{ Title string \`json:"title"\` }
    if err := c.ShouldBindJSON(&body); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(201, gin.H{"id": 1, "title": body.Title, "done": false})
})
r.Run(":8013")`,
        rust: `#[derive(Deserialize)]
struct CreateTodo { title: String }

#[derive(Serialize)]
struct Todo { id: u64, title: String, done: bool }

async fn create(Json(body): Json<CreateTodo>) -> (StatusCode, Json<Todo>) {
    (StatusCode::CREATED, Json(Todo { id: 1, title: body.title, done: false }))
}

let app = Router::new().route("/todos", post(create));`,
      },
    },
    {
      id: 'fs-rest',
      title: { zh: 'REST 资源与动词', en: 'REST resources and verbs' },
      description: {
        zh: '前端路由是页面，后端路由是资源。同一份 /todos，用动词区分读和写，不要发明 /getTodos /doDelete。',
        en: 'Frontend routes are pages. Backend routes are resources. Same /todos, verbs distinguish read vs write. Do not invent /getTodos.',
      },
      snippets: {
        python: `# 资源：待办    集合 /todos     单个 /todos/{id}
@app.get("/todos")                  # 列表
@app.post("/todos")                 # 新建
@app.get("/todos/{id}")             # 详情
@app.patch("/todos/{id}")           # 部分更新（完成/改标题）
@app.delete("/todos/{id}")          # 删除

# 反例（前端思维残留）：
# POST /getTodos   POST /doDeleteTodo   GET /createTodo`,
        javascript: `app.get('/todos', listTodos);
app.post('/todos', createTodo);
app.get('/todos/:id', getTodo);
app.patch('/todos/:id', patchTodo);
app.delete('/todos/:id', deleteTodo);

// 集合用复数，动作放 HTTP 动词里
// 筛选用查询参数：GET /todos?done=false`,
        java: `@RestController
@RequestMapping("/todos")
public class TodoController {
    @GetMapping                 public List<Todo> list() {}
    @PostMapping                public Todo create(@RequestBody TodoIn in) {}
    @GetMapping("/{id}")        public Todo get(@PathVariable Long id) {}
    @PatchMapping("/{id}")      public Todo patch(@PathVariable Long id, @RequestBody TodoPatch p) {}
    @DeleteMapping("/{id}")     public void delete(@PathVariable Long id) {}
}`,
        go: `r.GET("/todos", listTodos)
r.POST("/todos", createTodo)
r.GET("/todos/:id", getTodo)
r.PATCH("/todos/:id", patchTodo)
r.DELETE("/todos/:id", deleteTodo)

// Gin 的 :id 就是前端路由里的 params.id`,
        rust: `Router::new()
    .route("/todos", get(list).post(create))
    .route("/todos/{id}", get(get_one).patch(patch).delete(remove))

// Axum 0.8 路径参数用 {id}，不是 :id`,
      },
    },
    {
      id: 'fs-read-request',
      title: { zh: '读完一个请求：Path / Query / Header / Body', en: 'Read a request: path, query, header, body' },
      description: {
        zh: '对应前端的 params、searchParams、headers、JSON.stringify。四种来源不要混着塞进 body。',
        en: 'Maps to frontend params, searchParams, headers, JSON.stringify. Do not dump all four into the body.',
      },
      snippets: {
        python: `# GET /todos/42?done=false
# Authorization: Bearer xxx
# { "title": "买牛奶" }

@app.patch("/todos/{todo_id}")
def patch_todo(
    todo_id: int,                          # Path
    done: bool | None = None,              # Query ?done=
    authorization: str | None = Header(None),
    body: TodoPatch | None = None,         # JSON body
):
    return {"id": todo_id, "done": done, "title": body.title if body else None}`,
        javascript: `app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id);          // Path
  const done = req.query.done;               // Query，永远是字符串
  const token = req.headers.authorization;   // Header
  const title = req.body.title;              // Body，需 express.json()
  res.json({ id, done, token, title });
});`,
        java: `@PatchMapping("/todos/{id}")
public Todo patch(
        @PathVariable Long id,
        @RequestParam(required = false) Boolean done,
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestBody(required = false) TodoPatch body) {
    return todoService.patch(id, done, body);
}`,
        go: `r.PATCH("/todos/:id", func(c *gin.Context) {
    id := c.Param("id")
    done := c.Query("done")
    token := c.GetHeader("Authorization")
    var body TodoPatch
    c.ShouldBindJSON(&body)
    c.JSON(200, gin.H{"id": id, "done": done, "token": token, "title": body.Title})
})`,
        rust: `#[derive(Deserialize)]
struct Q { done: Option<bool> }
#[derive(Deserialize)]
struct Body { title: Option<String> }

async fn patch(
    Path(id): Path<u64>,
    Query(q): Query<Q>,
    TypedHeader(auth): TypedHeader<Authorization<Bearer>>,
    Json(body): Json<Body>,
) -> Json<Value> {
    Json(json!({"id": id, "done": q.done, "sub": auth.token(), "title": body.title}))
}`,
      },
    },
    {
      id: 'fs-cors',
      title: { zh: 'CORS：前端第一堵墙', en: 'CORS: the first wall' },
      description: {
        zh: 'localhost:3000 打 localhost:8011 就是跨域。浏览器拦的是响应，不是请求发不出去。必须服务端放行。',
        en: 'localhost:3000 calling localhost:8011 is cross-origin. The browser blocks the response. The server must allow it.',
      },
      snippets: {
        python: `from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 学习期可用 ["*"]
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    allow_credentials=True,  # 和 * 不能同时用
)

# 带 cookie 时：前端 fetch 必须 credentials: 'include'`,
        javascript: `app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204); // 预检
  next();
});

// 生产用 cors 包，不要手写漏 OPTIONS`,
        java: `// 开发期：控制器或全局配置
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class TodoController {}

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/**")
         .allowedOrigins("http://localhost:3000")
         .allowedMethods("GET", "POST", "PATCH", "DELETE", "OPTIONS")
         .allowedHeaders("Content-Type", "Authorization");
    }
}`,
        go: `r.Use(func(c *gin.Context) {
    c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
    c.Header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
    c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
    if c.Request.Method == http.MethodOptions {
        c.AbortWithStatus(204)
        return
    }
    c.Next()
})`,
        rust: `async fn cors(req: Request, next: Next) -> Response {
    if req.method() == Method::OPTIONS {
        let mut res = Response::new(Body::empty());
        *res.status_mut() = StatusCode::NO_CONTENT;
        res.headers_mut().insert(ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000".parse().unwrap());
        res.headers_mut().insert(ACCESS_CONTROL_ALLOW_METHODS, "GET,POST,PATCH,DELETE,OPTIONS".parse().unwrap());
        res.headers_mut().insert(ACCESS_CONTROL_ALLOW_HEADERS, "Content-Type,Authorization".parse().unwrap());
        return res;
    }
    let mut res = next.run(req).await;
    res.headers_mut().insert(ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000".parse().unwrap());
    res
}`,
      },
    },
    {
      id: 'fs-status',
      title: { zh: '状态码与统一响应信封', en: 'Status codes and response envelope' },
      description: {
        zh: '前端 if (!res.ok) 依赖的是 HTTP 状态码。业务错误不要全用 200 + {code:500}。信封给前端稳定字段。',
        en: 'Frontend if (!res.ok) depends on HTTP status. Do not hide business errors as 200 + {code:500}. The envelope gives the UI stable fields.',
      },
      snippets: {
        python: `def ok(data):
    return {"code": 0, "message": "ok", "data": data}

@app.get("/todos/{id}")
def get_todo(id: int):
    item = store.get(id)
    if not item:
        raise HTTPException(404, detail="todo not found")  # 真 404
    return ok(item)

# 201 创建  204 删除无 body  400 参数  401 未登录  403 没权限  409 冲突`,
        javascript: `const ok = (data) => ({ code: 0, message: 'ok', data });
const fail = (code, message) => ({ code, message, data: null });

app.get('/todos/:id', (req, res) => {
  const item = store.get(Number(req.params.id));
  if (!item) return res.status(404).json(fail(404, 'todo not found'));
  res.json(ok(item));
});

app.delete('/todos/:id', (req, res) => res.status(204).end());`,
        java: `public class Result<T> {
    private int code;
    private String message;
    private T data;
    public static <T> Result<T> ok(T data) { return new Result<>(0, "ok", data); }
    public static <T> Result<T> fail(int code, String message) { return new Result<>(code, message, null); }
}

@GetMapping("/{id}")
public Result<Todo> get(@PathVariable Long id) {
    Todo todo = store.get(id);
    if (todo == null) throw new NotFoundException("todo not found"); // 全局异常转 404
    return Result.ok(todo);
}`,
        go: `type Result struct {
    Code    int         \`json:"code"\`
    Message string      \`json:"message"\`
    Data    interface{} \`json:"data"\`
}

func Success(data interface{}) Result { return Result{0, "ok", data} }
func Fail(code int, msg string) Result { return Result{code, msg, nil} }

c.JSON(404, Fail(404, "todo not found"))
c.Status(204)`,
        rust: `#[derive(Serialize)]
struct Result<T> { code: i32, message: &'static str, data: Option<T> }

fn ok<T: Serialize>(data: T) -> Json<Result<T>> {
    Json(Result { code: 0, message: "ok", data: Some(data) })
}

async fn get_one(Path(id): Path<u64>) -> Result<Json<Result<Todo>>, (StatusCode, Json<Result<()>>)> {
    store.get(id).map(ok).ok_or((StatusCode::NOT_FOUND, Json(Result { code: 404, message: "todo not found", data: None })))
}`,
      },
    },
  ],
};
