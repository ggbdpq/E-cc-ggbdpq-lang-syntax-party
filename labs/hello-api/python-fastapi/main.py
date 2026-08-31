from fastapi import FastAPI

app = FastAPI(title="Python FastAPI - Hello")


@app.get("/hello")
def hello():
    return {"message": "Hello World", "language": "Python", "framework": "FastAPI"}
