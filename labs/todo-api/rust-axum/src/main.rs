use axum::{
    extract::{Path, Request, State},
    http::{header, HeaderValue, Method, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::{get, patch},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};

#[derive(Clone, Serialize)]
struct Todo {
    id: i64,
    title: String,
    done: bool,
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
    next_id: Mutex<i64>,
    todos: Mutex<Vec<Todo>>,
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

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok" }))
}

async fn list(State(st): State<Arc<App>>) -> Json<serde_json::Value> {
    let items = st.todos.lock().unwrap().clone();
    Json(serde_json::json!({ "items": items }))
}

async fn create(
    State(st): State<Arc<App>>,
    Json(body): Json<CreateIn>,
) -> Result<(StatusCode, Json<Todo>), StatusCode> {
    let title = body.title.trim();
    if title.is_empty() {
        return Err(StatusCode::BAD_REQUEST);
    }
    let mut next_id = st.next_id.lock().unwrap();
    let item = Todo {
        id: *next_id,
        title: title.to_string(),
        done: false,
    };
    *next_id += 1;
    st.todos.lock().unwrap().push(item.clone());
    Ok((StatusCode::CREATED, Json(item)))
}

async fn patch_todo(
    State(st): State<Arc<App>>,
    Path(id): Path<i64>,
    Json(body): Json<PatchIn>,
) -> Result<Json<Todo>, StatusCode> {
    let mut todos = st.todos.lock().unwrap();
    let item = todos.iter_mut().find(|t| t.id == id).ok_or(StatusCode::NOT_FOUND)?;
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

async fn delete_todo(State(st): State<Arc<App>>, Path(id): Path<i64>) -> StatusCode {
    let mut todos = st.todos.lock().unwrap();
    let before = todos.len();
    todos.retain(|t| t.id != id);
    if todos.len() == before {
        StatusCode::NOT_FOUND
    } else {
        StatusCode::NO_CONTENT
    }
}

#[tokio::main]
async fn main() {
    let state = Arc::new(App {
        next_id: Mutex::new(1),
        todos: Mutex::new(Vec::new()),
    });
    let app = Router::new()
        .route("/health", get(health))
        .route("/todos", get(list).post(create))
        .route("/todos/{id}", patch(patch_todo).delete(delete_todo))
        .layer(middleware::from_fn(cors))
        .with_state(state);
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8014").await.unwrap();
    println!("Axum todo listening on http://localhost:8014");
    axum::serve(listener, app).await.unwrap();
}
