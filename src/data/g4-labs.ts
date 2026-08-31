import type { Category, GuideCategory, LangId } from './types';

export interface HelloLab {
  lang: LangId;
  dir: string;
  framework: string;
  port: number;
  start: string;
  entry: string;
}

/** 可运行实验室清单。scripts/check-labs.mjs 按 entry 校验文件存在。 */
export const HELLO_LABS: HelloLab[] = [
  {
    lang: 'python',
    dir: 'python-fastapi',
    framework: 'FastAPI',
    port: 8001,
    start: 'python -m uvicorn main:app --port 8001',
    entry: 'labs/hello-api/python-fastapi/main.py',
  },
  {
    lang: 'javascript',
    dir: 'node-express',
    framework: 'Express',
    port: 8002,
    start: 'npm start',
    entry: 'labs/hello-api/node-express/index.js',
  },
  {
    lang: 'go',
    dir: 'go-gin',
    framework: 'Gin',
    port: 8003,
    start: 'go run .',
    entry: 'labs/hello-api/go-gin/main.go',
  },
  {
    lang: 'rust',
    dir: 'rust-axum',
    framework: 'Axum',
    port: 8004,
    start: 'cargo run',
    entry: 'labs/hello-api/rust-axum/src/main.rs',
  },
  {
    lang: 'java',
    dir: 'java-springboot',
    framework: 'Spring Boot',
    port: 8005,
    start: 'mvn -s settings-aliyun.xml package -DskipTests && java -jar target/hello-springboot-0.0.1.jar',
    entry: 'labs/hello-api/java-springboot/src/main/java/com/example/hello/HelloApplication.java',
  },
];

export const TODO_LABS: HelloLab[] = [
  {
    lang: 'python',
    dir: 'python-fastapi',
    framework: 'FastAPI',
    port: 8011,
    start: 'python -m uvicorn main:app --port 8011',
    entry: 'labs/todo-api/python-fastapi/main.py',
  },
  {
    lang: 'javascript',
    dir: 'node-express',
    framework: 'Express',
    port: 8012,
    start: 'npm start',
    entry: 'labs/todo-api/node-express/index.js',
  },
  {
    lang: 'go',
    dir: 'go-gin',
    framework: 'Gin',
    port: 8013,
    start: 'go run .',
    entry: 'labs/todo-api/go-gin/main.go',
  },
  {
    lang: 'rust',
    dir: 'rust-axum',
    framework: 'Axum',
    port: 8014,
    start: 'cargo run',
    entry: 'labs/todo-api/rust-axum/src/main.rs',
  },
  {
    lang: 'java',
    dir: 'java-springboot',
    framework: 'Spring Boot',
    port: 8015,
    start: 'mvn -s settings-aliyun.xml package -DskipTests && java -jar target/todo-springboot-0.0.1.jar',
    entry: 'labs/todo-api/java-springboot/src/main/java/com/example/todo/TodoApplication.java',
  },
];

export const AUTH_LABS: HelloLab[] = [
  {
    lang: 'python',
    dir: 'python-fastapi',
    framework: 'FastAPI',
    port: 8021,
    start: 'python -m uvicorn main:app --port 8021',
    entry: 'labs/auth-todo-api/python-fastapi/main.py',
  },
  {
    lang: 'javascript',
    dir: 'node-express',
    framework: 'Express',
    port: 8022,
    start: 'npm start',
    entry: 'labs/auth-todo-api/node-express/index.js',
  },
  {
    lang: 'go',
    dir: 'go-gin',
    framework: 'Gin',
    port: 8023,
    start: 'go run .',
    entry: 'labs/auth-todo-api/go-gin/main.go',
  },
  {
    lang: 'rust',
    dir: 'rust-axum',
    framework: 'Axum',
    port: 8024,
    start: 'cargo run',
    entry: 'labs/auth-todo-api/rust-axum/src/main.rs',
  },
  {
    lang: 'java',
    dir: 'java-springboot',
    framework: 'Spring Boot',
    port: 8025,
    start: 'mvn -s settings-aliyun.xml package -DskipTests && java -jar target/auth-todo-springboot-0.0.1.jar',
    entry: 'labs/auth-todo-api/java-springboot/src/main/java/com/example/authtodo/AuthTodoApplication.java',
  },
];

