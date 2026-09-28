# 02 数据结构、错误处理与并发：从值到服务

> 对应网站页签：🎉 五语言语法 → 数据结构 / 错误处理 / 并发·模块 / 常用处理逻辑。数据源 `src/data/c4-data-structures.ts`、`c5-strings-errors.ts`、`c7-concurrency-modules.ts`、`c13-common-logic.ts`。

## 先说结论

这一篇讲三件事，重要程度递增：

1. **数据结构**：列表和字典两家，五门语言都有对应物，记一张表即可。
2. **错误处理**：两条路线分道扬镳——异常（Python/JS/Java）vs 值（Go/Rust）。这是五语言最大的思维差异。
3. **并发**：五门语言五个答案，没有哪家是「标准答案」，但有适合你先学的那家。

## 数据结构：两张表走天下

**有序列表**：

| 语言 | 写法 | 要点 |
|------|------|------|
| Python | `list = [1, 2, 3]` | 切片 `list[1:3]`、推导式 `[x*2 for x in list]` |
| JavaScript | `arr = [1, 2, 3]` | `map/filter/reduce` 链式处理 |
| Java | `List<Integer> list = new ArrayList<>()` | 原始类型要装箱，泛型只能用引用类型 |
| Go | `slice := []int{1, 2, 3}` | 切片是视图不是拷贝，`append` 可能换底层数组 |
| Rust | `let v = vec![1, 2, 3]` | 越界访问直接 panic，没有「undefined 元素」 |

**键值字典**：

| 语言 | 写法 | 要点 |
|------|------|------|
| Python | `d = {"a": 1}` | `d.get("x", 默认值)` 防 KeyError |
| JavaScript | 对象或 `Map` | 对象的键会被转成字符串，`Map` 才保留类型 |
| Java | `Map<String, Integer> m = new HashMap<>()` | `getOrDefault` / `computeIfAbsent` |
| Go | `m := map[string]int{}` | 读不存在的键返回零值；`v, ok := m[k]` 判断存在性 |
| Rust | `HashMap::new()` | `entry(k).or_insert(0)` 是计数/分组惯用法 |

前端的你重点补 Go 和 Rust 的习惯写法：「判断键是否存在再操作」这个 JS 里一行的事，Go 用 `v, ok := m[k]`，Rust 用 `entry` API。网站的「去重与分组统计」主题（`c13-common-logic.ts`）把这三种写法并排放在一起，值得照着敲一遍。

## 错误处理：一个思维分叉口

想象你写的 `fetch` 失败了。前端你的反应是 `try/catch`。但后端五门语言在这个问题上是两派：

**异常派**：Python (`try/except`)、JavaScript (`try/catch`)、Java (`try/catch/finally`)。错误沿着调用栈自动向上飞，你在任何一层接住都行。写起来爽，代价是「这个函数会抛什么异常」在类型签名上看不出来——Java 用 `throws` 声明受检异常算是折中，但社区对受检异常褒贬不一。

**值派**：Go 和 Rust 把错误当成普通返回值。

```go
// Go：错误是最后一个返回值，调用方必须处理
data, err := readFile("config.json")
if err != nil {
    return fmt.Errorf("read config: %w", err)
}
```

```rust
// Rust：Result<T, E> 类型，? 运算符向上传播
let data = std::fs::read_to_string("config.json")?;
```

两派没有绝对优劣，但**读代码的体验完全不同**。异常派代码的主路径干净，可异常可能从任何一行冒出来；值派每一行都在提醒你「这里会失败」，代价是代码里到处是 `if err != nil`。

初学者最常见的误解是认为 Rust 的 `?` 和异常等价。不等价——`?` 是显式的，函数签名 `Result<T, E>` 把「可能失败」写在了类型里，你不可能「忘记」一个函数会失败。这更接近前端从 `async/await` 配合 `Result` 风格封装（比如 neverthrow 这类库）的体验，只是 Rust 把它做进了语言。

**给前端读者的映射**：JS 的 `Promise` 链里 `.then().catch()` 其实已经在把错误往「值」的方向推了。Rust 的 `Result` + `?` 就是一个同步版的、编译器强制执行的 promise 链。

## 并发：五个答案，一个建议

| 语言 | 模型 | 一句话理解 |
|------|------|-----------|
| Python | `asyncio` / 多线程（GIL 限制） | 单线程事件循环像 JS 的 event loop，CPU 密集任务靠多进程 |
| JavaScript | 事件循环 + Worker | 你已经很熟了，Node 单线程 + 回调队列 |
| Java | 线程 + 线程池 / 虚拟线程 | 真正的操作系统线程，传统上最重但也最强 |
| Go | goroutine + channel | `go func()` 一开，轻量到能开百万个；「用通信共享内存」 |
| Rust | async/await + 所有权保护 | 语法像 JS，但编译器用所有权检查防止数据竞争 |

给转全栈者的建议是：**先学 Go 的心智模型，再用它理解其他家**。原因很实际——goroutine 是所有方案里心智负担最低的（`go doSomething()` 一个关键字），而 channel 的「生产者-消费者」直觉能迁移到后面学的一切：消息队列、Worker 模式（第 11 篇的 BFF + Worker 就是它的架构版）。

```go
// Go：并发抓取三个 URL，channel 收结果
urls := []string{"a", "b", "c"}
results := make(chan string, len(urls))
for _, u := range urls {
    go func(u string) {
        results <- fetch(u)
    }(u)
}
for range urls {
    fmt.Println(<-results)
}
```

同样的「并发抓取 + 限流 + 汇总」在网站里有完整的五语言对照（`c13-common-logic.ts` 的「并发抓取器」，以及 c8 进阶里的并发启动），JS 版你闭着眼都能写——`Promise.all` + p-limit 而已。对照读一遍，你会发现 Python `asyncio.gather`、Rust `join!` + `Semaphore`、Go channel 本质上在表达同一件事。

## 模块与包：五门语言的目录哲学

- **Python**：文件即模块，目录加 `__init__.py` 即包；`pip` + `requirements.txt`。
- **JavaScript**：ESM `import/export`；`npm` + `package.json`——你的主场。
- **Java**：包名对应目录层级（`com.example.todo`）；Maven 的 `pom.xml` 管依赖。
- **Go**：按仓库和目录组织，大写开头即导出（可见性写在命名里）；`go.mod`。
- **Rust**：`mod` 声明树 + `use` 路径；`Cargo.toml`。

Go 的「大写即公开」值得单独一提：别的语言靠 `public/private` 关键字或下划线约定，Go 直接把可见性编进标识符的大小写。这就是为什么 Go 标准库全是 `Println`、`Split` 这种大写开头。

## 练习

1. 网站上把「错误处理」「并发」两个分类用语言开关调成 Python vs Rust 对照读——异常派和值派同题对比，效果最好。
2. 跑通 Hello 实验室的预热：`curl http://localhost:8001/hello` 到 `8005`。还没跑过的先看第 04 篇的启动步骤。
3. 写一个「读文件并统计词频」的小程序，任选两门语言：一门异常派一门值派，体会错误路径占代码行数的比例差异。

## 下一步

基础语法和核心差异都在手上了。第 03 篇讲五门语言的进阶特性——泛型、空值安全、迭代器与链式处理，这些决定了你写的代码是「能跑」还是「好维护」。
