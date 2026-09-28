# 01 变量、控制流与函数：五语言第一课

> 对应网站页签：🎉 五语言语法 → 变量与类型 / 控制流 / 函数。数据源 `src/data/c1-basics.ts`、`c2-control-flow.ts`、`c3-functions.ts`。

## 先说结论

五门语言在基础语法层的差异，比大多数教程渲染得小得多。真正需要你记住的差异只有三个维度：

1. **类型何时确定**：Python/JS 运行时看值，Java/Go/Rust 编译时看声明。
2. **不可变是不是默认**：Rust 的 `let` 默认不可变，其他四门语言默认可变。
3. **错误怎么表达**：这留到第 02 篇讲，它是五语言真正的分水岭。

把这三个维度当坐标轴，后面所有语法细节都能自己推出来。这一篇带你把变量、控制流、函数三件事在五种语言里各走一遍，建立一个可迁移的心智模型。

## 变量声明：一个 `Alice` 五种说法

同一个「声明一个名字、一个年龄」的动作：

```python
# Python：动态类型，类型跟着值走
name = "Alice"
age = 30
# 可选的类型注解（3.5+），不影响运行，只给工具看
score: int = 100
```

```javascript
// JavaScript：let 可重新赋值，const 绑定不可变
let name = "Alice";
const age = 30;
```

```java
// Java：静态类型，必须先声明类型
String name = "Alice";
int age = 30;
// Java 10+ 局部变量可用 var 推断
var score = 100;
```

```go
// Go：:= 短声明 + 类型推断，函数外必须用 var
name := "Alice"
age := 30
```

```rust
// Rust：let 默认不可变，要改必须显式 mut
let name = "Alice";
let mut score = 100;
score += 10;
```

**初学者最容易混淆的一点**：`const` 在 JS 里只是「绑定不可变」，对象内容照样能改；而 Rust 的 `let`（不带 `mut`）是连内容都不能改。前者是门上的锁，后者是把门焊死了。从 JS 转 Rust 的人几乎都会在这里踩一次编译器报错——那是好事，编译器在替你省调试时间。

常量的差异也顺手记一下：Python 没有真常量（全大写只是约定，`typing.Final` 只是提示）；JS 的 `const` 保护绑定；Java 用 `static final`；Go 的 `const` 是编译期常量，还能配合 `iota` 做枚举；Rust 的 `const` 必须标注类型，另有 `static` 表示有固定地址的全局量。

## 基本类型：空值是理解五语言的钥匙

看一张对照表就够了：

| 概念 | Python | JavaScript | Java | Go | Rust |
|------|--------|-----------|------|-----|------|
| 整数 | `int`（任意精度） | `number`（不区分整数浮点） | `int` / `long` | `int` / `int64` | `i32` / `u64`（位宽必须明确） |
| 浮点 | `float` | `number` | `double` | `float64` | `f64` |
| 字符串 | `str`（不可变） | `string` | `String` | `string` | `String` / `&str` |
| 布尔 | `bool` | `boolean` | `boolean` | `bool` | `bool` |
| 空 | `None` | `null` / `undefined` | `null`（引用类型） | `nil`（指针） | **没有 null，用 `Option`** |

前四门语言都允许「这里可能没有值」用某种空表示，于是都背上同一个包袱：空指针/空引用错误，运行时才炸。Rust 把这个包袱在类型系统里解决了——「可能没有」必须写成 `Option<i32>`，编译器强迫你先处理 `None` 再用值。

前端的你可能用过 TypeScript 的 `strictNullChecks`。对，Rust 从语言第一天就是这个模式，而且没有「关掉」的选项。

## 控制流：写法趋同，两个细节值得注意

if/else、while、for 在五门语言里形态高度一致，直接看网站 `c2-control-flow.ts` 的对照即可。这里只讲两个容易出错的细节。

**细节一：Go 的 if 可以带初始化语句。**

```go
if err := doSomething(); err != nil {
    return err
}
// err 只在这个 if 作用域内存在
```

这个模式在 Go 代码里出现的频率极高，读 Go 不认识它等于读不懂 Go。它是 Go 错误处理惯用法的一半，第 02 篇会展开。

**细节二：多路分支的家族谱。**

JS/Java 用 `switch`（注意 JS 的 fall-through 要 `break`），Python 3.10+ 用 `match`，Go 的 `switch` 默认不穿透（没有 `break` 烦恼），Rust 的 `match` 是表达式且必须穷尽所有情况。「必须穷尽」意味着你加一个新枚举值时，编译器会把所有漏处理的 `match` 全部标红——这是把维护期的 bug 提前到编译期。

## 函数：签名即文档

```python
# Python：def + 类型注解（注解可选）
def add(a: int, b: int) -> int:
    return a + b
```

```javascript
// JS：箭头函数是主流写法
const add = (a, b) => a + b;
```

```java
// Java：方法必须属于类；真函数要靠接口 + Lambda
public static int add(int a, int b) { return a + b; }
// Lambda：Function<Integer, Integer> square = x -> x * x;
```

```go
// Go：func，多返回值是语言级特性
func add(a, b int) int { return a + b }
func div(a, b int) (int, error) { ... }
```

```rust
// Rust：fn，返回值类型用箭头，最后表达式可省 return
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

两个值得停一停的地方：

**Go 的多返回值**：`div(a, b int) (int, error)` 一次返回结果和错误，这是 Go 错误处理「if err != nil」 海洋的根源。Java 想表达同样的事得包一个对象或抛异常，JS 得靠解构约定。

**闭包五家都有，但捕获规则不同**：JS/Python 捕获变量引用，Go 闭包捕获的也是引用（经典的 for 循环变量陷阱，Go 1.22 起修复），Rust 闭包则按你使用方式决定是借用还是拿走所有权——这是第 03 篇的话题，现在只需要知道「Rust 闭包规则和别的语言不一样，遇到编译错误先想所有权」。

## 练习：把学习变成肌肉记忆

1. 打开网站 `npm run dev`，进 🎉 五语言语法页，把「变量与类型」「控制流」「函数」三个分类的对照代码读一遍。用顶部语言开关只留 Python + 一门你不熟的语言，强迫大脑做映射。
2. 写一个「FizzBuzz」五语言版本，不查资料写不出来就回去翻对照页——这个动作本身就是这个网站设计的用法：字典式查阅。
3. 手感不对的那门语言，去 `src/data/c1-basics.ts` 看源数据的注释，注释里通常标了版本和易错点。

## 下一步

变量会声明、函数会写了，接下来是这些值怎么组织（数据结构）、出错了怎么办（错误处理）、以及多件事怎么同时干（并发）——这三件事拉开了五门语言真正的差距，见第 02 篇。
