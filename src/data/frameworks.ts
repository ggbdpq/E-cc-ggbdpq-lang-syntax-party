import type { Bilingual, LangId } from './types';

export interface FrameworkInfo {
  name: string;
  /** 社区热度分层（定性描述，避免过时数字） */
  tier: Bilingual;
  /** 一句话定位 */
  tagline: Bilingual;
  /** 风格特点 */
  style: Bilingual;
  /** 适用场景 */
  bestFor: Bilingual;
  /** 最小路由示例 */
  code: string;
}

export interface LangFrameworks {
  lang: LangId;
  frameworks: FrameworkInfo[];
}

export const FRAMEWORKS: LangFrameworks[] = [
  {
    lang: 'javascript',
    frameworks: [
      {
        name: 'Express',
        tier: { zh: '国民级', en: 'De facto standard' },
        tagline: { zh: '极简 Web 框架的事实标准', en: 'The de facto minimalist web framework' },
        style: { zh: '中间件管道模型，什么都要自己配', en: 'Middleware pipeline, bring your own everything' },
        bestFor: { zh: '快速原型、BFF 层、学习后端第一站', en: 'Prototypes, BFF layers, first stop learning backend' },
        code: `const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000);`,
      },
      {
        name: 'Koa',
        tier: { zh: '经典进阶', en: 'Classic evolution' },
        tagline: { zh: 'Express 原班人马的现代化重构', en: 'Modern rewrite by the Express team' },
        style: { zh: '洋葱圈中间件模型，async/await 原生支持', en: 'Onion middleware model, native async/await' },
        bestFor: { zh: '需要精细控制中间件执行顺序的网关/代理层', en: 'Gateways needing precise middleware control' },
        code: `const Koa = require('koa');
const app = new Koa();

// 洋葱模型：next() 前后都可以写逻辑
app.use(async (ctx, next) => {
  if (ctx.path === '/hello') {
    ctx.body = { message: 'Hello World' };
  }
  await next();
});

app.listen(3000);`,
      },
      {
        name: 'NestJS',
        tier: { zh: '企业级热门', en: 'Enterprise favorite' },
        tagline: { zh: 'Node 界的 Spring Boot', en: 'Spring Boot for the Node world' },
        style: { zh: 'TypeScript + 装饰器 + 依赖注入，架构规整', en: 'TypeScript + decorators + DI, opinionated architecture' },
        bestFor: { zh: '大型团队、复杂业务、微服务', en: 'Large teams, complex domains, microservices' },
        code: `import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/hello')
  hello() {
    return { message: 'Hello World' };
  }
}`,
      },
      {
        name: 'Next.js',
        tier: { zh: '全栈最热', en: 'Hottest full-stack' },
        tagline: { zh: 'React 官方推荐的全栈框架', en: 'The React full-stack framework' },
        style: { zh: '文件即路由，SSR/SSG/API 一体化', en: 'File-based routing, SSR/SSG/API in one' },
        bestFor: { zh: '前后端一体的 React 应用、官网、SaaS', en: 'React apps, marketing sites, SaaS products' },
        code: `// app/api/hello/route.ts —— 文件路径即路由
export async function GET() {
  return Response.json({ message: 'Hello World' });
}`,
      },
      {
        name: 'Nuxt',
        tier: { zh: 'Vue 全栈首选', en: 'Top pick for Vue' },
        tagline: { zh: 'Vue 生态的全栈答案', en: "Vue ecosystem's full-stack answer" },
        style: { zh: '约定优于配置，server/ 目录自动注册 API', en: 'Convention over config, auto-registered server APIs' },
        bestFor: { zh: 'Vue 技术栈的全栈应用', en: 'Full-stack apps on the Vue stack' },
        code: `// server/api/hello.ts —— 自动映射为 /api/hello
export default defineEventHandler(() => {
  return { message: 'Hello World' };
});`,
      },
    ],
  },
  {
    lang: 'python',
    frameworks: [
      {
        name: 'Flask',
        tier: { zh: '国民级经典', en: 'Beloved classic' },
        tagline: { zh: '微框架鼻祖，简单而自由', en: 'The original micro-framework' },
        style: { zh: '核心极小，功能全靠插件组合', en: 'Tiny core, everything via extensions' },
        bestFor: { zh: '小项目、教学、内部工具', en: 'Small projects, teaching, internal tools' },
        code: `from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/hello')
def hello():
    return jsonify(message='Hello World')`,
      },
      {
        name: 'Django',
        tier: { zh: '全家桶标杆', en: 'Batteries included' },
        tagline: { zh: '"开箱即用" 的完美主义框架', en: 'The perfectionist framework with deadlines' },
        style: { zh: 'ORM/Admin/模板/认证全内置，MTV 架构', en: 'ORM/Admin/templates/auth built-in, MTV pattern' },
        bestFor: { zh: '内容站点、管理后台、快速交付完整产品', en: 'Content sites, admin panels, full products fast' },
        code: `# views.py
from django.http import JsonResponse

def hello(request):
    return JsonResponse({'message': 'Hello World'})

# urls.py
from django.urls import path
urlpatterns = [path('hello', hello)]`,
      },
      {
        name: 'FastAPI',
        tier: { zh: '近年最火', en: 'Rising star' },
        tagline: { zh: '类型注解驱动的现代异步框架', en: 'Modern async framework driven by type hints' },
        style: { zh: 'Pydantic 校验 + 自动生成 OpenAPI 文档', en: 'Pydantic validation + auto OpenAPI docs' },
        bestFor: { zh: 'AI 推理接口、数据服务、高性能 API', en: 'AI inference APIs, data services, high-perf APIs' },
        code: `from fastapi import FastAPI

app = FastAPI()

@app.get('/hello')
def hello():
    return {'message': 'Hello World'}

# 自带交互文档: /docs`,
      },
      {
        name: 'Tornado',
        tier: { zh: '老牌异步', en: 'Veteran async' },
        tagline: { zh: 'FriendFeed 开源的异步先驱', en: 'Async pioneer open-sourced by FriendFeed' },
        style: { zh: '自带事件循环，长连接/WebSocket 见长', en: 'Own event loop, excels at long-lived connections' },
        bestFor: { zh: 'WebSocket、长轮询、实时推送', en: 'WebSockets, long polling, realtime push' },
        code: `import tornado.web, tornado.ioloop

class HelloHandler(tornado.web.RequestHandler):
    def get(self):
        self.write({'message': 'Hello World'})

app = tornado.web.Application([(r'/hello', HelloHandler)])
app.listen(8000)
tornado.ioloop.IOLoop.current().start()`,
      },
    ],
  },
  {
    lang: 'java',
    frameworks: [
      {
        name: 'Spring Boot',
        tier: { zh: '事实标准', en: 'Industry standard' },
        tagline: { zh: 'Java 后端开发的普通话', en: 'The lingua franca of Java backends' },
        style: { zh: '自动配置 + 内嵌容器，约定优于配置', en: 'Auto-configuration + embedded server' },
        bestFor: { zh: '企业级应用的一切场景', en: 'Virtually every enterprise scenario' },
        code: `@SpringBootApplication
@RestController
public class Application {

    @GetMapping("/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello World");
    }

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}`,
      },
      {
        name: 'Spring Cloud',
        tier: { zh: '微服务标配', en: 'Microservices suite' },
        tagline: { zh: '微服务治理全家桶', en: 'Microservices governance toolkit' },
        style: { zh: '注册中心/配置中心/网关/熔断一整套', en: 'Discovery, config, gateway, circuit breakers' },
        bestFor: { zh: '多团队协作的大型微服务体系', en: 'Large microservice systems across teams' },
        code: `@SpringBootApplication
@EnableDiscoveryClient  // 注册到 Nacos/Eureka
public class UserServiceApplication { /* ... */ }

// Feign 声明式调用其他服务
@FeignClient(name = "order-service")
interface OrderClient {
    @GetMapping("/hello")
    Map<String, String> hello();
}`,
      },
      {
        name: 'Quarkus',
        tier: { zh: '云原生新锐', en: 'Cloud-native challenger' },
        tagline: { zh: '为容器和 Serverless 而生的超音速 Java', en: 'Supersonic Java for containers & Serverless' },
        style: { zh: 'GraalVM 原生编译，毫秒级启动', en: 'GraalVM native builds, millisecond startup' },
        bestFor: { zh: 'K8s 弹性伸缩、函数计算', en: 'K8s autoscaling, FaaS workloads' },
        code: `import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import java.util.Map;

@Path("/hello")
public class HelloResource {

    @GET
    public Map<String, String> hello() {
        return Map.of("message", "Hello World");
    }
}`,
      },
      {
        name: 'Vert.x',
        tier: { zh: '响应式高性能', en: 'Reactive powerhouse' },
        tagline: { zh: 'JVM 上的事件驱动工具箱', en: 'Event-driven toolkit for the JVM' },
        style: { zh: 'Netty 式异步非阻塞，不是框架是工具包', en: 'Netty-style async, a toolkit not a framework' },
        bestFor: { zh: '高并发 IO、网关、实时系统', en: 'High-concurrency IO, gateways, realtime systems' },
        code: `Vertx vertx = Vertx.vertx();
Router router = Router.router(vertx);

router.get("/hello").handler(ctx ->
    ctx.json(Map.of("message", "Hello World")));

vertx.createHttpServer()
     .requestHandler(router)
     .listen(8080);`,
      },
    ],
  },
  {
    lang: 'go',
    frameworks: [
      {
        name: 'Gin',
        tier: { zh: '最热', en: 'Most popular' },
        tagline: { zh: 'Go Web 框架的人气王', en: 'The popularity king of Go web frameworks' },
        style: { zh: '类 Express 的 API，性能与简洁兼得', en: 'Express-like API, fast and simple' },
        bestFor: { zh: 'REST API 的默认选择', en: 'Default choice for REST APIs' },
        code: `r := gin.Default()

r.GET("/hello", func(c *gin.Context) {
    c.JSON(200, gin.H{"message": "Hello World"})
})

r.Run(":8080")`,
      },
      {
        name: 'Echo',
        tier: { zh: '热门', en: 'Popular' },
        tagline: { zh: '高性能且 API 设计优雅', en: 'High performance with elegant API design' },
        style: { zh: '中间件/绑定/校验开箱即用', en: 'Middleware, binding, validation out of the box' },
        bestFor: { zh: '追求开发效率的 API 服务', en: 'API services valuing developer ergonomics' },
        code: `e := echo.New()

e.GET("/hello", func(c echo.Context) error {
    return c.JSON(200, map[string]string{
        "message": "Hello World",
    })
})

e.Start(":1323")`,
      },
      {
        name: 'Fiber',
        tier: { zh: '极速新锐', en: 'Speedy newcomer' },
        tagline: { zh: 'Express 口味的 Go 框架', en: 'Express-flavored Go framework' },
        style: { zh: '基于 fasthttp，零内存分配取向', en: 'Built on fasthttp, zero-allocation mindset' },
        bestFor: { zh: 'Node 开发者转 Go、极致 QPS 场景', en: 'Node devs moving to Go, extreme QPS needs' },
        code: `app := fiber.New()

app.Get("/hello", func(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{"message": "Hello World"})
})

app.Listen(":3000")  // API 和 Express 几乎一样`,
      },
      {
        name: 'go-zero',
        tier: { zh: '微服务实战派', en: 'Pragmatic microservices' },
        tagline: { zh: '带代码生成的微服务框架', en: 'Microservices framework with code generation' },
        style: { zh: '.api 文件定义接口，goctl 生成整套代码', en: 'Define APIs in .api files, goctl generates everything' },
        bestFor: { zh: '需要限流熔断自适应的生产级微服务', en: 'Production microservices with adaptive protection' },
        code: `// hello.api —— 接口即文档，代码自动生成
type HelloResp {
    Message string \`json:"message"\`
}

service hello-api {
    @handler hello
    get /hello returns (HelloResp)
}
// goctl api go -api hello.api -dir .`,
      },
      {
        name: 'Beego',
        tier: { zh: '老牌全栈', en: 'Veteran full-stack' },
        tagline: { zh: 'Go 界的 Django', en: "Django of the Go world" },
        style: { zh: 'MVC 全家桶，ORM/缓存/日志内置', en: 'Full MVC stack with ORM, cache, logs built in' },
        bestFor: { zh: '传统 MVC Web 应用、内部系统', en: 'Traditional MVC apps, internal systems' },
        code: `type HelloController struct {
    beego.Controller
}

func (c *HelloController) Get() {
    c.Data["json"] = map[string]string{
        "message": "Hello World",
    }
    c.ServeJSON()
}

func main() {
    beego.Router("/hello", &HelloController{})
    beego.Run()
}`,
      },
    ],
  },
  {
    lang: 'rust',
    frameworks: [
      {
        name: 'Axum',
        tier: { zh: '新主流', en: 'Rising mainstream' },
        tagline: { zh: 'Tokio 团队亲儿子，当前社区首选', en: 'By the Tokio team, current community favorite' },
        style: { zh: '类型安全的提取器模式，Tower 中间件生态', en: 'Type-safe extractors, Tower middleware ecosystem' },
        bestFor: { zh: 'Rust Web 的默认起点', en: 'Default starting point for Rust web' },
        code: `use axum::{routing::get, Router, Json};
use serde_json::{json, Value};

async fn hello() -> Json<Value> {
    Json(json!({"message": "Hello World"}))
}

let app = Router::new().route("/hello", get(hello));
let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
    .await.unwrap();
axum::serve(listener, app).await.unwrap();`,
      },
      {
        name: 'Actix-web',
        tier: { zh: '性能标杆', en: 'Performance benchmark' },
        tagline: { zh: '常年霸榜 TechEmpower 的性能怪兽', en: 'Long-time TechEmpower leaderboard beast' },
        style: { zh: 'Actor 模型血统，宏定义路由直观', en: 'Actor-model heritage, intuitive macro routing' },
        bestFor: { zh: '对延迟和吞吐极度敏感的服务', en: 'Latency/throughput-critical services' },
        code: `use actix_web::{get, App, HttpServer, Responder};

#[get("/hello")]
async fn hello() -> impl Responder {
    actix_web::web::Json(
        serde_json::json!({"message": "Hello World"})
    )
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| App::new().service(hello))
        .bind(("0.0.0.0", 8080))?
        .run()
        .await
}`,
      },
      {
        name: 'Rocket',
        tier: { zh: '开发体验派', en: 'Developer experience' },
        tagline: { zh: '让写 Rust Web 像写 Python 一样快乐', en: 'Makes Rust web feel like Python' },
        style: { zh: '宏魔法最多，请求守卫声明式校验', en: 'Most macro magic, declarative request guards' },
        bestFor: { zh: '快速开发、个人项目、原型验证', en: 'Rapid development, side projects, prototypes' },
        code: `#[macro_use] extern crate rocket;
use rocket::serde::json::{json, Value};

#[get("/hello")]
fn hello() -> Value {
    json!({"message": "Hello World"})
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![hello])
}`,
      },
      {
        name: 'Loco',
        tier: { zh: '全栈新锐', en: 'Full-stack newcomer' },
        tagline: { zh: 'Rust 界的 Ruby on Rails', en: 'Ruby on Rails for Rust' },
        style: { zh: '约定优于配置：ORM/任务/邮件/认证全家桶', en: 'Convention over config: ORM/jobs/mail/auth in one' },
        bestFor: { zh: '想用 Rust 快速交付完整产品的场景', en: 'Shipping full products fast in Rust' },
        code: `// src/controllers/hello.rs
use loco_rs::prelude::*;

async fn hello() -> Result<Response> {
    format::json(json!({"message": "Hello World"}))
}

pub fn routes() -> Routes {
    Routes::new().add("/hello", get(hello))
}`,
      },
    ],
  },
];
