import type { Category } from './types';

export const basics: Category = {
  id: 'basics',
  title: { zh: '变量与类型', en: 'Variables & Types' },
  topics: [
    {
      id: 'declare-variable',
      title: { zh: '声明变量', en: 'Declare Variables' },
      description: {
        zh: '五种语言的变量声明风格：动态类型 vs 静态类型，类型推断各有不同。',
        en: 'How each language declares variables: dynamic vs static typing, and type inference.',
      },
      snippets: {
        python: `# 动态类型，无需关键字
name = "Alice"   # str
age = 30         # int
price = 9.99     # float
is_admin = True  # bool

# 类型注解（可选，3.5+）
score: int = 100`,
        javascript: `// let 可重新赋值，const 不可变
let name = "Alice";
const age = 30;
let price = 9.99;
let isAdmin = true;

// 类型由值决定（动态类型）
console.log(typeof age); // "number"`,
        java: `// 静态类型，必须声明类型
String name = "Alice";
int age = 30;
double price = 9.99;
boolean isAdmin = true;

// Java 10+ 可用 var 局部类型推断
// var score = 100;`,
        go: `// := 短变量声明（类型推断）
name := "Alice"   // string
age := 30         // int
price := 9.99     // float64
isAdmin := true   // bool

// 等价于: var name string = "Alice"`,
        rust: `// let 默认不可变，mut 才可变
let name = "Alice";   // &str
let age = 30;         // i32
let price = 9.99;     // f64
let mut score = 100;  // 可变变量
score += 10;`,
      },
    },
    {
      id: 'constants',
      title: { zh: '常量', en: 'Constants' },
      description: {
        zh: '真正的编译期常量：Python 靠约定，其余语言有专门关键字。',
        en: 'Compile-time constants: Python uses naming convention, others have keywords.',
      },
      snippets: {
        python: `# 没有真正的常量，全大写只是约定
MAX_RETRY = 3
PI = 3.14159

# typing.Final 可提示不可变（3.8+）
from typing import Final
PORT: Final = 8080`,
        javascript: `// const 声明常量（绑定不可变）
const MAX_RETRY = 3;
const PI = 3.14159;

// 注意：对象/数组内容仍可改
const config = { port: 8080 };
config.port = 9090; // 允许！`,
        java: `// static final 声明常量
public static final int MAX_RETRY = 3;
public static final double PI = 3.14159;

// 局部常量用 final
final int port = 8080;`,
        go: `// const 编译期常量
const MaxRetry = 3
const Pi = 3.14159

// 常量组 + iota 枚举
const (
    StatusOK = iota // 0
    StatusErr       // 1
)`,
        rust: `// const 编译期常量，必须标注类型
const MAX_RETRY: u32 = 3;
const PI: f64 = 3.14159;

// static 表示全局单例（有固定地址）
static APP_NAME: &str = "syntax-party";`,
      },
    },
    {
      id: 'basic-types',
      title: { zh: '基本数据类型', en: 'Basic Types' },
      description: {
        zh: '各语言的类型系统一瞥：值类型、引用类型与空值的表示。',
        en: 'A glance at type systems: value types, reference types, and null representation.',
      },
      snippets: {
        python: `# 一切皆对象，常用内置类型
i: int = 42           # 任意精度整数
f: float = 3.14       # 双精度浮点
s: str = "hello"      # 不可变字符串
b: bool = True        # True / False
n = None              # 空值（NoneType）`,
        javascript: `// 7 种原始类型 + object
let i = 42;            // number（无整数/浮点之分）
let big = 9007199254740993n; // bigint
let s = "hello";       // string
let b = true;          // boolean
let u = undefined;     // 未定义
let n = null;          // 空值
let sym = Symbol("id"); // symbol`,
        java: `// 8 种原始类型（值类型）
byte b = 1; short s = 2;
int i = 42; long l = 100L;
float f = 3.14f; double d = 3.14;
char c = 'A'; boolean ok = true;

// 引用类型: String、数组、对象
// 装箱类型: Integer、Double... 可为 null`,
        go: `// 值类型为主，零值初始化
var i int = 42        // int8/16/32/64 可选
var f float64 = 3.14  // float32/64
var s string = "hello"
var b bool = true

var p *int = nil      // 指针，nil 为空值
fmt.Println(i, f, s, b)`,
        rust: `// 静态强类型，精确控制位宽
let i: i32 = 42;       // i8~i128, u8~u128, isize/usize
let f: f64 = 3.14;     // f32 / f64
let c: char = '中';    // 4 字节 Unicode 标量
let b: bool = true;

// 无 null！用 Option 表示"可能没有"
let maybe: Option<i32> = None;`,
      },
    },
  ],
};
