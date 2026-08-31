import type { Category } from './types';

export const fullstackAuth: Category = {
  id: 'fs-auth',
  title: { zh: '鉴权：前端跳登录的那一侧', en: 'Auth: the other side of redirect-to-login' },
  topics: [
    {
      id: 'fs-cookie-jwt',
      title: { zh: 'Cookie Session 与 JWT 怎么选', en: 'Cookie session vs JWT' },
      description: {
        zh: '前端常把 token 塞 localStorage。服务端更常见两种：Cookie 会话，或 Authorization Bearer。不要两种一起用还搞不清谁说了算。读完去实验室第三关 curl 8021–8025。',
        en: 'Frontends often stash tokens in localStorage. Servers usually pick cookie sessions or Authorization Bearer. Do not mix both without a source of truth.',
      },
      snippets: {
        python: `# A. Cookie Session（浏览器自动带，防 XSS 靠 HttpOnly）
@app.post("/login")
def login(form: LoginIn, response: Response):
    response.set_cookie("sid", make_session(form.user), httponly=True, samesite="lax")
    return {"ok": True}

# B. JWT（适合多端/BFF，前端自己塞 Header）
@app.post("/login")
def login(form: LoginIn):
    token = jwt.encode({"sub": form.user, "exp": now + 3600}, SECRET, algorithm="HS256")
    return {"token": token}

# 前端：headers: { Authorization: 'Bearer ' + token }
# SPA 跨域带 cookie 必须 SameSite=None; Secure + credentials:'include'`,
        javascript: `// Session：服务端存 sid → user
app.post('/login', (req, res) => {
  const sid = crypto.randomUUID();
  sessions.set(sid, req.body.user);
  res.cookie('sid', sid, { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
});

// JWT：服务端不存会话，下次请求只验签
app.post('/login', (req, res) => {
  const token = jwt.sign({ sub: req.body.user }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});`,
        java: `// Session：HttpSession，Cookie JSESSIONID
@PostMapping("/login")
public Result<Void> login(@RequestBody LoginIn in, HttpSession session) {
    session.setAttribute("userId", userService.authenticate(in));
    return Result.ok(null);
}

// JWT：登录只返回 token，后续请求走 Header
@PostMapping("/login")
public Result<Token> login(@RequestBody LoginIn in) {
    String token = Jwts.builder().setSubject(userId).signWith(key).compact();
    return Result.ok(new Token(token));
}`,
        go: `// Cookie
c.SetCookie("sid", sid, 3600, "/", "", false, true) // httpOnly=true

// JWT
token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "sub": userID, "exp": time.Now().Add(time.Hour).Unix(),
})
s, _ := token.SignedString([]byte(secret))
c.JSON(200, gin.H{"token": s})`,
        rust: `// Cookie（axum-extra CookieJar）或 JWT（jsonwebtoken）
let token = encode(&Header::default(), &Claims { sub: user_id, exp }, &KEYS.encoding)?;
Json(json!({"token": token}))

// 选 JWT 当：多端（Web + 小程序）共用一个 BFF
// 选 Cookie 当：只有浏览器、要防 XSS 偷 token`,
      },
    },
    {
      id: 'fs-password',
      title: { zh: '密码只存哈希', en: 'Store password hashes only' },
      description: {
        zh: '前端可以明文把密码 POST 到 HTTPS。库里绝对不能存明文。登录是哈希比对，不是解密。',
        en: 'The frontend may POST a password over HTTPS. The database must never store plaintext. Login compares hashes; it does not decrypt.',
      },
      snippets: {
        python: `import bcrypt

def register(password: str) -> bytes:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt())

def login(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed)

# 永远不要 MD5/SHA1 加盐当密码算法`,
        javascript: `const bcrypt = require('bcrypt');

async function register(password) {
  return bcrypt.hash(password, 10); // 10 rounds
}

async function login(password, hashed) {
  return bcrypt.compare(password, hashed);
}`,
        java: `// Spring Security Crypto
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

String hashed = encoder.encode(rawPassword);
boolean ok = encoder.matches(rawPassword, hashed);

// 用户表字段：password_hash，不是 password`,
        go: `import "golang.org/x/crypto/bcrypt"

hashed, _ := bcrypt.GenerateFromPassword([]byte(raw), bcrypt.DefaultCost)
err := bcrypt.CompareHashAndPassword(hashed, []byte(raw))
ok := err == nil`,
        rust: `use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::SaltString;

let salt = SaltString::generate(&mut OsRng);
let hash = Argon2::default().hash_password(raw.as_bytes(), &salt)?.to_string();
Argon2::default().verify_password(raw.as_bytes(), &PasswordHash::new(&hash)?)?;`,
      },
    },
    {
      id: 'fs-auth-mw',
      title: { zh: '鉴权中间件：401 从哪来', en: 'Auth middleware: where 401 comes from' },
      description: {
        zh: '前端拦截器遇到 401 跳登录。401 必须在进业务函数之前产生，不要每个接口手写一遍。',
        en: 'Frontend interceptors jump to login on 401. Emit 401 before the business function. Do not copy-paste it into every handler.',
      },
      snippets: {
        python: `from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

def current_user(cred = Depends(security)) -> str:
    try:
        return jwt.decode(cred.credentials, SECRET, algorithms=["HS256"])["sub"]
    except Exception:
        raise HTTPException(401, "invalid token")

@app.get("/me")
def me(user_id: str = Depends(current_user)):
    return {"user_id": user_id}

# 公开接口不要 Depends(current_user)`,
        javascript: `function auth(req, res, next) {
  const raw = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(raw, SECRET);
    next();
  } catch {
    res.status(401).json({ code: 401, message: 'invalid token', data: null });
  }
}

app.get('/me', auth, (req, res) => res.json({ user_id: req.user.sub }));
app.get('/todos', listTodos);           // 公开
app.post('/todos', auth, createTodo);   // 需登录`,
        java: `public class JwtInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse resp, Object h) {
        try {
            String token = req.getHeader("Authorization").substring(7);
            Claims c = Jwts.parser().setSigningKey(SECRET).parseClaimsJws(token).getBody();
            req.setAttribute("userId", c.getSubject());
            return true;
        } catch (Exception e) {
            resp.setStatus(401);
            return false;
        }
    }
}
// 注册到需要登录的路径，排除 /login /health`,
        go: `func JwtAuth() gin.HandlerFunc {
    return func(c *gin.Context) {
        raw := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
        tok, err := jwt.Parse(raw, func(t *jwt.Token) (interface{}, error) { return []byte(secret), nil })
        if err != nil || !tok.Valid {
            c.AbortWithStatusJSON(401, Fail(401, "invalid token"))
            return
        }
        c.Set("userId", tok.Claims.(jwt.MapClaims)["sub"])
        c.Next()
    }
}
auth := r.Group("/")
auth.Use(JwtAuth())
auth.GET("/me", me)`,
        rust: `struct AuthUser(String);

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser {
    type Rejection = (StatusCode, Json<Value>);
    async fn from_request_parts(parts: &mut Parts, _: &S) -> Result<Self, Self::Rejection> {
        let token = header_token(parts).ok_or(unauth())?;
        let data = decode::<Claims>(token, &KEYS.decoding, &Validation::default()).map_err(|_| unauth())?;
        Ok(AuthUser(data.claims.sub))
    }
}

async fn me(AuthUser(id): AuthUser) -> Json<Value> { Json(json!({"user_id": id})) }`,
      },
    },
    {
      id: 'fs-rbac',
      title: { zh: '角色与权限：按钮隐藏不够', en: 'RBAC: hiding a button is not enough' },
      description: {
        zh: '前端按 role 隐藏「删除」只是体验。真正拦截必须在服务端。403 是已登录但没权限。',
        en: 'Hiding Delete by role is UX. Enforcement lives on the server. 403 means logged in, not allowed.',
      },
      snippets: {
        python: `def require(*roles: str):
    def dep(user: User = Depends(current_user)):
        if user.role not in roles:
            raise HTTPException(403, "forbidden")
        return user
    return dep

@app.delete("/todos/{id}")
def delete_todo(id: int, user: User = Depends(require("admin"))):
    store.delete(id)
    return Response(status_code=204)

# 资源级：只能改自己的
# if todo.owner_id != user.id and user.role != "admin": 403`,
        javascript: `const allow = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ code: 403, message: 'forbidden', data: null });
  }
  next();
};

app.delete('/todos/:id', auth, allow('admin'), deleteTodo);

// 403 ≠ 401：前端不要把 403 当未登录清 token`,
        java: `@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/{id}")
public void delete(@PathVariable Long id) {
    store.delete(id);
}

@PreAuthorize("hasPermission(#id, 'todo', 'write')")
@PatchMapping("/{id}")
public Todo patch(@PathVariable Long id, @RequestBody TodoPatch p) {
    return store.patch(id, p);
}`,
        go: `func Require(roles ...string) gin.HandlerFunc {
    set := map[string]struct{}{}
    for _, r := range roles { set[r] = struct{}{} }
    return func(c *gin.Context) {
        role := c.GetString("role")
        if _, ok := set[role]; !ok {
            c.AbortWithStatusJSON(403, Fail(403, "forbidden"))
            return
        }
        c.Next()
    }
}
r.DELETE("/todos/:id", JwtAuth(), Require("admin"), deleteTodo)`,
        rust: `struct Admin(AuthUser);

impl<S> FromRequestParts<S> for Admin {
    type Rejection = (StatusCode, Json<Value>);
    async fn from_request_parts(p: &mut Parts, s: &S) -> Result<Self, Self::Rejection> {
        let AuthUser(id) = AuthUser::from_request_parts(p, s).await?;
        let role = load_role(&id).await;
        if role != "admin" {
            return Err((StatusCode::FORBIDDEN, Json(json!({"code":403,"message":"forbidden"}))));
        }
        Ok(Admin(AuthUser(id)))
    }
}`,
      },
    },
  ],
};
