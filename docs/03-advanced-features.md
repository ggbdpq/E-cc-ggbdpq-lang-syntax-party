# 03 进阶特性：泛型、空值安全与迭代器

> 对应网站页签：🎉 五语言语法 → 进阶特性 / 语言内核。数据源 `src/data/c8-advanced.ts`、`c15-internals.ts`。

## 先说结论

入门篇解决「怎么写出来」，这一篇解决「怎么写得对、写得通用」。四个进阶概念，五门语言的实现程度差别很大，读完你会对「该在哪门语言里用什么招」有判断力：

| 概念 | Python | JavaScript | Java | Go | Rust |
|------|--------|-----------|------|----|------|
| 泛型 | 不需要（动态类型） | 不需要 | 成熟（类型擦除） | 1.18+ 起步 | 最强（编译期单态化） |
| 空值安全 | `Optional` 提示 | `?.` / `??` 语法糖 | `Optional<T>` 类库 | `nil` + 惯用法 | `Option<T>` 语言级 |
| 链式集合处理 | 推导式/生成器 | `map/filter/reduce` | Stream API | 手写循环 | 迭代器适配器 |
| 装饰器/AOP | `@decorator` 原生 | 高阶函数模拟 | 注解 + 反射 | 中间件模式 | 宏 |

## 泛型：为什么需要它

考虑一个「取数组第一项」的函数。没有泛型时你有两条烂路：为每个类型写一遍（Java 5 之前的日子），或者签名里用最宽的类型然后丢失类型信息（JS 天然如此，TS 用 `any` 也一样）。

```typescript
// TS 的泛型你大概率用过，这是理解其他语言的锚点
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

```java
// Java 泛型编译后擦除，运行时不知道 T 是什么
public static <T> T first(List<T> list) { return list.get(0); }
```

```go
// Go 1.18 才有泛型，风格克制，能用接口解决的官方不建议上泛型
func first[T any](xs []T) (T, bool) {
    if len(xs) == 0 {
        var zero T
        return zero, false
    }
    return xs[0], true
}
```

```rust
// Rust 泛型编译期为每个具体类型生成专用代码（单态化），零运行时开销
fn first<T>(xs: &[T]) -> Option<&T> {
    xs.first()
}
```

值得注意的差异：**Java 的泛型只存在于编译期**（类型擦除），你不能 `new T()`；**Go 社区对泛型态度保守**，标准库自己都很少用；**Rust 的泛型是零成本抽象**，编译后和你手写的具体类型代码完全一样。网站综合案例里的「泛型 LRU 缓存」（`c11-capstone-a.ts`）是泛型的实战样本——同一个 LRU，五语言对照实现，泛型在哪门语言里怎么写一目了然。

## 空值安全：从「忘了判空」到「编译器不让你不判」

前端视角最直观。JS 的 `?.` 和 `??` 是语法糖：错了照样错，只是写起来短。Rust 和 Java 的 `Optional` 是另一个物种——「可能没有值」被编码进类型系统。

```rust
// Option<T>：Some(值) 或 None，编译器强迫处理
let maybe: Option<i32> = users.iter().position(|u| u.id == id);
let idx = match maybe {
    Some(i) => i,
    None => return Err("user not found"),
};
// 或者用组合子一条链写完
let name = users.get(idx).map(|u| u.name.clone()).unwrap_or("anonymous".into());
```

```java
// Java Optional：返回 Optional 是方法签名的一部分
public Optional<User> findByName(String name) { ... }
// 调用方必须面对「可能没有」
User user = repo.findByName(name).orElseThrow(() -> new NotFoundException());
```

这是 API 设计层面的差异，不只是语法：**返回 `Option`/`Optional` 的函数在签名上就承诺了「我不保证有值」**。你在前端封装 axios 时给返回值套 `Result` 类型的做法，和这是同一个思想。

## 迭代器与链式处理：同一需求四种气质

需求：把用户列表里活跃用户的名字抽出来。四种气质：

```javascript
// JS：方法链，惰性无关，每步产生新数组
const names = users.filter(u => u.active).map(u => u.name);
```

```python
# Python：推导式最短；生成器 (x for x in ...) 惰性求值
names = [u["name"] for u in users if u["active"]]
```

```java
// Java Stream：声明式管道，终端操作才执行
List<String> names = users.stream()
    .filter(User::isActive)
    .map(User::getName)
    .collect(Collectors.toList());
```

```rust
// Rust 迭代器适配器：惰性 + 零分配（能直接消费不建中间集合）
let names: Vec<String> = users.iter()
    .filter(|u| u.active)
    .map(|u| u.name.clone())
    .collect();
```

Go 是例外——官方鼓励手写 for 循环，可读性优先。所以别在 Go 里找 `.map()`，写了反而会被 review 打回来。

**初学者误解纠正**：Stream 和迭代器不是「慢的 map/filter」。它们是惰性的，中间操作只是记录计划，直到终端操作（`collect`/`sum`/`for`）才执行；Rust 迭代器编译后通常比手写循环更快。网站「语言内核」章的「迭代器与生成器」主题（`c15-internals.ts`）对比了 Python 生成器和 JS generator，两者也是同一个惰性思想。

## 装饰器与中间件：AOP 的两种长相

Python 的 `@decorator` 是语言特性，JS 用高阶函数模拟，Java 走注解 + 反射（Spring 的 `@Transactional` 就是这个路线），Rust 用宏。**但后端世界里这个思想的巅峰形态是中间件**——你在 Express 里写了一辈子的 `app.use()`，Go 的 `gin.HandlerFunc` 链、Rust Axum 的 `middleware::from_fn`、Java 的拦截器/Filter，全是同一件事：把「日志、鉴权、限流」这类横切逻辑从业务函数里剥离出来，串成一条管道。

这个概念在后面的全栈篇里反复出现：第 05 篇的请求链路图、第 07 篇的鉴权中间件，都是它的展开。语法上记住一点即可：**五语言的中间件机制你是「会」的，因为 Express 中间件的心智模型可以直接平移**。

## 值与引用、深浅拷贝：内核章的地基

`c15-internals.ts` 里的「值与引用：深浅拷贝」是五语言共通的坑，前端背景的你其实懂一半：

- JS/Python：对象/字典是引用，赋值不拷贝，`JSON.parse(JSON.stringify(x))` 式深拷贝都有代价。
- Java：原始类型是值，对象是引用，`clone()` 是历史灾难区。
- Go：一切赋值都是拷贝，但 slice/map 内部是指针，表现像引用——这是 Go 面试高频题的根源。
- Rust：所有权系统下没有「悬空引用」问题，`clone()` 是显式的、昂贵的、写在你眼前的。

## 练习

1. 网站语言开到 Rust + JS 双栏，读「空值安全」和「链式集合处理」两个主题：把每个 Rust 片段在脑里翻译回 TS，翻译不动的地方就是你该补的概念。
2. 用你最熟的语言实现一个带泛型的 `memoize` 函数（网站「记忆化缓存」主题有五语言版本可对照），再换一门不熟的语言实现一遍。
3. `npm run dev` 打开「综合案例」分类，读「泛型 LRU 缓存」：理解为什么 LRU 是检验一门语言泛型 + 数据结构 + 错误处理三者综合能力的经典题。

## 下一步

语言层的东西到这就齐了。从下一篇开始切换赛道：把你已经会的前端动作（fetch、跨域报错、Authorization 头）逐一映射到服务端——第一站是亲手把五个 HTTP 服务跑起来。
