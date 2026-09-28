# 04 第一个 HTTP 服务：Hello API 实验室

> 对应网站页签：🧪 动手实验室 → 第一关；源码 `labs/hello-api/`。网站数据源 `src/data/g4-labs.ts` 的 `labRunbook`。

## 先说结论

后端框架没有魔法。一个 HTTP 服务 = **一个监听端口的进程 + 一张「方法 × 路径 → 函数」的对照表 + 你写的处理函数**。这一篇带你把五门语言的 Hello 服务全部跑起来，亲眼确认这句话。

## 3 分钟版：先跑起来

五门语言各占一个端口（8001–8005），每条命令在对应目录下执行：

```bash
# Python FastAPI :8001
cd labs/hello-api/python-fastapi
python -m uvicorn main:app --port 8001

# Node Express :8002
cd labs/hello-api/node-express
npm install && npm start

# Go Gin :8003
cd labs/hello-api/go-gin
go run .

# Rust Axum :8004
cd labs/hello-api/rust-axum
cargo run

# Java Spring Boot :8005
cd java-springboot
mvn -s settings-aliyun.xml package -DskipTests
java -jar target/hello-springboot-0.0.1.jar
```

验证——五个端口各 curl 一次，响应格式统一：

```bash
curl http://localhost:8001/hello
# {"message":"Hello World","language":"Python","framework":"FastAPI"}
```

跑通之后，回到网站 🧪 动手实验室页签，「GET /hello 同一份契约」把五段源码并排放好了，对照你刚跑的服务读。

## 五段源码，一个结构

Hello 实验室每个实现只有 8–27 行，是五门语言框架形态的最小标本。看 Python 和 Go 的：

```python
# labs/hello-api/python-fastapi/main.py（8 行）
from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
def hello():
    return {"message": "Hello World", "language": "Python", "framework": "FastAPI"}
```

```go
// labs/hello-api/go-gin/main.go（节选）
r := gin.Default()
r.GET("/hello", func(c *gin.Context) {
    c.JSON(200, gin.H{"message": "Hello World", "language": "Go", "framework": "Gin"})
})
r.Run(":8003")
```

剥掉语法，五段代码都做了同样的三件事：

1. **建一个应用/路由器实例**（`app` / `r` / `Router`）。
2. **注册路由**：把 `GET /hello` 绑到一个函数上。
3. **启动监听**（`listen` / `Run` / Spring Boot 的内嵌 Tomcat 由 `SpringApplication.run` 代劳）。

**初学者最容易混淆的一点**：Spring Boot 看起来和前四家完全不同——没有显式的路由注册。其实路由藏在了注解里（`@GetMapping("/hello")`），启动逻辑藏在了 `@SpringBootApplication` 的自动装配里。它不是没有这三步，是把三步都变成约定了。代价是你需要理解约定才能排错。

## 从 curl 到框架的对应关系

你在前端每发一次请求，对面就是这个结构的运行时：

| 你在前端 | 服务器上发生的事 | Hello 实验室里的位置 |
|----------|-----------------|---------------------|
| `fetch('http://localhost:8001/hello')` | 网卡收到 TCP 连接，框架解析 HTTP 报文 | uvicorn / Express / Tomcat / Gin / Tokio 的本职工作 |
| URL 和 method | 路由表查找 `GET /hello` | `@app.get("/hello")` 等注册的那一行 |
| `await res.json()` | 处理函数的返回值被序列化成 JSON 报文发回 | `return {...}` / `c.JSON(...)` |
| 控制台看到 CORS 报错 | 浏览器层面的检查，服务器响应缺了头 | 实验室已开 CORS，所以你不会遇到（见第 05 篇） |

## 各语言启动命令背后的包管理

跑命令时你会顺手接触五门语言的包管理器，提前认识一下：

| 语言 | 依赖文件 | 安装 | 运行 |
|------|---------|------|------|
| Python | `requirements.txt` | `pip install -r requirements.txt` | `python -m uvicorn main:app --port 8001` |
| Node | `package.json` | `npm install` | `npm start` |
| Go | `go.mod`（`go.sum` 锁版本） | 首次 `go run` 自动拉依赖 | `go run .`（编译+运行一体） |
| Rust | `Cargo.toml`（`Cargo.lock` 锁版本） | 首次 `cargo run` 自动拉依赖 | `cargo run` |
| Java | `pom.xml` | `mvn package` 时自动下载 | `java -jar target/*.jar` |

Java 那条 `-s settings-aliyun.xml` 是国内镜像配置，默认源拉不动依赖时用它。Rust 和 Go 一样是「编译型语言的 npm 体验」：`cargo run` 相当于 `tsc + node` 一步到位。

## 值得注意的细节

- **响应里带 `language` 和 `framework` 字段**不是随意的：这是让五个端口可以互相区分的最小自描述契约。设计 API 时「响应能自证身份」是个好习惯，排查端口串了、代理错了这类问题极其有用。
- **Java 8 + Spring Boot 2.7.18** 是刻意选的老版本组合（贴近国内存量项目现状），别在别的教程里看到 Spring Boot 3 就以为这里写错了。
- `npm test`（仓库根目录）会校验 15 个实验室入口文件齐全且端口不冲突。改完实验室结构跑一下它。

## 练习

1. 五个服务全部跑起来，全部 curl 通。把每个启动命令抄进自己的笔记——写第三遍时你应该已经记住了。
2. 故意把 8001 的服务停掉再 curl，观察连接拒绝（`ECONNREFUSED`）长什么样。这个报错形态值得记住：它意味着「进程没在」，而不是「路径不对」。
3. 把 Go 版的 `c.JSON(200, ...)` 改成 `c.JSON(201, ...)`，curl 看响应状态码变化，再改回去。
4. 打开网站 🧪 实验室页签，对照五语言并排源码重读一遍你刚跑的代码。

## 下一步

Hello 只有一个 GET，没有请求体、没有跨域问题、没有错误路径。第 05 篇把这些缺口补上：REST 资源设计、读 Path/Query/Body、CORS 到底是谁在拦你、状态码和统一响应信封。
