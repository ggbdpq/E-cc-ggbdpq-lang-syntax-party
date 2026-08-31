from itertools import count

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Python FastAPI - Todo")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_ids = count(1)
_todos: list[dict] = []


class CreateIn(BaseModel):
    title: str = Field(min_length=1, max_length=200)


class PatchIn(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    done: bool | None = None


def _find(todo_id: int) -> dict | None:
    return next((t for t in _todos if t["id"] == todo_id), None)


@app.get("/health")
def health():
    return {"status": "ok"}


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
    if body.title is not None:
        item["title"] = body.title
    if body.done is not None:
        item["done"] = body.done
    return item


@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    item = _find(todo_id)
    if item is None:
        raise HTTPException(404, "todo not found")
    _todos.remove(item)
    return Response(status_code=204)
