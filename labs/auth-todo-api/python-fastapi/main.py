from datetime import datetime, timedelta, timezone
from itertools import count

import bcrypt
import jwt
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

SECRET = "syntax-party-jwt-lab"
ALGO = "HS256"

app = FastAPI(title="Python FastAPI - JWT Todo")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_error(_req, exc: HTTPException):
    msg = exc.detail if isinstance(exc.detail, str) else "error"
    return JSONResponse({"error": msg}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_error(_req, _exc: RequestValidationError):
    return JSONResponse({"error": "invalid body"}, status_code=400)


def _hash(raw: str) -> bytes:
    return bcrypt.hashpw(raw.encode(), bcrypt.gensalt())


_users = [
    {"id": 1, "username": "demo", "role": "user", "password_hash": _hash("password")},
    {"id": 2, "username": "admin", "role": "admin", "password_hash": _hash("password")},
]
_ids = count(1)
_todos: list[dict] = []


class LoginIn(BaseModel):
    username: str
    password: str


class CreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class PatchIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    done: bool | None = None


def _public_user(user: dict) -> dict:
    return {"id": user["id"], "username": user["username"], "role": user["role"]}


def _find_user(username: str) -> dict | None:
    return next((u for u in _users if u["username"] == username), None)


def _user_by_id(uid: int) -> dict | None:
    return next((u for u in _users if u["id"] == uid), None)


def current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "unauthorized")
    token = authorization[7:].strip()
    try:
        payload = jwt.decode(token, SECRET, algorithms=[ALGO])
        uid = int(payload["sub"])
    except Exception:
        raise HTTPException(401, "unauthorized")
    user = _user_by_id(uid)
    if user is None:
        raise HTTPException(401, "unauthorized")
    return user


def _find_todo(todo_id: int) -> dict | None:
    return next((t for t in _todos if t["id"] == todo_id), None)


def _can_write(user: dict, item: dict) -> bool:
    return item["ownerId"] == user["id"] or user["role"] == "admin"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/login")
def login(body: LoginIn):
    user = _find_user(body.username)
    if user is None or not bcrypt.checkpw(body.password.encode(), user["password_hash"]):
        raise HTTPException(401, "invalid credentials")
    token = jwt.encode(
        {
            "sub": str(user["id"]),
            "username": user["username"],
            "role": user["role"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        },
        SECRET,
        algorithm=ALGO,
    )
    return {"token": token, "user": _public_user(user)}


@app.get("/me")
def me(user: dict = Depends(current_user)):
    return _public_user(user)


@app.get("/todos")
def list_todos(user: dict = Depends(current_user)):
    if user["role"] == "admin":
        items = _todos
    else:
        items = [t for t in _todos if t["ownerId"] == user["id"]]
    return {"items": items}


@app.post("/todos", status_code=201)
def create_todo(body: CreateIn, user: dict = Depends(current_user)):
    item = {"id": next(_ids), "title": body.title, "done": False, "ownerId": user["id"]}
    _todos.append(item)
    return item


@app.patch("/todos/{todo_id}")
def patch_todo(todo_id: int, body: PatchIn, user: dict = Depends(current_user)):
    item = _find_todo(todo_id)
    if item is None:
        raise HTTPException(404, "todo not found")
    if not _can_write(user, item):
        raise HTTPException(403, "forbidden")
    if body.title is not None:
        item["title"] = body.title
    if body.done is not None:
        item["done"] = body.done
    return item


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, user: dict = Depends(current_user)):
    item = _find_todo(todo_id)
    if item is None:
        raise HTTPException(404, "todo not found")
    if not _can_write(user, item):
        raise HTTPException(403, "forbidden")
    _todos.remove(item)
    return Response(status_code=204)
