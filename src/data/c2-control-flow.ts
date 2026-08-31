import type { Category } from './types';

export const controlFlow: Category = {
  id: 'control-flow',
  title: { zh: '控制流', en: 'Control Flow' },
  topics: [
    {
      id: 'if-else',
      title: { zh: '条件分支 if/else', en: 'If / Else' },
      description: {
        zh: '条件判断的写法差异：括号要求、缩进语法、以及"表达式还是语句"。',
        en: 'Conditional syntax differences: parentheses, indentation, expression vs statement.',
      },
      snippets: {
        python: `# 缩进即语法，无括号无花括号
score = 85

if score >= 90:
    grade = "A"
elif score >= 60:
    grade = "B"
else:
    grade = "C"

# 三元表达式
label = "及格" if score >= 60 else "不及格"`,
        javascript: `const score = 85;

if (score >= 90) {
  grade = "A";
} else if (score >= 60) {
  grade = "B";
} else {
  grade = "C";
}

// 三元运算符
const label = score >= 60 ? "及格" : "不及格";`,
        java: `int score = 85;
String grade;

if (score >= 90) {
    grade = "A";
} else if (score >= 60) {
    grade = "B";
} else {
    grade = "C";
}

// 三元运算符
String label = score >= 60 ? "及格" : "不及格";`,
        go: `score := 85

// 条件不需要括号，花括号必须有
if score >= 90 {
    grade = "A"
} else if score >= 60 {
    grade = "B"
} else {
    grade = "C"
}

// 无三元运算符！只能写完整 if
// if 可带初始化语句：
if n := len(name); n > 10 {
    fmt.Println("太长了", n)
}`,
        rust: `let score = 85;

// 条件不需要括号
let grade = if score >= 90 {
    "A"
} else if score >= 60 {
    "B"
} else {
    "C"
};
// if 是表达式，可以直接赋值！`,
      },
    },
    {
      id: 'for-loop',
      title: { zh: 'for 循环', en: 'For Loops' },
      description: {
        zh: '遍历与计数循环：Go 只有 for，Python 只有遍历式 for。',
        en: 'Iteration and counting loops: Go has only "for", Python only for-each style.',
      },
      snippets: {
        python: `# 遍历式 for（无 C 风格计数循环）
for i in range(5):        # 0..4
    print(i)

for ch in "hello":        # 遍历字符串
    print(ch)

for idx, val in enumerate(["a", "b"]):
    print(idx, val)`,
        javascript: `// 经典三段式
for (let i = 0; i < 5; i++) {
  console.log(i);
}

// for...of 遍历值
for (const ch of "hello") {
  console.log(ch);
}

// forEach + 索引
["a", "b"].forEach((val, idx) => console.log(idx, val));`,
        java: `// 经典三段式
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// 增强 for（for-each）
String[] arr = {"a", "b"};
for (String val : arr) {
    System.out.println(val);
}

// Java 8 Stream 风格
// IntStream.range(0, 5).forEach(System.out::println);`,
        go: `// 只有 for 一个关键字
for i := 0; i < 5; i++ {   // 三段式
    fmt.Println(i)
}

for i, ch := range "hello" { // range 遍历（索引+值）
    fmt.Println(i, string(ch))
}

for _, val := range []string{"a", "b"} {
    fmt.Println(val)
}`,
        rust: `// for-in 遍历迭代器
for i in 0..5 {            // 区间 0..4
    println!("{}", i);
}

for ch in "hello".chars() {
    println!("{}", ch);
}

// 带索引: enumerate
for (idx, val) in ["a", "b"].iter().enumerate() {
    println!("{} {}", idx, val);
}`,
      },
    },
    {
      id: 'while-loop',
      title: { zh: 'while 循环', en: 'While Loops' },
      snippets: {
        python: `n = 0
while n < 5:
    print(n)
    n += 1

# while...else：未被 break 打断时执行
while n < 10:
    n += 1
else:
    print("正常结束")`,
        javascript: `let n = 0;
while (n < 5) {
  console.log(n);
  n++;
}

// do...while 至少执行一次
do {
  n--;
} while (n > 0);`,
        java: `int n = 0;
while (n < 5) {
    System.out.println(n);
    n++;
}

// do...while 至少执行一次
do {
    n--;
} while (n > 0);`,
        go: `n := 0
for n < 5 {        // while 用 for 写
    fmt.Println(n)
    n++
}

for {              // 无限循环
    n++
    if n >= 10 {
        break
    }
}`,
        rust: `let mut n = 0;
while n < 5 {
    println!("{}", n);
    n += 1;
}

loop {             // 无限循环，可带返回值
    n += 1;
    if n >= 10 {
        break;
    }
}`,
      },
    },
    {
      id: 'switch-match',
      title: { zh: '多路分支 switch / match', en: 'Switch / Match' },
      description: {
        zh: 'Rust 的 match 是表达式且必须穷尽所有可能；Java 8 的 switch 只能用于有限类型。',
        en: "Rust's match is an exhaustive expression; Java 8's switch works on limited types.",
      },
      snippets: {
        python: `# 3.10+ 的 match 结构模式匹配
def handle(code):
    match code:
        case 200:
            return "成功"
        case 404:
            return "未找到"
        case _ if code >= 500:  # 守卫条件
            return "服务器错误"
        case _:                 # 默认分支
            return "未知"`,
        javascript: `function handle(code) {
  switch (code) {
    case 200:
      return "成功";
    case 404:
      return "未找到";
    default:           // 别忘了 break 或 return
      return code >= 500 ? "服务器错误" : "未知";
  }
}`,
        java: `String handle(int code) {
    switch (code) {
        case 200:
            return "成功";
        case 404:
            return "未找到";
        default:
            return code >= 500 ? "服务器错误" : "未知";
    }
}
// Java 8: switch 仅支持 int/枚举/String 等`,
        go: `func handle(code int) string {
    switch {
    case code == 200:
        return "成功"
    case code == 404:
        return "未找到"
    case code >= 500:
        return "服务器错误"
    default:
        return "未知"
    }
}
// 无需 break，默认不贯穿；fallthrough 可强制贯穿`,
        rust: `fn handle(code: u16) -> &'static str {
    match code {
        200 => "成功",
        404 => "未找到",
        c if c >= 500 => "服务器错误", // 守卫
        _ => "未知",                   // 必须穷尽！
    }
}
// match 是表达式，编译器检查穷尽性`,
      },
    },
  ],
};