export const labStartGuide: GuideCategory = {
  id: 'lab-start',
  title: { zh: '怎么跑起来', en: 'How to run' },
  topics: [
    {
      id: 'lab-commands',
      title: { zh: '五个服务的启动命令', en: 'Start commands for five servers' },
      description: {
        zh: '在 syntax-party/labs/hello-api/<目录> 下执行。验证：curl http://localhost:800X/hello',
        en: 'Run inside syntax-party/labs/hello-api/<dir>. Verify with curl http://localhost:800X/hello',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: '#a1a1aa',
      code: `# Python FastAPI :8001
cd python-fastapi
python -m uvicorn main:app --port 8001

# Node Express :8002
cd node-express
npm install
npm start

# Go Gin :8003
cd go-gin
go run .

# Rust Axum :8004
cd rust-axum
cargo run

# Java Spring Boot :8005
cd java-springboot
mvn -s settings-aliyun.xml package -DskipTests
java -jar target/hello-springboot-0.0.1.jar`,
    },
  ],
};

export const labRunbook: Category = {
  id: 'lab-runbook',
  title: { zh: '动手：五语言 Hello API', en: 'Lab: Five-language Hello API' },
  topics: [
    {
      id: 'hello-get',
      title: { zh: 'GET /hello 同一份契约', en: 'GET /hello, one contract' },
      description: {
        zh: '返回 { message, language, framework }。源码在 labs/hello-api/，端口 8001–8005。这就是原来 backend/frame 的全部学习价值。',
        en: 'Returns { message, language, framework }. Source lives in labs/hello-api/, ports 8001–8005. This is the learning value of the former backend/frame tree.',
      },
      snippets: {
        python: `from fastapi import FastAPI

app = FastAPI(title="Python FastAPI - Hello")

@app.get("/hello")
def hello():
    return {"message": "Hello World", "language": "Python", "framework": "FastAPI"}

# 启动：python -m uvicorn main:app --port 8001`,
        javascript: `const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World', language: 'Node.js', framework: 'Express' });
});

app.listen(8002);`,
        java: `@SpringBootApplication
@RestController
public class HelloApplication {
    public static void main(String[] args) {
        SpringApplication.run(HelloApplication.class, args);
    }

    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("message", "Hello World");
        body.put("language", "Java");
        body.put("framework", "Spring Boot");
        return body;
    }
}
// server.port=8005  （JDK 8 + Spring Boot 2.7.18）`,
        go: `func main() {
    r := gin.Default()
    r.GET("/hello", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message":   "Hello World",
            "language":  "Go",
            "framework": "Gin",
        })
    })
    r.Run(":8003")
}`,
        rust: `#[derive(Serialize)]
struct HelloResponse {
    message: &'static str,
    language: &'static str,
    framework: &'static str,
}

async fn hello() -> Json<HelloResponse> {
    Json(HelloResponse {
        message: "Hello World",
        language: "Rust",
        framework: "Axum",
    })
}

#[tokio::main]
async fn main() {
    let app = Router::new().route("/hello", get(hello));
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8004").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}`,
      },
    },
  ],
};

export const todoStartGuide: GuideCategory = {
  id: 'todo-start',
  title: { zh: '第二关：Todo CRUD', en: 'Level 2: Todo CRUD' },
  topics: [
    {
      id: 'todo-commands',
      title: { zh: '五个 Todo 服务的启动命令', en: 'Start commands for five Todo servers' },
      description: {
        zh: '在 syntax-party/labs/todo-api/<目录> 下执行。契约：GET/POST /todos，PATCH/DELETE /todos/:id。验证：curl http://localhost:801X/health',
        en: 'Run inside syntax-party/labs/todo-api/<dir>. Contract: GET/POST /todos, PATCH/DELETE /todos/:id. Verify with curl http://localhost:801X/health',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: '#a1a1aa',
      code: `# Python FastAPI :8011
cd python-fastapi
python -m uvicorn main:app --port 8011

# Node Express :8012
cd node-express
npm install
npm start

# Go Gin :8013
cd go-gin
go run .

# Rust Axum :8014
cd rust-axum
cargo run

# Java Spring Boot :8015
cd java-springboot
mvn -s settings-aliyun.xml package -DskipTests
java -jar target/todo-springboot-0.0.1.jar

# 浏览器或 curl 走完整 CRUD
curl -X POST http://localhost:8011/todos -H "Content-Type: application/json" -d "{\\"title\\":\\"买牛奶\\"}"
curl http://localhost:8011/todos
curl -X PATCH http://localhost:8011/todos/1 -H "Content-Type: application/json" -d "{\\"done\\":true}"
curl -X DELETE http://localhost:8011/todos/1`,
    },
  ],
};

export const authStartGuide: GuideCategory = {
  id: 'auth-start',
  title: { zh: '第三关：JWT 登录 + 受保护的 Todo', en: 'Level 3: JWT login + protected Todo' },
  topics: [
    {
      id: 'auth-commands',
      title: { zh: '五个 JWT Todo 服务的启动命令', en: 'Start commands for five JWT Todo servers' },
      description: {
        zh: '在 syntax-party/labs/auth-todo-api/<目录> 下执行。账号 demo/admin，密码都是 password。无 token 打 /todos 期望 401。',
        en: 'Run inside syntax-party/labs/auth-todo-api/<dir>. Accounts demo/admin, password is password. Hitting /todos without a token should return 401.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: '#a1a1aa',
      code: `# Python FastAPI :8021
cd python-fastapi
python -m uvicorn main:app --port 8021

# Node Express :8022
cd node-express
npm install
npm start

# Go Gin :8023
cd go-gin
go run .

# Rust Axum :8024
cd rust-axum
cargo run

# Java Spring Boot :8025
cd java-springboot
mvn -s settings-aliyun.xml package -DskipTests
java -jar target/auth-todo-springboot-0.0.1.jar

# 登录拿 token，再打受保护接口
curl http://localhost:8021/health
curl -i http://localhost:8021/todos
TOKEN=$(curl -s -X POST http://localhost:8021/login -H "Content-Type: application/json" -d "{\\"username\\":\\"demo\\",\\"password\\":\\"password\\"}" | python -c "import sys,json; print(json.load(sys.stdin)['token'])")
curl http://localhost:8021/me -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:8021/todos -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\\"title\\":\\"买牛奶\\"}"
curl http://localhost:8021/todos -H "Authorization: Bearer $TOKEN"`,
    },
  ],
};

export const todoRunbook: Category = {
  id: 'todo-runbook',
  title: { zh: '动手：五语言 Todo CRUD', en: 'Lab: Five-language Todo CRUD' },
  topics: [
    {
      id: 'todo-crud',
      title: { zh: '同一份契约：列表 / 创建 / 改完成 / 删除', en: 'One contract: list / create / patch / delete' },
      description: {
        zh: '内存存储，已开 CORS，网站 localhost:3000 可直接 fetch。这是全栈核心页「内存 CRUD」的可运行版本：先跑通四个动词，再把 store 换成 SQL。',
        en: 'In-memory store with CORS on, so localhost:3000 can fetch it. This is the runnable version of Full-stack Core "memory CRUD": four verbs first, then swap the store for SQL.',
      },
      snippets: {
        python: `_todos: list[dict] = []

@app.get("/todos")
def list_todos():
    return {"items": _todos}

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

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    _todos.remove(_find(todo_id))
    return Response(status_code=204)

# 启动：python -m uvicorn main:app --port 8011`,
        javascript: `let seq = 1;
const todos = [];

app.get('/todos', (_req, res) => res.json({ items: todos }));

app.post('/todos', (req, res) => {
  const item = { id: seq++, title: req.body.title, done: false };
  todos.push(item);
  res.status(201).json(item);
});

app.patch('/todos/:id', (req, res) => {
  const item = todos.find((t) => t.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'todo not found' });
  if (typeof req.body.done === 'boolean') item.done = req.body.done;
  res.json(item);
});

app.delete('/todos/:id', (req, res) => {
  const i = todos.findIndex((t) => t.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ error: 'todo not found' });
  todos.splice(i, 1);
  res.status(204).end();
});

app.listen(8012);`,
        java: `@GetMapping("/todos")
public Map<String, Object> list() {
    Map<String, Object> body = new LinkedHashMap<String, Object>();
    body.put("items", new ArrayList<Todo>(store.values()));
    return body;
}

@PostMapping("/todos")
public ResponseEntity<Todo> create(@RequestBody CreateIn in) {
    Todo item = new Todo(seq.getAndIncrement(), in.title, false);
    store.put(item.id, item);
    return ResponseEntity.status(HttpStatus.CREATED).body(item);
}

@PatchMapping("/todos/{id}")
public Todo patch(@PathVariable Long id, @RequestBody PatchIn in) {
    Todo item = store.get(id);
    if (item == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    if (in.done != null) item.done = in.done;
    return item;
}

@DeleteMapping("/todos/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    store.remove(id);
    return ResponseEntity.noContent().build();
}
// server.port=8015`,
        go: `r.GET("/todos", func(c *gin.Context) {
    c.JSON(http.StatusOK, gin.H{"items": todos})
})
r.POST("/todos", func(c *gin.Context) {
    item := Todo{ID: seq, Title: body.Title, Done: false}
    seq++
    todos = append(todos, item)
    c.JSON(http.StatusCreated, item)
})
r.PATCH("/todos/:id", func(c *gin.Context) {
    i := findIndex(id)
    if body.Done != nil { todos[i].Done = *body.Done }
    c.JSON(http.StatusOK, todos[i])
})
r.DELETE("/todos/:id", func(c *gin.Context) {
    todos = append(todos[:i], todos[i+1:]...)
    c.Status(http.StatusNoContent)
})
r.Run(":8013")`,
        rust: `async fn list(State(st): State<Arc<App>>) -> Json<Value> {
    Json(json!({ "items": st.todos.lock().unwrap().clone() }))
}

async fn create(State(st): State<Arc<App>>, Json(body): Json<CreateIn>)
    -> (StatusCode, Json<Todo>) {
    let item = Todo { id: next_id, title: body.title, done: false };
    st.todos.lock().unwrap().push(item.clone());
    (StatusCode::CREATED, Json(item))
}

async fn patch_todo(Path(id): Path<i64>, Json(body): Json<PatchIn>)
    -> Result<Json<Todo>, StatusCode> {
    let item = todos.iter_mut().find(|t| t.id == id).ok_or(StatusCode::NOT_FOUND)?;
    if let Some(done) = body.done { item.done = done; }
    Ok(Json(item.clone()))
}

async fn delete_todo(Path(id): Path<i64>) -> StatusCode {
    todos.retain(|t| t.id != id);
    StatusCode::NO_CONTENT
}
// bind 0.0.0.0:8014`,
      },
    },
  ],
};

export const authRunbook: Category = {
  id: 'auth-runbook',
  title: { zh: '动手：五语言 JWT + 受保护 Todo', en: 'Lab: Five-language JWT + protected Todo' },
  topics: [
    {
      id: 'auth-jwt',
      title: { zh: '同一份契约：登录发 token，中间件拦 /todos', en: 'One contract: login issues a token, middleware guards /todos' },
      description: {
        zh: 'HS256 密钥 syntax-party-jwt-lab。demo 只能动自己的 Todo；admin 能看全部，也能改别人的。这是全栈核心第 4 天的可 curl 版本。',
        en: 'HS256 secret syntax-party-jwt-lab. demo can only touch their own todos; admin can see all and edit others. This is the curlable version of Full-stack Core day 4.',
      },
      snippets: {
        python: `SECRET = "syntax-party-jwt-lab"

def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "unauthorized")
    payload = jwt.decode(authorization[7:], SECRET, algorithms=["HS256"])
    return _user_by_id(int(payload["sub"]))

@app.post("/login")
def login(body: LoginIn):
    user = _find_user(body.username)
    if user is None or not bcrypt.checkpw(body.password.encode(), user["password_hash"]):
        raise HTTPException(401, "invalid credentials")
    token = jwt.encode({"sub": str(user["id"]), "role": user["role"], "exp": ...}, SECRET)
    return {"token": token, "user": _public_user(user)}

@app.get("/todos")
def list_todos(user: dict = Depends(current_user)):
    items = _todos if user["role"] == "admin" else [t for t in _todos if t["ownerId"] == user["id"]]
    return {"items": items}
# 启动：python -m uvicorn main:app --port 8021`,
        javascript: `const SECRET = 'syntax-party-jwt-lab';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const payload = jwt.verify(header.slice(7), SECRET);
  req.user = users.find((u) => u.id === Number(payload.sub));
  next();
}

app.post('/login', (req, res) => {
  const user = users.find((u) => u.username === req.body.username);
  if (!user || !bcrypt.compareSync(req.body.password, user.passwordHash)) {
    return res.status(401).json({ error: 'invalid credentials' });
  }
  const token = jwt.sign({ sub: String(user.id), role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token, user: publicUser(user) });
});

app.get('/todos', requireAuth, (req, res) => {
  const items = req.user.role === 'admin' ? todos : todos.filter((t) => t.ownerId === req.user.id);
  res.json({ items });
});
// listen 8022`,
        java: `@PostMapping("/login")
public Map<String, Object> login(@RequestBody LoginIn in) {
    User user = findByName(in.username);
    if (user == null || !encoder.matches(in.password, user.passwordHash)) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid credentials");
    }
    String token = Jwts.builder()
        .setSubject(String.valueOf(user.id))
        .claim("role", user.role)
        .signWith(SignatureAlgorithm.HS256, SECRET.getBytes())
        .compact();
    body.put("token", token);
    return body;
}

public boolean preHandle(HttpServletRequest request, ...) {
    Claims claims = Jwts.parser().setSigningKey(SECRET.getBytes())
        .parseClaimsJws(header.substring(7)).getBody();
    request.setAttribute("authUser", findById(Long.valueOf(claims.getSubject())));
    return true;
}
// server.port=8025`,
        go: `r.POST("/login", func(c *gin.Context) {
    user := findUserByName(body.Username)
    if user == nil || bcrypt.CompareHashAndPassword(user.PasswordHash, []byte(body.Password)) != nil {
        c.JSON(401, gin.H{"error": "invalid credentials"})
        return
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "sub": strconv.Itoa(user.ID), "role": user.Role,
        "exp": time.Now().Add(time.Hour).Unix(),
    })
    signed, _ := token.SignedString([]byte(secret))
    c.JSON(200, gin.H{"token": signed, "user": publicUser(*user)})
})

auth := r.Group("/")
auth.Use(jwtAuth())
auth.GET("/todos", func(c *gin.Context) {
    user := currentUser(c)
    // admin 看全部，demo 只看 ownerId == user.ID
    c.JSON(200, gin.H{"items": items})
})
r.Run(":8023")`,
        rust: `async fn auth(State(st): State<Arc<App>>, mut req: Request, next: Next)
    -> Result<Response, ApiError> {
    let token = header[7..].trim();
    let data = decode::<Claims>(token, &DecodingKey::from_secret(SECRET), &Validation::new(Algorithm::HS256))?;
    req.extensions_mut().insert(AuthUser { id, role, .. });
    Ok(next.run(req).await)
}

async fn login(State(st): State<Arc<App>>, Json(body): Json<LoginIn>)
    -> Result<Json<Value>, ApiError> {
    if !bcrypt::verify(&body.password, &user.password_hash).unwrap_or(false) {
        return Err(api_err(StatusCode::UNAUTHORIZED, "invalid credentials"));
    }
    let token = encode(&Header::new(Algorithm::HS256), &claims, &EncodingKey::from_secret(SECRET))?;
    Ok(Json(json!({ "token": token, "user": { "id": user.id, "role": user.role } })))
}

async fn list(Extension(user): Extension<AuthUser>) -> Json<Value> {
    Json(json!({ "items": items }))
}
// bind 0.0.0.0:8024`,
      },
    },
  ],
};

export const labArchitecture: Category = {
  id: 'lab-architecture',
  title: { zh: '案例课：BFF + Worker（来自音频项目）', en: 'Case study: BFF + Worker' },
  topics: [
    {
      id: 'bff-worker',
      title: { zh: '同一契约，两层服务', en: 'One contract, two layers' },
      description: {
        zh: '原 AI 音频编辑是四语言等价实现：小程序 → 8087 BFF（鉴权/MySQL/Redis）→ 8088 Worker（ffmpeg/COS）。产品仓依赖云账号和中间件，不适合塞进语法站；把分层边界留下当课。Rust 原仓没有，这里补一版同结构草稿。',
        en: 'The audio editor was a four-language equivalent: miniapp → 8087 BFF (auth/MySQL/Redis) → 8088 worker (ffmpeg/COS). The product tree needs cloud creds and middleware, so it does not belong in this site. Keep the layering as a lesson. Rust was missing in the original; here is a matching sketch.',
      },
      snippets: {
        python: `# 8087 BFF：只编排，不跑 ffmpeg
@app.post("/jobs")
async def create_job(body: JobIn, user=Depends(auth)):
    job_id = await db.insert_job(user.id, body)
    await redis.lpush("audio:jobs", job_id)
    await worker.post("/internal/jobs", {"id": job_id})
    return {"id": job_id, "status": "queued"}

# 8088 Worker：只处理，不面对前端
@app.post("/internal/jobs")
async def run(job: JobRef):
    wav = await cos.download(job.src)
    out = ffmpeg.trim(wav, job.start, job.end)
    url = await cos.upload(out)
    await callback(job.id, url)`,
        javascript: `// 8087 BFF (Fastify / Next Route Handler)
app.post('/jobs', { preHandler: auth }, async (req, reply) => {
  const jobId = await db.insertJob(req.user.id, req.body);
  await redis.lpush('audio:jobs', jobId);
  await fetch('http://worker:8088/internal/jobs', {
    method: 'POST',
    body: JSON.stringify({ id: jobId }),
  });
  return { id: jobId, status: 'queued' };
});

// 8088 Worker
app.post('/internal/jobs', async (req) => {
  const wav = await cos.download(req.body.src);
  const out = await ffmpeg.trim(wav, req.body.start, req.body.end);
  const url = await cos.upload(out);
  await callback(req.body.id, url);
});`,
        java: `// 8087 BFF：鉴权 + 落库 + 派发
@PostMapping("/jobs")
public Result<Job> create(@Valid @RequestBody JobIn in) {
    Long userId = SecurityUtils.currentUserId();
    Job job = jobService.enqueue(userId, in);      // MySQL
    redis.opsForList().leftPush("audio:jobs", job.getId());
    workerClient.dispatch(job.getId());            // → 8088
    return Result.success(job);
}

// 8088 Worker：内部接口，不对外
@PostMapping("/internal/jobs")
public void run(@RequestBody JobRef ref) {
    File wav = cos.download(ref.getSrc());
    File out = ffmpeg.trim(wav, ref.getStart(), ref.getEnd());
    String url = cos.upload(out);
    callback.notify(ref.getId(), url);
}`,
        go: `// 8087 BFF
r.POST("/jobs", auth(), func(c *gin.Context) {
    job, _ := store.Insert(userID(c), bindJob(c))
    rdb.LPush(ctx, "audio:jobs", job.ID)
    worker.Dispatch(job.ID) // HTTP 到 :8088
    c.JSON(200, gin.H{"id": job.ID, "status": "queued"})
})

// 8088 Worker
r.POST("/internal/jobs", func(c *gin.Context) {
    wav := cos.Download(job.Src)
    out := ffmpeg.Trim(wav, job.Start, job.End)
    url := cos.Upload(out)
    callback.Notify(job.ID, url)
})`,
        rust: `// 原音频仓没有 Rust。同契约草稿：
// 8087 接请求、写库、推队列；8088 只跑处理。
async fn create_job(
    State(st): State<App>,
    Json(body): Json<JobIn>,
) -> Json<JobOut> {
    let job = st.db.insert(&body).await;
    st.redis.lpush("audio:jobs", job.id).await;
    st.worker.dispatch(job.id).await;
    Json(JobOut { id: job.id, status: "queued" })
}

async fn run_internal(Json(job): Json<JobRef>) {
    let wav = cos::download(&job.src).await;
    let out = ffmpeg::trim(&wav, job.start, job.end).await;
    let url = cos::upload(&out).await;
    callback::notify(job.id, &url).await;
}`,
      },
    },
  ],
};
