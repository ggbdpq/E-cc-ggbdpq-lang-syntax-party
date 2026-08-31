import type { Category } from './types';

export const concurrency: Category = {
  id: 'concurrency',
  title: { zh: '并发', en: 'Concurrency' },
  topics: [
    {
      id: 'spawn-task',
      title: { zh: '启动并发任务', en: 'Spawn Concurrent Tasks' },
      description: {
        zh: 'goroutine 是并发模型的标杆；Python 有 GIL 的坑；JS 单线程事件循环。',
        en: "Goroutines set the bar; Python has the GIL caveat; JS is single-threaded event loop.",
      },
      snippets: {
        python: `import asyncio

async def fetch(name):
    await asyncio.sleep(0.1)  # 模拟 IO
    print(f"{name} 完成")

async def main():
    # 协程并发（单线程，适合 IO 密集）
    await asyncio.gather(fetch("A"), fetch("B"))

asyncio.run(main())

# 注意：CPU 密集任务受 GIL 限制，需多进程`,
        javascript: `async function fetch_(name) {
  await new Promise(r => setTimeout(r, 100));
  console.log(\`\${name} 完成\`);
}

// Promise.all 并发（单线程事件循环，IO 并行）
await Promise.all([fetch_("A"), fetch_("B")]);

// CPU 密集用 worker_threads（真正的多线程）`,
        java: `// 线程 + 线程池
ExecutorService pool = Executors.newFixedThreadPool(4);

pool.submit(() -> {
    System.out.println("A 完成");
});

// CompletableFuture 组合异步任务
CompletableFuture
    .supplyAsync(() -> "结果", pool)
    .thenAccept(System.out::println);

pool.shutdown();
// 真多线程，可利用多核`,
        go: `// go 关键字启动 goroutine，就这么简单
func worker(name string, ch chan string) {
    time.Sleep(100 * time.Millisecond)
    ch <- name + " 完成"
}

ch := make(chan string, 2)
go worker("A", ch)   // 轻量级线程，可开百万个
go worker("B", ch)

fmt.Println(<-ch, <-ch)  // channel 通信
// 哲学：不要共享内存来通信，而要通信来共享内存`,
        rust: `// std::thread 原生线程
use std::thread;

let handle = thread::spawn(|| {
    "A 完成"  // 闭包返回值通过 join 取回
});

println!("{}", handle.join().unwrap());

// async/await（需 tokio 等运行时）
// tokio::spawn(async { ... });
// 编译器保证线程安全：Send/Sync 约束`,
      },
    },
  ],
};

export const modules: Category = {
  id: 'modules',
  title: { zh: '模块与包', en: 'Modules & Packages' },
  topics: [
    {
      id: 'import-module',
      title: { zh: '导入模块', en: 'Import Modules' },
      snippets: {
        python: `# import 的四种姿势
import math                # 整个模块
import numpy as np         # 起别名
from os import getcwd      # 导入成员
from pathlib import Path as P

print(math.sqrt(16))       # 4.0

# 包管理: pip install <pkg>
# 依赖声明: requirements.txt / pyproject.toml`,
        javascript: `// CommonJS（Node 传统方式）
const fs = require("fs");
const { readFileSync } = require("fs");

// ES Module（现代方式，.mjs 或 type:module）
// import fs from "node:fs";
// import { readFileSync } from "node:fs";

// 包管理: npm install <pkg>
// 依赖声明: package.json`,
        java: `// import 导入类（文件顶部）
import java.util.List;
import java.util.ArrayList;
import static java.lang.Math.sqrt;  // 静态导入

public class Main {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        System.out.println(sqrt(16));
    }
}
// 包管理: Maven / Gradle
// 依赖声明: pom.xml / build.gradle`,
        go: `import (
    "fmt"              // 标准库
    "strings"

    "github.com/gin-gonic/gin"  // 第三方包（URL 即路径）
)

// 包内大写开头 = 导出（公开），小写 = 私有
fmt.Println(strings.ToUpper("go"))

// 包管理: go get <pkg>
// 依赖声明: go.mod`,
        rust: `// use 引入路径（crate 内模块或外部库）
use std::collections::HashMap;
use std::fs::{self, File};      // 花括号合并导入
use serde::Serialize as Ser;    // 起别名

// mod 声明本 crate 内的模块
// mod utils;

// 包管理: cargo add <crate>
// 依赖声明: Cargo.toml`,
      },
    },
  ],
};
