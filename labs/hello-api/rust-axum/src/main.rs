use axum::{routing::get, Json, Router};
use serde::Serialize;

#[derive(Serialize)]
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
    println!("Axum listening on http://localhost:8004");
    axum::serve(listener, app).await.unwrap();
}
