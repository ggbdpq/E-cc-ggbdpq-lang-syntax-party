# 09 上线层：日志、异常、分页与 Docker

> 对应网站页签：🛠️ 全栈核心 → 上线层。数据源 `src/data/g5-fullstack-ship.ts`（8 个主题，本系列全栈篇信息量最大的一篇）。

## 先说结论

上线层的八个主题——结构化日志、全局异常、文件上传、分页、测试、Docker 健康检查、限流、SSE——有一个共同的命名逻辑：**每一个都是你前端已有的动作在服务端的对应物**。网站这张映射表值得背下来：

| 你在前端 | 服务端对应物 |
|----------|-------------|
| `console.error` / Sentry | 结构化日志 + 全局异常 |
| FormData 上传 | multipart 解析 |
| antd Table 分页 | LIMIT + COUNT |
| vitest / playwright | 单测 + 接口测试 |
| docker compose 起依赖 | Dockerfile + 健康检查 |
| 429 重试 | 限流 |
| EventSource / WS | SSE |

## 全局异常：别让 500 变成 HTML

前端你封装过 axios 拦截器统一处理错误。服务端的对应物是**全局异常处理器**：业务代码里尽管抛，统一出口负责转成规范的 JSON 响应。

```python
# FastAPI：自定义异常处理器
@app.exception_handler(AppError)
async def app_error_handler(request, exc: AppError):
    return JSONResponse(status_code=exc.status, content={"error": exc.message})
```

```java
// Spring：@RestControllerAdvice 全局接管
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public Result<?> handleNotFound(NotFoundException e) {
        return Result.fail(404, e.getMessage());
    }
}
```

有了它，第 06 篇里每个处理函数手写的 `if (item is None) raise 404` 就统一了：业务代码抛 `NotFoundException`，全局处理器负责 404 JSON。**判断一个后端项目成熟度最快的办法：随便触发一个错误，看返回的是 JSON 还是框架默认错误页。** 返回 HTML 的 500 就是没做全局异常。

## 结构化日志：console.log 的工程版

`console.log("here")` 在服务端等于失明——上线后你看不到用户操作现场，日志是唯一证据。结构化日志的意思是每条日志是一个可检索的事件（JSON 行），至少带：时间、级别、请求 ID、路径、耗时。

为什么请求 ID 重要：一次请求可能跨多个函数甚至多个服务（第 11 篇的 BFF → Worker），靠请求 ID 把散落的日志串成一条完整链路。前端你在 Sentry 里按 issue 聚合错误，服务端就是按 request id 聚合日志——同一个排障思想。

## 分页：对接前端表格

antd Table 的 `current` + `pageSize`，服务端的标准实现是两条查询：

```sql
SELECT * FROM todos ORDER BY id DESC LIMIT 10 OFFSET 10;  -- 当前页数据
SELECT COUNT(*) FROM todos;                                -- 总数，算 total
```

Go/Java 等框架有现成分页插件（MyBatis-Plus 的 `Page`、GORM 的 `Scopes`），但底层都是这两条 SQL。网站「分页列表」主题提醒的一个真实成本：`COUNT(*)` 在大表上不便宜，业务上能不要总数就不要（改成「下一页」式游标分页）。

## 接口测试：比 UI 测试更早变绿

前端你信奉「比 UI 测试更早变绿」，服务端同理——接口测试的性价比高于 UI 测试，因为接口稳定而 UI 常变。最小闭环你其实已经会了：**curl 就是接口测试**。工程化一步是写成脚本：

```javascript
// 用 vitest 写接口测试（Node 实验室为例）
test('PATCH 不存在的 todo 返回 404', async () => {
  const res = await fetch('http://localhost:8012/todos/999', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: true }),
  });
  expect(res.status).toBe(404);
});
```

网站综合案例（电商订单状态机、泛型 LRU）都是天然的多分支逻辑，正是单测的好素材；JWT 实验室的 401/403/404 错误契约，天生就是一组测试用例清单。

## Docker 与健康检查

实验室的 `/health` 接口不是装饰。容器编排（K8s/compose）靠定期探这个接口判断进程死活，死了自动重启。健康检查是容器时代服务的基本礼貌：

```dockerfile
# 典型 Node 服务 Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 8012
CMD ["node", "index.js"]
# 健康检查由 compose/k8s 配置 curl http://localhost:8012/health
```

第 08 篇起依赖用的 `docker run mysql` 就是这个生态的一半：**依赖容器化、应用容器化、健康检查让编排系统接管生死**。

## 限流：429 与前端重试的合谋

你前端写过 429 重试逻辑，服务端的 429 是这么来的：中间件按 IP 或用户统计请求频率，超阈值返回 429 Too Many Requests。它是保护服务的第一道闸（防爬虫、防刷、防失控的前端轮询）。前后端在这里是**合谋关系**：服务端返回 429 时最好带上 `Retry-After` 头，前端的退避重试（网站「常用处理逻辑」章的「重试与指数退避」主题）按这个头等待——两端遵守同一份约定。

## SSE：EventSource 的对面

前端 `new EventSource('/api/progress')` 的对面，是一个保持连接、分块发送 `data: ...\n\n` 格式文本的响应。SSE 比 WebSocket 简单（单向、纯 HTTP），适合进度推送、通知流。AI 应用的流式输出（打字机效果）几乎都是 SSE——你天天在用，现在知道对面长什么样了。

## 文件上传

FormData 的对面是 multipart 编码解析。五语言框架全部内建：FastAPI 的 `UploadFile`、Express 配 `multer`、Spring 的 `MultipartFile`。要点只有两个：限制大小（内存攻击面）和校验类型（看内容魔数而不是文件名后缀）。 laboratories 没放这个实验室，网站「文件上传」主题有五语言代码对照。

## 上线层自检清单

一个「可以给别人用」的服务，按这个清单过：

- [ ] 任何错误路径返回 JSON 而不是框架错误页
- [ ] 日志带请求 ID，能按 ID 串起一次请求
- [ ] 大列表有分页，接口不会一次吐全表
- [ ] 接口测试覆盖核心路径和错误路径
- [ ] 有 `/health`，容器化后编排系统能探活
- [ ] 对外接口有限流，429 带重试提示
- [ ] 需要推送的场景用 SSE 而不是轮询

## 练习

1. 给 Todo 实验室（任选一门语言）补齐：全局 404 处理器 + 简单限流中间件（比如每 IP 每秒 10 次）。这是把上线层知识动手化的最小练习。
2. 把第 06 篇你跑过的 curl 全流程写成 vitest 接口测试（8 个用例：CRUD 四动词 + 404 + 400 + health + 分页）。
3. 给 8011 服务写 Dockerfile，`docker build` + `docker run` 后 curl `/health` 通。

## 下一步

到这里，五语言语法、HTTP、鉴权、数据、上线五层全部走完。精通篇先回头补两块底层修养——语言内核视角和算法基本功（第 10 篇），再看一个真实项目的架构分层（第 11 篇 BFF + Worker）。
