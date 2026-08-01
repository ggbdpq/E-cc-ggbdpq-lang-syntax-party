import type { Category } from './types';

export const strings: Category = {
  id: 'strings',
  title: { zh: '字符串', en: 'Strings' },
  topics: [
    {
      id: 'interpolation',
      title: { zh: '字符串插值', en: 'String Interpolation' },
      snippets: {
        python: `name = "小明"
age = 25

# f-string（3.6+，推荐）
print(f"{name} 今年 {age} 岁")
print(f"明年 {age + 1} 岁")       # 可写表达式

# format 方法
print("{} 今年 {} 岁".format(name, age))`,
        javascript: `const name = "小明";
const age = 25;

// 模板字符串（反引号）
console.log(\`\${name} 今年 \${age} 岁\`);
console.log(\`明年 \${age + 1} 岁\`);  // 可写表达式

// 字符串拼接
console.log(name + " 今年 " + age + " 岁");`,
        java: `String name = "小明";
int age = 25;

// String.format（Java 8 无插值语法）
System.out.println(String.format("%s 今年 %d 岁", name, age));

// 字符串拼接（编译器优化为 StringBuilder）
System.out.println(name + " 今年 " + age + " 岁");`,
        go: `name := "小明"
age := 25

// fmt.Sprintf 格式化（无插值语法）
fmt.Printf("%s 今年 %d 岁\\n", name, age)
msg := fmt.Sprintf("明年 %d 岁", age+1)

// 字符串拼接
fmt.Println(name + " 今年 " + strconv.Itoa(age) + " 岁")`,
        rust: `let name = "小明";
let age = 25;

// format! 宏支持内联插值（1.58+）
println!("{name} 今年 {age} 岁");
println!("明年 {} 岁", age + 1);

let msg = format!("{name} 今年 {age} 岁");`,
      },
    },
    {
      id: 'string-ops',
      title: { zh: '常用字符串操作', en: 'Common String Ops' },
      snippets: {
        python: `s = " Hello, World "

s.strip()           # 去首尾空白
s.upper()           # 转大写
"World" in s        # True  包含判断
s.split(",")        # [' Hello', ' World ']
"-".join(["a", "b"]) # 'a-b'
s.replace("World", "Python")
s.startswith(" He") # True
s[7:12]             # 切片 'World'`,
        javascript: `const s = " Hello, World ";

s.trim();                  // 去首尾空白
s.toUpperCase();           // 转大写
s.includes("World");       // true
s.split(",");              // [' Hello', ' World ']
["a", "b"].join("-");      // 'a-b'
s.replace("World", "JS");
s.startsWith(" He");       // true
s.slice(7, 12);            // 'World'`,
        java: `String s = " Hello, World ";

s.trim();                  // 去首尾空白
s.toUpperCase();           // 转大写
s.contains("World");       // true
s.split(",");              // String[]
String.join("-", "a", "b"); // "a-b"
s.replace("World", "Java");
s.startsWith(" He");       // true
s.substring(7, 12);        // "World"`,
        go: `import "strings"

s := " Hello, World "

strings.TrimSpace(s)          // 去首尾空白
strings.ToUpper(s)            // 转大写
strings.Contains(s, "World")  // true
strings.Split(s, ",")         // []string
strings.Join([]string{"a","b"}, "-")
strings.ReplaceAll(s, "World", "Go")
strings.HasPrefix(s, " He")   // true
s[7:12]                       // "World"（按字节切！）`,
        rust: `let s = " Hello, World ";

s.trim();                     // 去首尾空白
s.to_uppercase();             // 转大写
s.contains("World");          // true
s.split(',').collect::<Vec<_>>();
vec!["a", "b"].join("-");     // "a-b"
s.replace("World", "Rust");
s.starts_with(" He");         // true
&s[7..12];                    // "World"（按字节切！）`,
      },
    },
  ],
};

export const errorHandling: Category = {
  id: 'error-handling',
  title: { zh: '错误处理', en: 'Error Handling' },
  topics: [
    {
      id: 'exceptions',
      title: { zh: '异常与错误', en: 'Exceptions & Errors' },
      description: {
        zh: '两种哲学：异常机制（try/catch）vs 错误即值（Go/Rust）。这是五语言最大的设计分歧。',
        en: 'Two philosophies: exceptions (try/catch) vs errors-as-values (Go/Rust). The biggest design split.',
      },
      snippets: {
        python: `def parse_age(text):
    try:
        return int(text)
    except ValueError as e:
        print(f"解析失败: {e}")
        return None
    finally:
        pass  # 无论成败都执行

# 抛出自定义异常
if age < 0:
    raise ValueError("年龄不能为负")`,
        javascript: `function parseAge(text) {
  try {
    const n = parseInt(text, 10);
    if (isNaN(n)) throw new Error("不是数字");
    return n;
  } catch (e) {
    console.error("解析失败:", e.message);
    return null;
  } finally {
    // 无论成败都执行
  }
}`,
        java: `static Integer parseAge(String text) {
    try {
        return Integer.parseInt(text);
    } catch (NumberFormatException e) {
        System.err.println("解析失败: " + e.getMessage());
        return null;
    } finally {
        // 无论成败都执行
    }
}
// throw new IllegalArgumentException("年龄不能为负");
// Java 区分 checked / unchecked 异常`,
        go: `// 错误是普通的值，通过返回值传递
import ("errors"; "strconv")

func parseAge(text string) (int, error) {
    if text == "" {
        return 0, errors.New("输入为空")
    }
    return strconv.Atoi(text)
}

age, err := parseAge("25")
if err != nil {          // 显式检查，无法忽视
    log.Fatal(err)
}
fmt.Println(age)`,
        rust: `// Result<T, E> 类型强制处理错误
fn parse_age(text: &str) -> Result<i32, String> {
    text.parse::<i32>()
        .map_err(|_| "不是数字".to_string())
}

match parse_age("25") {
    Ok(age) => println!("{}", age),
    Err(e) => eprintln!("失败: {}", e),
}

// ? 运算符：出错则提前返回
fn read_age() -> Result<i32, String> {
    let age = parse_age("25")?;
    Ok(age)
}`,
      },
    },
  ],
};
