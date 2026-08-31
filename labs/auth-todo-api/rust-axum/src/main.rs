use axum::{
    extract::{Path, Request, State},
    http::{header, HeaderValue, Method, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::{get, patch, post},
    Extension, Json, Router,
};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

const SECRET: &[u8] = b"syntax-party-jwt-lab";

#[derive(Clone)]
struct User {
    id: i64,
    username: String,
    role: String,
    password_hash: String,
}

#[derive(Clone)]
struct AuthUser {
    id: i64,
    username: String,
    role: String,
}

#[derive(Clone, Serialize)]
struct Todo {
    id: i64,
    title: String,
    done: bool,
    #[serde(rename = "ownerId")]
    owner_id: i64,
}

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: String,
    username: String,
    role: String,
    exp: usize,
}

#[derive(Deserialize)]
struct LoginIn {
    username: String,
    password: String,
}

#[derive(Deserialize)]
struct CreateIn {
    title: String,
}

#[derive(Deserialize)]
struct PatchIn {
    title: Option<String>,
    done: Option<bool>,
}

struct App {
    users: Vec<User>,
    next_id: Mutex<i64>,
    todos: Mutex<Vec<Todo>>,
}

type ApiError = (StatusCode, Json<serde_json::Value>);

fn api_err(status: StatusCode, msg: &str) -> ApiError {
    (status, Json(serde_json::json!({ "error": msg })))
}

fn public_user(user: &AuthUser) -> serde_json::Value {
    serde_json::json!({ "id": user.id, "username": user.username, "role": user.role })
}

fn can_write(user: &AuthUser, item: &Todo) -> bool {
    item.owner_id == user.id || user.role == "admin"
}

async fn cors(req: Request, next: Next) -> Response {
    if req.method() == Method::OPTIONS {
        let mut res = Response::new(axum::body::Body::empty());
        *res.status_mut() = StatusCode::NO_CONTENT;
        set_cors(res.headers_mut());
        return res;
    }
    let mut res = next.run(req).await;
    set_cors(res.headers_mut());
    res
}

fn set_cors(headers: &mut axum::http::HeaderMap) {
    headers.insert(
        header::ACCESS_CONTROL_ALLOW_ORIGIN,
        HeaderValue::from_static("*"),
    );
    headers.insert(
        header::ACCESS_CONTROL_ALLOW_METHODS,
        HeaderValue::from_static("GET,POST,PATCH,DELETE,OPTIONS"),
    );
    headers.insert(
        header::ACCESS_CONTROL_ALLOW_HEADERS,
        HeaderValue::from_static("Content-Type,Authorization"),
    );
}

async fn auth(
    State(st): State<Arc<App>>,
    mut req: Request,
    next: Next,
) -> Result<Response, ApiError> {
    let header = req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    if !header.starts_with("Bearer ") {
        return Err(api_err(StatusCode::UNAUTHORIZED, "unauthorized"));
    }
    let token = header[7..].trim();
    let data = decode::<Claims>(
        token,
        &DecodingKey::from_secret(SECRET),
        &Validation::new(Algorithm::HS256),
    )
    .map_err(|_| api_err(StatusCode::UNAUTHORIZED, "unauthorized"))?;
    let id: i64 = data
        .claims
        .sub
        .parse()
        .map_err(|_| api_err(StatusCode::UNAUTHORIZED, "unauthorized"))?;
    let user = st
        .users
        .iter()
        .find(|u| u.id == id)
        .ok_or_else(|| api_err(StatusCode::UNAUTHORIZED, "unauthorized"))?;
    req.extensions_mut().insert(AuthUser {
        id: user.id,
        username: user.username.clone(),
        role: user.role.clone(),
    });
    Ok(next.run(req).await)
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok" }))
}

