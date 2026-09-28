# Syntax Party 技术文章系列：前端转全栈，从入门到精通

本系列是 syntax-party 网站的配套文字课。网站解决「这句话五种语言怎么写」，本系列解决「为什么这么写、写完怎么跑起来、跑起来之后还差什么」。所有代码示例都可以在网站的对应页签找到五语言并排版本，所有命令都可以在仓库里直接执行验证。

## 适用读者

会一门前端框架（React/Vue 皆可），每天在写 `fetch`、`axios`、表格 CRUD，但后端目录对你是黑盒的工程师。不需要任何后端语言基础。

## 学习路线

系列分四段，对应四种学习状态：

| 阶段 | 文章 | 你将获得 |
|------|------|----------|
| 入门 | 01–02 | 五种语言的基本语法地图，能读懂任何一段对照代码 |
| 进阶 | 03 | 泛型、空值安全等进阶特性，从「能写」到「写得对」 |
| 实战+全栈 | 04–09 | 三个实验室跑通 + HTTP/鉴权/数据/上线四层心智模型 |
| 精通 | 10–11 | 语言内核视角、算法基本功、BFF+Worker 架构课 |

## 目录

**入门篇：同一件事，五种写法**

1. [变量、控制流与函数：五语言第一课](./01-variables-control-flow-functions.md)
2. [数据结构、错误处理与并发：从值到服务](./02-data-structures-errors-concurrency.md)

**进阶篇：写得对**

3. [进阶特性：泛型、空值安全与迭代器](./03-advanced-features.md)

**全栈篇：一个请求的完整旅程**

4. [第一个 HTTP 服务：Hello API 实验室](./04-first-http-server.md)
5. [HTTP 层：REST、CORS 与状态码信封](./05-http-layer.md)
6. [Todo CRUD 实验室：四个动词的完整链路](./06-todo-crud-lab.md)
7. [鉴权层：JWT 实验室与 401/403 的来源](./07-auth-jwt.md)
8. [数据层：从内存到 MySQL 再到 Redis](./08-data-layer.md)
9. [上线层：日志、异常、分页与 Docker](./09-ship-layer.md)

**精通篇：内核与架构**

10. [语言内核视角与算法基本功](./10-internals-algorithms.md)
11. [架构课：BFF + Worker 分层](./11-bff-worker-architecture.md)

## 配套资源

- 网站六个页签：`npm run dev` 后访问 http://localhost:3000
- 三个可运行实验室：`labs/hello-api/`（端口 8001–8005）、`labs/todo-api/`（8011–8015）、`labs/auth-todo-api/`（8021–8025）
- 实验室结构校验：`npm test`（检查 15 个入口文件齐全、端口不冲突）
- 内容源数据：`src/data/` 下的纯 TypeScript 模块，网站所有对照代码都来自这里

## 约定

文中「五语言」指 Python (FastAPI) / Node.js (Express) / Java (Spring Boot) / Go (Gin) / Rust (Axum)。端口约定全网统一：Hello 系列占 8001–8005，Todo 占 8011–8015，JWT 占 8021–8025，网站本身占 3000。所有实验室已开 CORS，网站页面上可以直接 fetch 它们。
