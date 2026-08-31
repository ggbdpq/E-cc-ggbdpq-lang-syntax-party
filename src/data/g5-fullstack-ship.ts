import type { Category } from './types';

export const fullstackShip: Category = {
  id: 'fs-ship',
  title: { zh: '上线层：前端质量门的服务端版', en: 'Ship: the server version of your quality gate' },
  topics: [
    {
      id: 'fs-log',
      title: { zh: '结构化日志', en: 'Structured logging' },
      description: {
        zh: '对应前端 Sentry / console。请求必须带 requestId，才能把一次 500 和用户的那次点击对上。',
        en: 'Same job as Sentry / console. Attach a requestId so a 500 can be matched to the click that caused it.',
      },
      snippets: {
        python: `import logging, uuid
from starlette.middleware.base import BaseHTTPMiddleware

log = logging.getLogger("api")

class RequestId(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = rid
        resp = await call_next(request)
        resp.headers["x-request-id"] = rid
        log.info({"rid": rid, "method": request.method, "path": request.url.path, "status": resp.status_code})
        return resp`,
        javascript: `app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  const start = Date.now();
  res.on('finish', () => {
    console.log(JSON.stringify({
      rid: req.id, method: req.method, path: req.path, status: res.statusCode, ms: Date.now() - start,
    }));
  });
  next();
});`,
        java: `Mdc.put("requestId", Optional.ofNullable(req.getHeader("x-request-id")).orElse(UUID.randomUUID().toString()));
log.info("method={} path={} status={}", req.getMethod(), req.getRequestURI(), status);
response.setHeader("x-request-id", MDC.get("requestId"));
MDC.clear();

# logback 输出 JSON：rid / method / path / costMs`,
        go: `r.Use(func(c *gin.Context) {
    rid := c.GetHeader("X-Request-Id")
    if rid == "" { rid = uuid.NewString() }
    c.Set("rid", rid)
    c.Header("X-Request-Id", rid)
    start := time.Now()
    c.Next()
    log.Printf("rid=%s method=%s path=%s status=%d ms=%d",
        rid, c.Request.Method, c.Request.URL.Path, c.Writer.Status(), time.Since(start).Milliseconds())
})`,
        rust: `async fn with_rid(mut req: Request, next: Next) -> Response {
    let rid = req.headers().get("x-request-id").and_then(|v| v.to_str().ok())
        .map(|s| s.to_string()).unwrap_or_else(|| Uuid::new_v4().to_string());
    tracing::info!(rid = %rid, method = %req.method(), path = %req.uri().path(), "in");
    let mut res = next.run(req).await;
    res.headers_mut().insert("x-request-id", rid.parse().unwrap());
    res
}`,
      },
    },
    {
      id: 'fs-errors',
      title: { zh: '全局异常：别让 500 变成 HTML', en: 'Global errors: never return HTML 500' },
      description: {
        zh: '前端 Axios 拦截器期望 JSON。未捕获异常必须收口成 {code,message}，并记下堆栈。',
        en: 'Axios interceptors expect JSON. Uncaught errors must become {code,message}, with the stack logged server-side.',
      },
      snippets: {
        python: `@app.exception_handler(HTTPException)
async def http_exc(_, exc: HTTPException):
    return JSONResponse(exc.status_code, {"code": exc.status_code, "message": exc.detail, "data": None})

@app.exception_handler(Exception)
async def any_exc(request, exc: Exception):
    log.exception("rid=%s", getattr(request.state, "request_id", "-"))
    return JSONResponse(500, {"code": 500, "message": "internal error", "data": None})`,
        javascript: `app.use((err, req, res, next) => {
  console.error(JSON.stringify({ rid: req.id, err: err.message, stack: err.stack }));
  const status = err.status || 500;
  res.status(status).json({
    code: status,
    message: status === 500 ? 'internal error' : err.message,
    data: null,
  });
});`,
        java: `@RestControllerAdvice
public class GlobalException {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Result<?>> notFound(NotFoundException e) {
        return ResponseEntity.status(404).body(Result.fail(404, e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<?>> other(Exception e) {
        log.error("unhandled", e);
        return ResponseEntity.status(500).body(Result.fail(500, "internal error"));
    }
}`,
        go: `r.Use(gin.CustomRecovery(func(c *gin.Context, rec any) {
    log.Printf("panic rid=%v rec=%v", c.GetString("rid"), rec)
    c.AbortWithStatusJSON(500, Fail(500, "internal error"))
}))`,
        rust: `impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, msg) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "not found"),
            AppError::Internal(e) => {
                tracing::error!(error = %e, "internal");
                (StatusCode::INTERNAL_SERVER_ERROR, "internal error")
            }
        };
        (status, Json(json!({"code": status.as_u16(), "message": msg, "data": null}))).into_response()
    }
}`,
      },
    },
    {
      id: 'fs-upload',
      title: { zh: '文件上传：FormData 的对面', en: 'Upload: the other side of FormData' },
      description: {
        zh: '前端 new FormData().append("file", blob)。服务端读 multipart，限制大小，存盘或对象存储后返回 URL。',
        en: 'Frontend new FormData().append("file", blob). Server reads multipart, caps size, stores the file, returns a URL.',
      },
      snippets: {
        python: `from fastapi import File, UploadFile

@app.post("/files")
async def upload(file: UploadFile = File(...)):
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(413, "file too large")
    path = f"uploads/{file.filename}"
    with open(path, "wb") as f:
        f.write(await file.read())
    return {"url": f"/static/{file.filename}"}`,
        javascript: `const multer = require('multer');
const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/files', upload.single('file'), (req, res) => {
  res.status(201).json({ url: '/static/' + req.file.filename });
});

// 前端字段名必须叫 file，和 single('file') 对齐`,
        java: `@PostMapping("/files")
public Result<Map<String, String>> upload(@RequestParam("file") MultipartFile file) throws IOException {
    if (file.getSize() > 5 * 1024 * 1024) throw new BadRequestException("file too large");
    Path dest = Paths.get("uploads", file.getOriginalFilename());
    file.transferTo(dest);
    return Result.ok(Collections.singletonMap("url", "/static/" + file.getOriginalFilename()));
}
# spring.servlet.multipart.max-file-size=5MB`,
        go: `r.POST("/files", func(c *gin.Context) {
    fh, err := c.FormFile("file")
    if err != nil || fh.Size > 5<<20 {
        c.JSON(400, Fail(400, "file missing or too large"))
        return
    }
    c.SaveUploadedFile(fh, filepath.Join("uploads", fh.Filename))
    c.JSON(201, Success(gin.H{"url": "/static/" + fh.Filename}))
})`,
        rust: `async fn upload(mut multipart: Multipart) -> Result<Json<Value>, AppError> {
    while let Some(field) = multipart.next_field().await? {
        if field.name() != Some("file") { continue; }
        let name = field.file_name().unwrap_or("blob").to_string();
        let data = field.bytes().await?;
        if data.len() > 5 * 1024 * 1024 { return Err(AppError::too_large()); }
        tokio::fs::write(format!("uploads/{name}"), &data).await?;
        return Ok(Json(json!({"url": format!("/static/{name}")})));
    }
    Err(AppError::bad_request())
}`,
      },
    },
    {
      id: 'fs-page',
      title: { zh: '分页列表：对接前端表格', en: 'Pagination: feed the table' },
      description: {
        zh: 'antd / 自研表格要的是 { total, page, size, items }。页码从 1 开始，size 设上限，避免一次拉全表。',
        en: 'antd and custom tables want { total, page, size, items }. Pages start at 1. Cap size so nobody dumps the whole table.',
      },
      snippets: {
        python: `@app.get("/todos")
def list_todos(page: int = 1, size: int = 10):
    page = max(page, 1)
    size = min(max(size, 1), 50)
    total = db.query(Todo).count()
    items = db.query(Todo).order_by(Todo.id.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "page": page, "size": size, "items": items}`,
        javascript: `app.get('/todos', async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const size = Math.min(Math.max(Number(req.query.size) || 10, 1), 50);
  const { rows: [{ total }] } = await pool.query('SELECT COUNT(*)::int AS total FROM todos');
  const { rows: items } = await pool.query(
    'SELECT * FROM todos ORDER BY id DESC LIMIT $1 OFFSET $2', [size, (page - 1) * size]
  );
  res.json({ total, page, size, items });
});`,
        java: `@GetMapping
public Result<Page<Todo>> list(@RequestParam(defaultValue = "1") int page,
                               @RequestParam(defaultValue = "10") int size) {
    size = Math.min(Math.max(size, 1), 50);
    PageHelper.startPage(page, size);
    return Result.ok(new PageInfo<>(mapper.list()));
    // PageInfo 含 total / pageNum / pageSize / list
}`,
        go: `page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
if page < 1 { page = 1 }
if size < 1 || size > 50 { size = 10 }
var total int64
db.Model(&Todo{}).Count(&total)
var items []Todo
db.Order("id desc").Offset((page-1)*size).Limit(size).Find(&items)
c.JSON(200, gin.H{"total": total, "page": page, "size": size, "items": items})`,
        rust: `let page = q.page.unwrap_or(1).max(1);
let size = q.size.unwrap_or(10).clamp(1, 50);
let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM todos").fetch_one(&pool).await?;
let items = sqlx::query_as!(Todo,
    "SELECT * FROM todos ORDER BY id DESC LIMIT $1 OFFSET $2",
    size as i64, (page - 1) * size as i64)
    .fetch_all(&pool).await?;
Json(json!({"total": total.0, "page": page, "size": size, "items": items}))`,
      },
    },
    {
      id: 'fs-test',
      title: { zh: '接口测试：比 UI 测试更早变绿', en: 'API tests: go green before the UI' },
      description: {
        zh: '前端会写 component test。后端先测契约：状态码、字段、鉴权失败。实验室用 curl，项目里要自动化。',
        en: 'You already write component tests. On the server, test the contract first: status, fields, failed auth. Labs use curl. Real apps automate it.',
      },
      snippets: {
        python: `from fastapi.testclient import TestClient
client = TestClient(app)

def test_create_and_list():
    r = client.post("/todos", json={"title": "买牛奶"})
    assert r.status_code == 201
    todo_id = r.json()["id"]
    items = client.get("/todos").json()["items"]
    assert any(t["id"] == todo_id for t in items)

def test_missing_title_is_422():
    assert client.post("/todos", json={}).status_code == 422`,
        javascript: `const request = require('supertest');

it('creates then lists', async () => {
  const created = await request(app).post('/todos').send({ title: '买牛奶' });
  expect(created.status).toBe(201);
  const list = await request(app).get('/todos');
  expect(list.body.items.some((t) => t.id === created.body.id)).toBe(true);
});`,
        java: `@SpringBootTest
@AutoConfigureMockMvc
class TodoApiTest {
    @Autowired MockMvc mvc;

    @Test
    void createThenList() throws Exception {
        mvc.perform(post("/todos").contentType(APPLICATION_JSON).content("{\\"title\\":\\"买牛奶\\"}"))
           .andExpect(status().isCreated())
           .andExpect(jsonPath("$.title").value("买牛奶"));
    }
}`,
        go: `func TestCreateThenList(t *testing.T) {
    r := setupRouter()
    w := httptest.NewRecorder()
    req := httptest.NewRequest("POST", "/todos", strings.NewReader(\`{"title":"买牛奶"}\`))
    req.Header.Set("Content-Type", "application/json")
    r.ServeHTTP(w, req)
    if w.Code != 201 { t.Fatalf("got %d", w.Code) }
}`,
        rust: `#[tokio::test]
async fn create_then_list() {
    let app = app();
    let res = app.oneshot(
        Request::post("/todos").header("content-type", "application/json")
            .body(Body::from(r#"{"title":"买牛奶"}"#)).unwrap()
    ).await.unwrap();
    assert_eq!(res.status(), StatusCode::CREATED);
}`,
      },
    },
    {
      id: 'fs-docker-health',
      title: { zh: '健康检查与 Docker', en: 'Health checks and Docker' },
      description: {
        zh: '前端有 /healthz 探活才敢上线。容器必须有进程、端口、健康接口三件套，编排器才知道要不要摘掉实例。',
        en: 'Frontends already poke /healthz. A container needs a process, a port, and a health endpoint so the orchestrator knows when to drop the instance.',
      },
      snippets: {
        python: `@app.get("/health")
def health():
    return {"status": "ok"}

# Dockerfile
# FROM python:3.12-slim
# WORKDIR /app
# COPY requirements.txt . && pip install -r requirements.txt
# COPY . .
# EXPOSE 8011
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8011"]`,
        javascript: `app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Dockerfile
// FROM node:24-alpine
// WORKDIR /app
// COPY package*.json ./ && npm ci --omit=dev
// COPY . .
// EXPOSE 8012
// CMD ["node", "index.js"]`,
        java: `// spring-boot-starter-actuator
# management.endpoints.web.exposure.include=health
# GET /actuator/health → { "status": "UP" }

# FROM eclipse-temurin:8-jre
# COPY target/todo-springboot-0.0.1.jar app.jar
# EXPOSE 8015
# ENTRYPOINT ["java","-jar","/app.jar"]`,
        go: `r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })

// FROM golang:1.22 AS build
// WORKDIR /src && COPY . . && CGO_ENABLED=0 go build -o /app
// FROM gcr.io/distroless/static
// COPY --from=build /app /app
// EXPOSE 8013
// ENTRYPOINT ["/app"]`,
        rust: `async fn health() -> Json<Value> { Json(json!({"status": "ok"})) }

// FROM rust:1.86 AS build
// WORKDIR /src && COPY . . && cargo build --release
// FROM gcr.io/distroless/cc
// COPY --from=build /src/target/release/todo-axum /app
// EXPOSE 8014`,
      },
    },
    {
      id: 'fs-ratelimit',
      title: { zh: '限流：429 与前端重试', en: 'Rate limit: 429 and frontend retry' },
      description: {
        zh: '登录、发送验证码必须限流。前端看到 429 应该退避，不要死循环重试把服务打穿。',
        en: 'Login and OTP sends must be rate-limited. On 429 the frontend should back off, not retry in a tight loop.',
      },
      snippets: {
        python: `from collections import defaultdict
import time
hits = defaultdict(list)

@app.middleware("http")
async def limit(request, call_next):
    ip = request.client.host
    now = time.time()
    hits[ip] = [t for t in hits[ip] if now - t < 60]
    if len(hits[ip]) >= 30:
        return JSONResponse(429, {"code": 429, "message": "too many requests"})
    hits[ip].append(now)
    return await call_next(request)`,
        javascript: `const hits = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  if (arr.length >= 30) return res.status(429).json({ code: 429, message: 'too many requests' });
  arr.push(now); hits.set(ip, arr);
  next();
});`,
        java: `// Bucket4j 或过滤器按 IP 计数
if (counter.increment(ip) > 30) {
    response.setStatus(429);
    response.getWriter().write("{\\"code\\":429,\\"message\\":\\"too many requests\\"}");
    return;
}`,
        go: `// 生产用 redis INCR + EXPIRE，多实例才一致
key := "rl:" + c.ClientIP()
n, _ := rdb.Incr(ctx, key).Result()
if n == 1 { rdb.Expire(ctx, key, time.Minute) }
if n > 30 {
    c.AbortWithStatusJSON(429, Fail(429, "too many requests"))
    return
}`,
        rust: `// 单实例内存令牌桶足够做实验；多实例换成 Redis
if bucket.allow(ip) == false {
    return (StatusCode::TOO_MANY_REQUESTS, Json(json!({"code":429,"message":"too many requests"})));
}`,
      },
    },
    {
      id: 'fs-sse',
      title: { zh: 'SSE：EventSource 的对面', en: 'SSE: the other side of EventSource' },
      description: {
        zh: '前端 new EventSource("/events")。长任务不要让用户傻等 HTTP，用 SSE 推进度，这就是音频项目 Worker 回调的简化版。',
        en: 'Frontend new EventSource("/events"). Do not block HTTP on long jobs. Push progress with SSE. That is the simplified Worker callback from the audio case.',
      },
      snippets: {
        python: `from fastapi.responses import StreamingResponse
import asyncio, json

@app.get("/events")
async def events():
    async def gen():
        for i in range(5):
            yield f"data: {json.dumps({'progress': i*20})}\\n\\n"
            await asyncio.sleep(1)
        yield "data: {\\"progress\\": 100}\\n\\n"
    return StreamingResponse(gen(), media_type="text/event-stream")`,
        javascript: `app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  let i = 0;
  const t = setInterval(() => {
    i += 20;
    res.write(\`data: \${JSON.stringify({ progress: i })}\\n\\n\`);
    if (i >= 100) { clearInterval(t); res.end(); }
  }, 1000);
  req.on('close', () => clearInterval(t));
});`,
        java: `@GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter events() {
    SseEmitter emitter = new SseEmitter(0L);
    exec.execute(() -> {
        try {
            for (int i = 0; i <= 100; i += 20) {
                emitter.send(SseEmitter.event().data("{\\"progress\\":" + i + "}"));
                Thread.sleep(1000);
            }
            emitter.complete();
        } catch (Exception e) { emitter.completeWithError(e); }
    });
    return emitter;
}`,
        go: `r.GET("/events", func(c *gin.Context) {
    c.Header("Content-Type", "text/event-stream")
    c.Header("Cache-Control", "no-cache")
    for i := 0; i <= 100; i += 20 {
        fmt.Fprintf(c.Writer, "data: {\\"progress\\":%d}\\n\\n", i)
        c.Writer.Flush()
        time.Sleep(time.Second)
    }
})`,
        rust: `async fn events() -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let stream = stream::iter((0..=100).step_by(20)).then(|p| async move {
        tokio::time::sleep(Duration::from_secs(1)).await;
        Ok(Event::default().data(format!(r#"{{"progress":{p}}}"#)))
    });
    Sse::new(stream)
}`,
      },
    },
  ],
};
