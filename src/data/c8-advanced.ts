import type { Category } from './types';

export const advanced: Category = {
  id: 'advanced',
  title: { zh: '进阶特性', en: 'Advanced Features' },
  topics: [
    {
      id: 'stream-api',
      title: { zh: '链式集合处理', en: 'Fluent Collection Processing' },
      description: {
        zh: '真实代码里最高频的操作：筛选 → 变换 → 聚合。Go 刻意不提供，用循环表达。',
        en: 'The most frequent real-world operation: filter → map → reduce. Go deliberately uses plain loops.',
      },
      snippets: {
        python: `nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 推导式是 Python 的"链式"风格
result = [x * x for x in nums if x % 2 == 0]
print(result)  # [4, 16, 36, 64, 100]

# map/filter + sum 聚合
total = sum(map(lambda x: x * x, filter(lambda x: x % 2 == 0, nums)))
print(total)  # 220`,
        javascript: `const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 链式调用是 JS 数组的招牌
const result = nums
  .filter(x => x % 2 === 0)
  .map(x => x * x);
console.log(result); // [4, 16, 36, 64, 100]

const total = nums
  .filter(x => x % 2 === 0)
  .reduce((acc, x) => acc + x * x, 0);
console.log(total); // 220`,
        java: `List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

// Stream API（Java 8 核心武器）
List<Integer> result = nums.stream()
    .filter(x -> x % 2 == 0)
    .map(x -> x * x)
    .collect(Collectors.toList());
System.out.println(result); // [4, 16, 36, 64, 100]

int total = nums.stream()
    .filter(x -> x % 2 == 0)
    .mapToInt(x -> x * x)
    .sum();
System.out.println(total); // 220`,
        go: `nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 10}

// 无链式 API，显式循环（意图清晰）
result := make([]int, 0)
total := 0
for _, x := range nums {
    if x%2 != 0 {
        continue
    }
    result = append(result, x*x)
    total += x * x
}
fmt.Println(result, total) // [4 16 36 64 100] 220

// 也可用第三方库: github.com/samber/lo`,
        rust: `let nums = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// 迭代器链是 Rust 的惯用风格（零成本抽象）
let result: Vec<i32> = nums.iter()
    .filter(|x| *x % 2 == 0)
    .map(|x| x * x)
    .collect();
println!("{:?}", result); // [4, 16, 36, 64, 100]

let total: i32 = nums.iter()
    .filter(|x| *x % 2 == 0)
    .map(|x| x * x)
    .sum();
println!("{}", total); // 220`,
      },
    },
    {
      id: 'generics',
      title: { zh: '泛型', en: 'Generics' },
      description: {
        zh: '写一次、适配多种类型。Go 直到 1.18 才加入；JS 本身没有（TypeScript 才有）。',
        en: 'Write once, work for many types. Go added them in 1.18; plain JS has none (TypeScript does).',
      },
      snippets: {
        python: `# 动态类型天然"泛型"，类型注解可表达泛型
from typing import TypeVar, List

T = TypeVar('T')

def first(items: List[T]) -> T:
    return items[0]

first([1, 2, 3])      # 推断 T = int
first(["a", "b"])     # 推断 T = str`,
        javascript: `// JS 无泛型（动态类型不需要）
function first(items) {
  return items[0];
}

// TypeScript 中的泛型长这样：
// function first<T>(items: T[]): T {
//   return items[0];
// }
// const n = first<number>([1, 2, 3]);`,
        java: `// 泛型类 + 泛型方法（编译期擦除）
public class Box<T> {
    private final T value;
    public Box(T value) { this.value = value; }
    public T get() { return value; }
}

// 泛型方法
static <T> T first(List<T> items) {
    return items.get(0);
}

Box<String> box = new Box<>("hello");
// 通配符: List<? extends Number>`,
        go: `// Go 1.18+ 泛型（类型参数）
func First[T any](items []T) T {
    return items[0]
}

// 类型约束
func Sum[T int | float64](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

fmt.Println(First([]string{"a", "b"}))  // "a"
fmt.Println(Sum([]int{1, 2, 3}))        // 6`,
        rust: `// 泛型 + trait 约束（单态化，零运行时开销）
fn first<T>(items: &[T]) -> &T {
    &items[0]
}

// trait bound 约束能力
use std::fmt::Display;
fn print_it<T: Display>(value: T) {
    println!("{}", value);
}

// 泛型结构体
struct Pair<T> {
    first: T,
    second: T,
}`,
      },
    },
    {
      id: 'null-safety',
      title: { zh: '空值安全', en: 'Null Safety' },
      description: {
        zh: '"十亿美元错误"的五种解法。Rust 在类型层面消灭了 null。',
        en: 'Five answers to the "billion-dollar mistake". Rust eliminates null at the type level.',
      },
      snippets: {
        python: `user = None

# 防御式判断
if user is not None:
    print(user.name)

# get 默认值（字典场景）
name = (user or {}).get("name", "匿名")

# 3.8+ 海象运算符简化
if (n := len("hello")) > 3:
    print(n)`,
        javascript: `const user = null;

// 可选链 ?. —— 中途为 null 不再炸
console.log(user?.profile?.name); // undefined

// 空值合并 ?? —— 只对 null/undefined 生效
const name = user?.name ?? "匿名";

// 对比: || 会把 0、"" 也当假值
const port = 0 || 8080;    // 8080（坑！）
const port2 = 0 ?? 8080;   // 0（正确）`,
        java: `String name = null;

// 传统防御
if (name != null) {
    System.out.println(name.length());
}

// Optional（Java 8）显式表达"可能没有"
Optional<String> opt = Optional.ofNullable(name);
String result = opt
    .map(String::toUpperCase)
    .orElse("匿名");
System.out.println(result); // 匿名`,
        go: `var name *string = nil

// 指针判空
if name != nil {
    fmt.Println(len(*name))
}

// 逗号 ok 惯用法（map/断言/channel）
m := map[string]int{}
if v, ok := m["key"]; ok {
    fmt.Println(v)
} else {
    fmt.Println("默认值")
}`,
        rust: `// 没有 null！Option<T> 编译器强制处理
let name: Option<String> = None;

// map / unwrap_or 链式处理
let result = name
    .map(|n| n.to_uppercase())
    .unwrap_or("匿名".to_string());
println!("{}", result); // 匿名

// ? 运算符向上传播 None
fn len_of(s: Option<&str>) -> Option<usize> {
    Some(s?.len())
}`,
      },
    },
    {
      id: 'decorators-annotations',
      title: { zh: '装饰器与注解', en: 'Decorators & Annotations' },
      description: {
        zh: '元编程的入口：Python 装饰器最灵活，Java 注解驱动整个 Spring 生态，Go 用结构体标签。',
        en: 'Metaprogramming entry points: Python decorators, Java annotations (the Spring engine), Go struct tags.',
      },
      snippets: {
        python: `import functools, time

# 手写装饰器：给函数加"计时"能力
def timer(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.time()-start:.3f}s")
        return result
    return wrapper

@timer
def slow_task():
    time.sleep(0.1)

slow_task()  # slow_task 耗时 0.100s`,
        javascript: `// JS 的装饰器仍是提案阶段，日常用高阶函数
function timer(func) {
  return function (...args) {
    const start = Date.now();
    const result = func.apply(this, args);
    console.log(\`耗时 \${Date.now() - start}ms\`);
    return result;
  };
}

const slowTask = timer(() => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
});
slowTask();

// TS/NestJS 中装饰器是主力: @Get() @Injectable()`,
        java: `// 注解是 Java 元编程的核心（Spring 的引擎）
@Override                      // 编译期检查
@Deprecated                    // 标记废弃
@SuppressWarnings("unchecked") // 抑制警告

// 自定义注解
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Timed { }

// 配合 AOP 实现 @Timed 计时切面
// Spring 中的一切都是注解: @Service @Transactional...`,
        go: `// 无注解/装饰器，用"结构体标签"做元数据
type User struct {
    ID    int    \`json:"id" db:"user_id"\`
    Name  string \`json:"name" binding:"required"\`
    Email string \`json:"email" validate:"email"\`
}
// 标签驱动 JSON 序列化、ORM 映射、参数校验

// 功能扩展靠组合 + 高阶函数
func Timer(f func()) func() {
    return func() {
        start := time.Now()
        f()
        fmt.Println("耗时", time.Since(start))
    }
}`,
        rust: `// 属性（attribute）驱动编译期代码生成
#[derive(Debug, Clone, Serialize)]  // 自动实现 trait
struct User {
    id: u64,
    #[serde(rename = "user_name")]  // 字段级配置
    name: String,
}

#[tokio::main]      // 宏生成异步运行时入口
async fn main() {
    println!("{:?}", User { id: 1, name: "小明".into() });
}

// 过程宏 = 编译期代码生成，是框架的魔法来源`,
      },
    },
  ],
};
