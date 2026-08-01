import type { Category } from './types';

export const functions: Category = {
  id: 'functions',
  title: { zh: '函数', en: 'Functions' },
  topics: [
    {
      id: 'define-function',
      title: { zh: '定义与调用', en: 'Define & Call' },
      snippets: {
        python: `def greet(name):
    """函数文档字符串"""
    return f"你好, {name}!"

msg = greet("小明")
print(msg)  # 你好, 小明!`,
        javascript: `function greet(name) {
  return \`你好, \${name}!\`;
}

// 箭头函数（更简洁）
const greet2 = (name) => \`你好, \${name}!\`;

console.log(greet("小明"));`,
        java: `public class Main {
    // static 方法：类级别，可直接调用
    static String greet(String name) {
        return "你好, " + name + "!";
    }

    public static void main(String[] args) {
        System.out.println(greet("小明"));
    }
}`,
        go: `package main

import "fmt"

// func 关键字，类型写在参数名后面
func greet(name string) string {
    return "你好, " + name + "!"
}

func main() {
    fmt.Println(greet("小明"))
}`,
        rust: `// fn 关键字，必须标注参数和返回类型
fn greet(name: &str) -> String {
    format!("你好, {}!", name)  // 尾表达式即返回值
}

fn main() {
    println!("{}", greet("小明"));
}`,
      },
    },
    {
      id: 'function-args',
      title: { zh: '参数与返回值', en: 'Args & Return Values' },
      description: {
        zh: '默认参数、关键字参数、多返回值、可变参数——各语言特色功能大不同。',
        en: 'Default args, keyword args, multiple return values, variadics — very different features.',
      },
      snippets: {
        python: `# 默认参数 + 关键字参数 + 可变参数
def connect(host, port=8080, *args, timeout=30, **kwargs):
    return f"{host}:{port} timeout={timeout}"

connect("localhost")                # 用默认端口
connect("localhost", port=9090)     # 关键字传参
connect("a.com", 80, "extra", retry=3)

# 多返回值（实际是元组解包）
def divmod_(a, b):
    return a // b, a % b
q, r = divmod_(7, 2)`,
        javascript: `// 默认参数 + 剩余参数
function connect(host, port = 8080, ...rest) {
  return \`\${host}:\${port} (\${rest.length} extra)\`;
}

connect("localhost");
connect("a.com", 80, "x", "y");

// 解构实现"关键字参数"效果
function serve({ host = "0.0.0.0", port = 8080 } = {}) {
  return \`\${host}:\${port}\`;
}
serve({ port: 3000 });`,
        java: `// 无默认参数！用方法重载模拟
static String connect(String host) {
    return connect(host, 8080);
}
static String connect(String host, int port) {
    return host + ":" + port;
}

// 可变参数 varargs
static int sum(int... nums) {
    int total = 0;
    for (int n : nums) total += n;
    return total;
}
// sum(1, 2, 3) == 6；无多返回值，需封装对象`,
        go: `// 多返回值是原生特性！
func divmod(a, b int) (int, int) {
    return a / b, a % b
}
q, r := divmod(7, 2)

// 命名返回值 + 可变参数
func sum(nums ...int) (total int) {
    for _, n := range nums {
        total += n
    }
    return  // 裸返回
}
// sum(1, 2, 3) == 6；无默认参数、无重载`,
        rust: `// 无默认参数、无重载（用 Option 或建造者模式）
fn connect(host: &str, port: u16) -> String {
    format!("{}:{}", host, port)
}

// 返回元组实现多返回值
fn divmod(a: i32, b: i32) -> (i32, i32) {
    (a / b, a % b)
}

fn main() {
    let (q, r) = divmod(7, 2);  // 解构
    println!("{} {}", connect("localhost", 8080));
}`,
      },
    },
    {
      id: 'lambda',
      title: { zh: '匿名函数与闭包', en: 'Lambdas & Closures' },
      snippets: {
        python: `# lambda 只能写单个表达式
square = lambda x: x ** 2
print(square(5))  # 25

# 闭包：捕获外部变量
def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = make_counter()
print(c(), c())  # 1 2`,
        javascript: `// 箭头函数天然是一等公民
const square = (x) => x ** 2;

// 闭包：捕获外部变量
function makeCounter() {
  let count = 0;
  return () => ++count;
}

const c = makeCounter();
console.log(c(), c()); // 1 2`,
        java: `// Lambda（Java 8+）：函数式接口的实例
Function<Integer, Integer> square = x -> x * x;
System.out.println(square.apply(5)); // 25

// 闭包捕获的变量必须是 final 或"事实 final"
int base = 10;
IntSupplier addBase = () -> base + 1;
// base++; // 编译错误！捕获后不能改`,
        go: `// 匿名函数是一等公民
square := func(x int) int {
    return x * x
}
fmt.Println(square(5)) // 25

// 闭包：捕获的外部变量可变
makeCounter := func() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}
c := makeCounter()
fmt.Println(c(), c()) // 1 2`,
        rust: `// 闭包用 |参数| 语法
let square = |x: i32| x * x;
println!("{}", square(5)); // 25

// 闭包捕获受所有权规则约束
let mut count = 0;
let mut inc = || {
    count += 1;   // 可变捕获
    count
};
println!("{} {}", inc(), inc()); // 1 2`,
      },
    },
  ],
};
