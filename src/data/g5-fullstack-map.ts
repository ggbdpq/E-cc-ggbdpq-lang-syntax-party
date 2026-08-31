import type { GuideCategory } from './types';

/** 前端转全栈的心智模型：先搞清楚请求走完一圈，再对照五语言写法。 */
export const fullstackMindset: GuideCategory = {
  id: 'fs-mindset',
  title: { zh: '先建立全栈地图', en: 'Build the map first' },
  topics: [
    {
      id: 'fs-loop',
      title: { zh: '一个请求走完一圈', en: 'One request, full loop' },
      description: {
        zh: '后端不是另一套语法，是同一条 fetch 在服务器上拆成了这些层。缺哪一层，前端就会看到对应的失败形态。',
        en: 'Backend is the same fetch, split into layers on the server. Missing a layer shows up as a specific frontend failure.',
      },
      lang: 'bash',
      langLabel: 'Map',
      color: '#38bdf8',
      code: `浏览器
  fetch('/api/todos', { method:'POST', headers, body, credentials })
        │
        ▼
  CORS 预检 OPTIONS          ← 控制台：blocked by CORS policy
        │
        ▼
  路由匹配 GET/POST/PATCH    ← 404 / Cannot POST
        │
        ▼
  中间件：日志 / 限流 / 鉴权  ← 401 未登录  403 没权限  429 太频繁
        │
        ▼
  读 Path / Query / Header / Body
        │
        ▼
  校验 schema                ← 400 / 422 字段错误
        │
        ▼
  业务 service
        │
        ├── 读缓存 Redis      ← 列表秒开 或 脏数据
        ├── 写库 + 事务       ← 500 / 数据写了一半
        └── 异步任务/SSE      ← 前端轮询或 EventSource
        │
        ▼
  统一响应 { code, message, data } + HTTP 状态码
        │
        ▼
  前端：表格 / Toast / 跳登录 / 重试`,
    },
    {
      id: 'fs-transfer',
      title: { zh: '你已经会的前端，对应后端哪一层', en: 'Frontend skills → backend layers' },
      description: {
        zh: '转全栈不是从零学语言，是给每个你每天都在用的前端动作找服务端落点。',
        en: 'Full-stack is not learning languages from zero. Map each frontend move you already make onto a server layer.',
      },
      lang: 'bash',
      langLabel: 'Map',
      color: '#38bdf8',
      code: `前端你已经会的                后端对应层                 本页主题
────────────────────────────────────────────────────────────────
fetch(url, {method, body})    路由 + Handler              从 fetch 到 Handler
RESTful 资源路径              动词 × 资源设计             REST 资源与动词
searchParams / 动态路由       Path / Query / Body         读完一个请求
跨域报错                      Access-Control-*            CORS
res.ok / status               状态码 + 统一信封           状态码与统一响应
Authorization / cookie        JWT 或 Session              Cookie 与 JWT
登录态跳转                    鉴权中间件                  鉴权中间件
角色按钮隐藏                  RBAC                        角色与权限
.env / import.meta.env        环境变量                    配置与环境变量
表格 CRUD                     内存/SQL CRUD               内存 CRUD / SQL CRUD
提交失败回滚                  BEGIN/COMMIT                事务
SWR / 本地缓存                Redis                       Redis 缓存
FormData 上传                 multipart                   文件上传
antd Table 分页               LIMIT + COUNT               分页列表
console.error / Sentry        结构化日志 + 全局异常       日志 / 全局异常
vitest / playwright           单测 + 接口测               测试
EventSource / WS              SSE                         服务端推送
429 重试                      限流                        限流
docker compose 起依赖         Dockerfile + 健康检查       Docker 与健康检查`,
    },
    {
      id: 'fs-how-to-study',
      title: { zh: '这一页怎么学（前端转全栈顺序）', en: 'How to study this path' },
      description: {
        zh: '不要先把五语言语法刷完再碰服务。语法页当字典，这一页当主线，实验室当考场。',
        en: 'Do not finish all syntax topics before touching a server. Syntax is the dictionary, this page is the spine, labs are the exam.',
      },
      lang: 'bash',
      langLabel: 'Plan',
      color: '#38bdf8',
      code: `第 1 天  读完「一个请求走完一圈」
         打开实验室，把 GET /hello 五个端口 curl 通

第 2 天  HTTP 层：fetch → Handler、REST、读请求、CORS、状态码
         对照你项目里真实的 axios/fetch 封装看一遍

第 3 天  跑通 Todo CRUD 实验室（端口 8011–8015）
         用 curl 走完 GET/POST/PATCH/DELETE，再写一个前端页面打它

第 4 天  跑通 JWT Todo 实验室（端口 8021–8025）
         curl /login 拿 token，无 token 期望 401，再打自己的 /todos
         用 admin 账号体会「别人的 todo」返回 403

第 5 天  数据层：env、SQL CRUD、事务、Redis
         MySQL 速成页补查询基本功，这一页补「应用代码怎么连库」

第 6 天  上线层：日志、全局异常、上传、分页、测试、Docker、限流、SSE

字典用法
  五语言语法页：某句语法卡壳时去查
  JSON / Git / MySQL：工具课，穿插，不要当主线
  框架实战（语法页底部）：和本页重叠的主题，当作第二种写法参考`,
    },
    {
      id: 'fs-pages',
      title: { zh: '和站内其他页签怎么分工', en: 'How the other tabs fit' },
      lang: 'bash',
      langLabel: 'Map',
      color: '#38bdf8',
      code: `页签            解决什么                         解决不了什么
────────────────────────────────────────────────────────────
全栈核心        请求链路、岗位动作、五语言对照     把服务跑起来（去实验室）
动手实验室      Hello + Todo + JWT 可运行契约     数据库/Redis 真集群
五语言语法      变量/函数/并发/算法怎么写         一个 HTTP 服务如何分层
JSON 速成       六种类型、Schema、安全陷阱        业务 API 设计
Git & GitHub    日常提交、分支、PR                服务端架构
MySQL 速成      SELECT/JOIN/事务/索引             应用代码如何连库、如何分页

原则：主线只有一条——全栈核心 + 实验室。
其余页签是字典和工具课，按需跳转。`,
    },
  ],
};