async fn login(
    State(st): State<Arc<App>>,
    Json(body): Json<LoginIn>,
) -> Result<Json<serde_json::Value>, ApiError> {
    let user = st
        .users
        .iter()
        .find(|u| u.username == body.username)
        .ok_or_else(|| api_err(StatusCode::UNAUTHORIZED, "invalid credentials"))?;
    if !bcrypt::verify(&body.password, &user.password_hash).unwrap_or(false) {
        return Err(api_err(StatusCode::UNAUTHORIZED, "invalid credentials"));
    }
    let exp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as usize
        + 3600;
    let claims = Claims {
        sub: user.id.to_string(),
        username: user.username.clone(),
        role: user.role.clone(),
        exp,
    };
    let token = encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(SECRET),
    )
    .map_err(|_| api_err(StatusCode::INTERNAL_SERVER_ERROR, "sign failed"))?;
    Ok(Json(serde_json::json!({
        "token": token,
        "user": { "id": user.id, "username": user.username, "role": user.role }
    })))
}

async fn me(Extension(user): Extension<AuthUser>) -> Json<serde_json::Value> {
    Json(public_user(&user))
}

async fn list(
    State(st): State<Arc<App>>,
    Extension(user): Extension<AuthUser>,
) -> Json<serde_json::Value> {
    let todos = st.todos.lock().unwrap();
    let items: Vec<Todo> = todos
        .iter()
        .filter(|t| user.role == "admin" || t.owner_id == user.id)
        .cloned()
        .collect();
    Json(serde_json::json!({ "items": items }))
}

async fn create(
    State(st): State<Arc<App>>,
    Extension(user): Extension<AuthUser>,
    Json(body): Json<CreateIn>,
) -> Result<(StatusCode, Json<Todo>), ApiError> {
    let title = body.title.trim();
    if title.is_empty() {
        return Err(api_err(StatusCode::BAD_REQUEST, "title is required"));
    }
    let mut next_id = st.next_id.lock().unwrap();
    let item = Todo {
        id: *next_id,
        title: title.to_string(),
        done: false,
        owner_id: user.id,
    };
    *next_id += 1;
    st.todos.lock().unwrap().push(item.clone());
    Ok((StatusCode::CREATED, Json(item)))
}

async fn patch_todo(
    State(st): State<Arc<App>>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<i64>,
    Json(body): Json<PatchIn>,
) -> Result<Json<Todo>, ApiError> {
    let mut todos = st.todos.lock().unwrap();
    let item = todos
        .iter_mut()
        .find(|t| t.id == id)
        .ok_or_else(|| api_err(StatusCode::NOT_FOUND, "todo not found"))?;
    if !can_write(&user, item) {
        return Err(api_err(StatusCode::FORBIDDEN, "forbidden"));
    }
    if let Some(title) = body.title {
        let title = title.trim();
        if !title.is_empty() {
            item.title = title.to_string();
        }
    }
    if let Some(done) = body.done {
        item.done = done;
    }
    Ok(Json(item.clone()))
}

async fn delete_todo(
    State(st): State<Arc<App>>,
    Extension(user): Extension<AuthUser>,
    Path(id): Path<i64>,
) -> Result<StatusCode, ApiError> {
    let mut todos = st.todos.lock().unwrap();
    let index = todos
        .iter()
        .position(|t| t.id == id)
        .ok_or_else(|| api_err(StatusCode::NOT_FOUND, "todo not found"))?;
    if !can_write(&user, &todos[index]) {
        return Err(api_err(StatusCode::FORBIDDEN, "forbidden"));
    }
    todos.remove(index);
    Ok(StatusCode::NO_CONTENT)
}

fn seed_user(id: i64, username: &str, role: &str) -> User {
    User {
        id,
        username: username.to_string(),
        role: role.to_string(),
        password_hash: bcrypt::hash("password", bcrypt::DEFAULT_COST).unwrap(),
    }
}

#[tokio::main]
async fn main() {
    let state = Arc::new(App {
        users: vec![
            seed_user(1, "demo", "user"),
            seed_user(2, "admin", "admin"),
        ],
        next_id: Mutex::new(1),
        todos: Mutex::new(Vec::new()),
    });
    let protected = Router::new()
        .route("/me", get(me))
        .route("/todos", get(list).post(create))
        .route("/todos/{id}", patch(patch_todo).delete(delete_todo))
        .layer(middleware::from_fn_with_state(state.clone(), auth));
    let app = Router::new()
        .route("/health", get(health))
        .route("/login", post(login))
        .merge(protected)
        .layer(middleware::from_fn(cors))
        .with_state(state);
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8024").await.unwrap();
    println!("Axum auth-todo listening on http://localhost:8024");
    axum::serve(listener, app).await.unwrap();
}
