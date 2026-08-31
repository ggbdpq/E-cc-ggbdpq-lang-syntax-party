import type { Category } from './types';

/**
 * 框架实战：每种语言选一个旗舰框架，对比真实生产场景写法。
 * FastAPI / Express / Spring Boot / Gin / Axum
 * （Java 示例遵循 JDK 8 + Spring Boot 2.7）
 */
export const frameworkPractice: Category = {
  id: 'framework-practice',
  title: { zh: '框架实战', en: 'Frameworks in Production' },
  topics: [
    {
      id: 'route-params',
      title: { zh: '路径参数与查询参数', en: 'Path & Query Params' },
      description: {
        zh: 'GET /users/{id}?active=true —— 每个框架都有的第一课。',
        en: 'GET /users/{id}?active=true — the first lesson of every framework.',
      },
      snippets: {
        python: `# FastAPI：类型注解即校验
@app.get("/users/{user_id}")
def get_user(
    user_id: int,              # 路径参数，自动转 int
    active: bool = True,       # 查询参数，带默认值
    page: int = Query(1, ge=1) # 查询参数，带约束
):
    return {"user_id": user_id, "active": active, "page": page}`,
        javascript: `// Express：req.params / req.query
app.get('/users/:userId', (req, res) => {
  const userId = Number(req.params.userId);   // 手动转换！
  const active = req.query.active !== 'false'; // query 都是字符串
  const page = parseInt(req.query.page) || 1;

  res.json({ userId, active, page });
});`,
        java: `// Spring Boot：注解绑定参数
@GetMapping("/users/{userId}")
public Result<User> getUser(
        @PathVariable Long userId,                    // 路径参数
        @RequestParam(defaultValue = "true") Boolean active,
        @RequestParam(defaultValue = "1") Integer page) {

    return Result.success(userService.find(userId, active, page));
}`,
        go: `// Gin：Param / Query / DefaultQuery
r.GET("/users/:userId", func(c *gin.Context) {
    userId, _ := strconv.Atoi(c.Param("userId"))
    active := c.DefaultQuery("active", "true")
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))

    c.JSON(200, gin.H{
        "user_id": userId, "active": active, "page": page,
    })
})`,
        rust: `// Axum：提取器模式，类型即契约
use axum::extract::{Path, Query};

#[derive(Deserialize)]
struct UserQuery {
    active: Option<bool>,
    page: Option<u32>,
}

async fn get_user(
    Path(user_id): Path<u64>,          // 路径参数
    Query(q): Query<UserQuery>,        // 查询参数反序列化
) -> Json<Value> {
    Json(json!({
        "user_id": user_id,
        "active": q.active.unwrap_or(true),
        "page": q.page.unwrap_or(1),
    }))
}`,
      },
    },
    {
      id: 'request-validation',
      title: { zh: '请求体校验', en: 'Request Body Validation' },
      description: {
        zh: '声明式校验是生产代码的标配：字段非法时自动返回 400/422。',
        en: 'Declarative validation is production standard: invalid fields get automatic 400/422.',
      },
      snippets: {
        python: `# FastAPI + Pydantic：模型即校验规则
from pydantic import BaseModel, Field, EmailStr

class CreateUser(BaseModel):
    name: str = Field(min_length=1, max_length=20)
    age: int = Field(ge=0, le=150)
    email: EmailStr

@app.post("/users", status_code=201)
def create_user(user: CreateUser):
    # 校验失败自动返回 422，带详细字段错误
    return {"created": user.name}`,
        javascript: `// Express + zod（手动接入）
const { z } = require('zod');

const CreateUser = z.object({
  name: z.string().min(1).max(20),
  age: z.number().int().min(0).max(150),
  email: z.string().email(),
});

app.post('/users', (req, res) => {
  const parsed = CreateUser.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues });
  }
  res.status(201).json({ created: parsed.data.name });
});`,
        java: `// Spring Boot + Hibernate Validator
public class CreateUserRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(max = 20, message = "用户名最长20字符")
    private String name;

    @Min(value = 0) @Max(value = 150)
    private Integer age;

    @Email(message = "邮箱格式不正确")
    private String email;
    // getters / setters ...
}

@PostMapping("/users")
public Result<String> createUser(
        @Validated @RequestBody CreateUserRequest req) {
    // 校验失败抛 MethodArgumentNotValidException
    return Result.success(req.getName());
}`,
        go: `// Gin：binding 标签即校验规则
type CreateUser struct {
    Name  string \`json:"name" binding:"required,max=20"\`
    Age   int    \`json:"age" binding:"gte=0,lte=150"\`
    Email string \`json:"email" binding:"required,email"\`
}

r.POST("/users", func(c *gin.Context) {
    var req CreateUser
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }
    c.JSON(201, gin.H{"created": req.Name})
})`,
        rust: `// Axum + validator：serde 反序列化 + validator 校验
use validator::Validate;

#[derive(Deserialize, Validate)]
struct CreateUser {
    #[validate(length(min = 1, max = 20))]
    name: String,
    #[validate(range(min = 0, max = 150))]
    age: u8,
    #[validate(email)]
    email: String,
}

async fn create_user(
    Json(req): Json<CreateUser>,  // JSON 解析失败自动 400
) -> Result<Json<Value>, AppError> {
    req.validate()?;               // 校验失败走自定义错误
    Ok(Json(json!({"created": req.name})))
}`,
      },
    },
    {
      id: 'unified-response',
      title: { zh: '统一响应封装', en: 'Unified Response Envelope' },
      description: {
        zh: '真实项目的铁律：所有接口返回 { code, message, data } 统一结构。',
        en: 'Production iron rule: every endpoint returns { code, message, data }.',
      },
      snippets: {
        python: `# FastAPI：response_model 约束出口结构
from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class Result(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None

@app.get("/users/{uid}", response_model=Result[UserVO])
def get_user(uid: int):
    return Result(data=UserVO(name="小明"))`,
        javascript: `// Express：封装统一响应工具函数
const Result = {
  success: (data) => ({ code: 200, message: 'success', data }),
  error: (code, message) => ({ code, message, data: null }),
};

app.get('/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) {
    return res.status(404).json(Result.error(404, '用户不存在'));
  }
  res.json(Result.success(user));
});`,
        java: `// Spring Boot：泛型统一返回体（真实项目标准件）
public class Result<T> {
    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> r = new Result<>();
        r.code = 200; r.message = "success"; r.data = data;
        return r;
    }

    public static <T> Result<T> error(Integer code, String msg) {
        Result<T> r = new Result<>();
        r.code = code; r.message = msg;
        return r;
    }
    // getters / setters ...
}`,
        go: `// Gin：结构体 + 辅助函数
type Result struct {
    Code    int         \`json:"code"\`
    Message string      \`json:"message"\`
    Data    interface{} \`json:"data,omitempty"\`
}

func Success(data interface{}) Result {
    return Result{Code: 200, Message: "success", Data: data}
}

func Fail(code int, msg string) Result {
    return Result{Code: code, Message: msg}
}

r.GET("/users/:id", func(c *gin.Context) {
    c.JSON(200, Success(gin.H{"name": "小明"}))
})`,
        rust: `// Axum：统一响应结构 + IntoResponse
use serde::Serialize;

#[derive(Serialize)]
struct Result<T: Serialize> {
    code: u16,
    message: String,
    data: Option<T>,
}

impl<T: Serialize> Result<T> {
    fn success(data: T) -> Json<Self> {
        Json(Self { code: 200, message: "success".into(), data: Some(data) })
    }
}

async fn get_user() -> Json<Result<Value>> {
    Result::success(json!({"name": "小明"}))
}`,
      },
    },
    {
      id: 'global-error',
      title: { zh: '全局异常处理', en: 'Global Error Handling' },
      description: {
        zh: '不在每个接口里 try-catch，而是集中一处兜底——真实项目的分水岭。',
        en: 'Centralized error handling instead of per-endpoint try-catch — the production watershed.',
      },
      snippets: {
        python: `# FastAPI：异常处理器集中注册
class BizException(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message

@app.exception_handler(BizException)
async def biz_handler(request, exc: BizException):
    return JSONResponse(
        status_code=200,
        content={"code": exc.code, "message": exc.message, "data": None},
    )

# 业务代码里直接抛，框架兜底
@app.get("/users/{uid}")
def get_user(uid: int):
    if uid == 0:
        raise BizException(404, "用户不存在")`,
        javascript: `// Express：4 参数错误中间件（必须放最后！）
app.get('/users/:id', (req, res, next) => {
  if (req.params.id === '0') {
    return next(new BizError(404, '用户不存在')); // 交给 next
  }
  res.json(Result.success({ name: '小明' }));
});

app.use((err, req, res, next) => {   // 错误兜底
  const code = err.code || 500;
  res.status(code >= 500 ? 500 : 200)
     .json(Result.error(code, err.message));
});`,
        java: `// Spring Boot：@RestControllerAdvice 全局兜底（行业标准做法）
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public Result<Void> handleBiz(BizException e) {
        return Result.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result<Void> handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult()
                      .getFieldError().getDefaultMessage();
        return Result.error(400, msg);
    }

    @ExceptionHandler(Exception.class)  // 最后兜底
    public Result<Void> handleAll(Exception e) {
        return Result.error(500, "服务器内部错误");
    }
}`,
        go: `// Gin：中间件统一捕获（Go 无异常，靠 error + panic recover）
func ErrorHandler() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Next()  // 先执行后续处理

        if len(c.Errors) > 0 {
            err := c.Errors.Last().Err
            var bizErr *BizError
            if errors.As(err, &bizErr) {
                c.JSON(200, Fail(bizErr.Code, bizErr.Msg))
            } else {
                c.JSON(500, Fail(500, "服务器内部错误"))
            }
        }
    }
}
r := gin.New()
r.Use(gin.Recovery(), ErrorHandler())  // Recovery 防 panic`,
        rust: `// Axum：错误即类型，实现 IntoResponse 自动转换
struct AppError {
    code: u16,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let body = Json(json!({
            "code": self.code,
            "message": self.message,
        }));
        (StatusCode::OK, body).into_response()
    }
}

// From 转换让 ? 运算符自动包装底层错误
impl From<validator::ValidationErrors> for AppError {
    fn from(_: validator::ValidationErrors) -> Self {
        AppError { code: 400, message: "参数校验失败".into() }
    }
}`,
      },
    },
    {
      id: 'middleware',
      title: { zh: '中间件与拦截器', en: 'Middleware & Interceptors' },
      description: {
        zh: '日志、鉴权、CORS、耗时统计——横切关注点的统一入口。',
        en: 'Logging, auth, CORS, timing — one entry for cross-cutting concerns.',
      },
      snippets: {
        python: `# FastAPI：@app.middleware 或中间件类
import time

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)  # 放行
    cost = time.time() - start
    response.headers["X-Cost"] = f"{cost:.3f}s"
    print(f"{request.method} {request.url.path} {cost:.3f}s")
    return response

# 依赖注入也常承担鉴权中间件角色: Depends(check_token)`,
        javascript: `// Express：use 注册全局中间件，顺序即执行顺序
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {   // 响应完成后统计
    console.log(\`\${req.method} \${req.path} \${Date.now() - start}ms\`);
  });
  next();  // 放行（不调用就中断）
});

// 路由级中间件
app.get('/admin', checkAuth, (req, res) => { ... });`,
        java: `// Spring Boot：HandlerInterceptor（拦截器）
@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest req,
                             HttpServletResponse resp,
                             Object handler) {
        String token = req.getHeader("Authorization");
        if (token == null) {
            resp.setStatus(401);
            return false;   // 拦截
        }
        return true;        // 放行
    }
}
// 注册: WebMvcConfigurer.addInterceptors()
// Filter 更底层（Servlet 级），拦截器更懂 MVC`,
        go: `// Gin：HandlerFunc 链，c.Next() 控制流程
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()  // 执行后续处理器
        fmt.Printf("%s %s %v\\n",
            c.Request.Method, c.Request.URL.Path, time.Since(start))
    }
}

func Auth() gin.HandlerFunc {
    return func(c *gin.Context) {
        if c.GetHeader("Authorization") == "" {
            c.AbortWithStatusJSON(401, Fail(401, "未登录"))
            return
        }
        c.Next()
    }
}
r.Use(Logger())           // 全局
r.GET("/admin", Auth(), h) // 路由级`,
        rust: `// Axum：middleware::from_fn（Tower 生态）
use axum::middleware::{self, Next};
use axum::extract::Request;

async fn log_requests(req: Request, next: Next) -> Response {
    let method = req.method().clone();
    let path = req.uri().path().to_string();
    let start = std::time::Instant::now();

    let resp = next.run(req).await;   // 放行

    println!("{} {} {:?}", method, path, start.elapsed());
    resp
}

let app = Router::new()
    .route("/hello", get(hello))
    .layer(middleware::from_fn(log_requests));`,
      },
    },
    {
      id: 'database-crud',
      title: { zh: '数据库 CRUD', en: 'Database CRUD' },
      description: {
        zh: 'ORM 是真实项目的分水岭：SQLAlchemy / Prisma / MyBatis-Plus / GORM / sqlx。',
        en: 'ORMs define real projects: SQLAlchemy / Prisma / MyBatis-Plus / GORM / sqlx.',
      },
      snippets: {
        python: `# SQLAlchemy 2.0（Python ORM 事实标准）
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    age: Mapped[int]

with Session() as db:
    # 增
    db.add(User(name="小明", age=25)); db.commit()
    # 查
    user = db.get(User, 1)
    users = db.scalars(select(User).where(User.age > 18))
    # 改
    user.age = 26
    # 删
    db.delete(user); db.commit()`,
        javascript: `// Prisma（Node 最现代 ORM，类型安全）
// schema.prisma: model User { id Int @id; name String; age Int }

// 增
await prisma.user.create({ data: { name: '小明', age: 25 } });

// 查
const user = await prisma.user.findUnique({ where: { id: 1 } });
const adults = await prisma.user.findMany({
  where: { age: { gt: 18 } },
  orderBy: { id: 'desc' },
});

// 改 / 删
await prisma.user.update({ where: { id: 1 }, data: { age: 26 } });
await prisma.user.delete({ where: { id: 1 } });`,
        java: `// MyBatis-Plus（国内真实项目主流）
@Mapper
public interface UserMapper extends BaseMapper<User> { }
// BaseMapper 自带 insert/selectById/updateById/deleteById

@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;

    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    public List<User> listAdults() {
        return userMapper.selectList(
            new QueryWrapper<User>().gt("age", 18)
                                    .orderByDesc("id"));
    }
}`,
        go: `// GORM（Go 最流行 ORM）
type User struct {
    ID   uint   \`gorm:"primaryKey"\`
    Name string
    Age  int
}

db.AutoMigrate(&User{})  // 自动建表

// 增
db.Create(&User{Name: "小明", Age: 25})
// 查
var user User
db.First(&user, 1)
var adults []User
db.Where("age > ?", 18).Order("id desc").Find(&adults)
// 改
db.Model(&user).Update("age", 26)
// 删
db.Delete(&user)`,
        rust: `// sqlx：编译期检查 SQL（不是 ORM，但更 Rust）
#[derive(sqlx::FromRow)]
struct User { id: i64, name: String, age: i32 }

// 增（SQL 在编译期验证！）
sqlx::query!("INSERT INTO users (name, age) VALUES ($1, $2)", "小明", 25)
    .execute(&pool).await?;

// 查
let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", 1)
    .fetch_one(&pool).await?;

// 需要完整 ORM 可用 SeaORM / Diesel`,
      },
    },
    {
      id: 'pagination',
      title: { zh: '分页查询', en: 'Pagination' },
      snippets: {
        python: `# FastAPI + SQLAlchemy：page/page_size 模式
@app.get("/users")
def list_users(page: int = Query(1, ge=1),
               page_size: int = Query(10, le=100),
               db: Session = Depends(get_db)):
    total = db.scalar(select(func.count(User.id)))
    items = db.scalars(
        select(User)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return {"total": total, "page": page, "items": items}`,
        javascript: `// Express + Prisma：skip/take
app.get('/users', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const size = Math.min(100, parseInt(req.query.size) || 10);

  const [total, items] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip: (page - 1) * size,
      take: size,
      orderBy: { id: 'desc' },
    }),
  ]);
  res.json({ total, page, items });
});`,
        java: `// MyBatis-Plus：内置分页插件
@GetMapping("/users")
public Result<IPage<User>> listUsers(
        @RequestParam(defaultValue = "1") Integer page,
        @RequestParam(defaultValue = "10") Integer size) {

    IPage<User> result = userMapper.selectPage(
        new Page<>(page, size),               // 分页参数
        new QueryWrapper<User>().orderByDesc("id"));
    // result.getTotal() / result.getRecords()
    return Result.success(result);
}`,
        go: `// Gin + GORM：offset/limit
r.GET("/users", func(c *gin.Context) {
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))

    var total int64
    db.Model(&User{}).Count(&total)

    var users []User
    db.Offset((page - 1) * size).
       Limit(size).
       Order("id desc").
       Find(&users)

    c.JSON(200, gin.H{"total": total, "page": page, "items": users})
})`,
        rust: `// Axum + sqlx：手写 LIMIT/OFFSET
async fn list_users(
    Query(q): Query<PageQuery>,
    State(pool): State<PgPool>,
) -> Result<Json<Value>, AppError> {
    let page = q.page.unwrap_or(1).max(1);
    let size = q.size.unwrap_or(10).min(100);

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM users")
        .fetch_one(&pool).await?;
    let items = sqlx::query_as!(User,
        "SELECT * FROM users ORDER BY id DESC LIMIT $1 OFFSET $2",
        size as i64, (page - 1) * size as i64)
        .fetch_all(&pool).await?;

    Ok(Json(json!({"total": total.0, "page": page, "items": items})))
}`,
      },
    },
    {
      id: 'jwt-auth',
      title: { zh: 'JWT 认证', en: 'JWT Authentication' },
      snippets: {
        python: `# FastAPI：依赖注入式鉴权
import jwt  # PyJWT
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(
    cred: HTTPAuthorizationCredentials = Security(security)
):
    try:
        payload = jwt.decode(cred.credentials, SECRET, algorithms=["HS256"])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(401, "无效或过期的 Token")

@app.get("/me")
def me(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id}`,
        javascript: `// Express：jsonwebtoken + 中间件
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, SECRET);  // 解析用户信息挂到 req
    next();
  } catch {
    res.status(401).json(Result.error(401, '无效或过期的 Token'));
  }
}

app.get('/me', auth, (req, res) => {
  res.json(Result.success({ user_id: req.user.sub }));
});`,
        java: `// Spring Boot：拦截器 + JJWT
@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest req,
                             HttpServletResponse resp, Object handler) {
        String token = req.getHeader("Authorization");
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token.replace("Bearer ", ""))
                .getBody();
            req.setAttribute("userId", claims.getSubject());
            return true;
        } catch (JwtException e) {
            resp.setStatus(401);
            return false;
        }
    }
}
// 生产环境更多用 Spring Security + OAuth2 全套`,
        go: `// Gin：JWT 中间件
func JwtAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenStr := strings.TrimPrefix(
            c.GetHeader("Authorization"), "Bearer ")

        token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
            return []byte(secret), nil
        })

        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(401, Fail(401, "无效或过期的 Token"))
            return
        }
        claims := token.Claims.(jwt.MapClaims)
        c.Set("userId", claims["sub"])  // 用户信息存上下文
        c.Next()
    }
}
r.GET("/me", JwtAuth(), func(c *gin.Context) {
    c.JSON(200, Success(gin.H{"user_id": c.GetString("userId")}))
})`,
        rust: `// Axum：FromRequestParts 自定义提取器（类型级鉴权）
struct AuthUser(String);  // 通过校验的用户 ID

#[async_trait]
impl FromRequestParts<AppState> for AuthUser {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts, _state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let token = parts.headers.get("Authorization")
            .and_then(|v| v.to_str().ok())
            .map(|s| s.trim_start_matches("Bearer "))
            .ok_or(AppError::unauthorized())?;

        let data = decode::<Claims>(token, &KEYS.decoding, &Validation::default())
            .map_err(|_| AppError::unauthorized())?;
        Ok(AuthUser(data.claims.sub))
    }
}

async fn me(user: AuthUser) -> Json<Value> {  // 签名即鉴权
    Json(json!({"user_id": user.0}))
}`,
      },
    },
  ],
};
