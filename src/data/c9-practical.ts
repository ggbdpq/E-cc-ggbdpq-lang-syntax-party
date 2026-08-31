import type { Category } from './types';

export const practical: Category = {
  id: 'practical',
  title: { zh: '实战必备', en: 'Practical Essentials' },
  topics: [
    {
      id: 'json',
      title: { zh: 'JSON 序列化', en: 'JSON Serialization' },
      description: {
        zh: 'API 开发的日常：对象 ↔ JSON 双向转换。',
        en: 'Daily API work: objects ↔ JSON in both directions.',
      },
      snippets: {
        python: `import json

user = {"name": "小明", "age": 25, "tags": ["后端", "AI"]}

# 对象 → JSON 字符串
text = json.dumps(user, ensure_ascii=False, indent=2)

# JSON 字符串 → 对象
data = json.loads(text)
print(data["name"])  # 小明

# dataclass 需配合 asdict 或 pydantic
from dataclasses import asdict
# json.dumps(asdict(user_obj))`,
        javascript: `const user = { name: "小明", age: 25, tags: ["后端", "AI"] };

// 对象 → JSON
const text = JSON.stringify(user, null, 2);

// JSON → 对象
const data = JSON.parse(text);
console.log(data.name); // 小明

// class 实例默认只序列化自有可枚举属性
// 可用 toJSON() 自定义输出`,
        java: `// Jackson（Spring 默认集成）
ObjectMapper mapper = new ObjectMapper();

User user = new User("小明", 25);

// 对象 → JSON
String text = mapper.writeValueAsString(user);

// JSON → 对象
User data = mapper.readValue(text, User.class);

// 常用注解定制
// @JsonProperty("user_name")
// @JsonIgnore  // 忽略敏感字段如密码`,
        go: `import "encoding/json"

type User struct {
    Name string \`json:"name"\`
    Age  int    \`json:"age"\`
    // Password string \`json:"-"\`  // 忽略字段
}

user := User{Name: "小明", Age: 25}

// 对象 → JSON
bytes, _ := json.Marshal(user)

// JSON → 对象
var data User
json.Unmarshal(bytes, &data)
fmt.Println(data.Name) // 小明`,
        rust: `// serde 生态是事实标准
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct User {
    name: String,
    age: u8,
    // #[serde(skip)]  // 忽略字段
}

let user = User { name: "小明".into(), age: 25 };

// 对象 → JSON
let text = serde_json::to_string_pretty(&user).unwrap();

// JSON → 对象
let data: User = serde_json::from_str(&text).unwrap();
println!("{:?}", data);`,
      },
    },
    {
      id: 'file-io',
      title: { zh: '文件读写', en: 'File I/O' },
      snippets: {
        python: `from pathlib import Path

# 现代写法：pathlib
path = Path("notes.txt")

# 读写一步到位
path.write_text("第一行\\n第二行", encoding="utf-8")
content = path.read_text(encoding="utf-8")

# 大文件逐行读（with 自动关闭）
with open("big.log", encoding="utf-8") as f:
    for line in f:
        print(line.strip())`,
        javascript: `const fs = require("fs");
const fsPromises = require("fs/promises");

// 同步（简单脚本）
fs.writeFileSync("notes.txt", "第一行\\n第二行");
const content = fs.readFileSync("notes.txt", "utf-8");

// 异步（服务端正确姿势）
await fsPromises.writeFile("notes.txt", "内容");
const data = await fsPromises.readFile("notes.txt", "utf-8");

// 大文件用流: fs.createReadStream("big.log")`,
        java: `// NIO.2（Java 7+，别再用 FileReader）
Path path = Paths.get("notes.txt");

// 读写一步到位
Files.write(path, "第一行\\n第二行".getBytes(StandardCharsets.UTF_8));
String content = new String(Files.readAllBytes(path), StandardCharsets.UTF_8);

// 逐行读取
List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);

// 大文件流式
try (Stream<String> stream = Files.lines(path)) {
    stream.forEach(System.out::println);
}`,
        go: `import ("os"; "bufio")

// 读写一步到位
os.WriteFile("notes.txt", []byte("第一行\\n第二行"), 0644)
content, _ := os.ReadFile("notes.txt")

// 大文件逐行读
file, _ := os.Open("big.log")
defer file.Close()  // defer 确保关闭

scanner := bufio.NewScanner(file)
for scanner.Scan() {
    fmt.Println(scanner.Text())
}`,
        rust: `use std::fs;
use std::io::{BufRead, BufReader};

// 读写一步到位
fs::write("notes.txt", "第一行\\n第二行")?;
let content = fs::read_to_string("notes.txt")?;

// 大文件逐行读（自动关闭，离开作用域即释放）
let file = fs::File::open("big.log")?;
for line in BufReader::new(file).lines() {
    println!("{}", line?);
}`,
      },
    },
    {
      id: 'datetime',
      title: { zh: '日期与时间', en: 'Date & Time' },
      snippets: {
        python: `from datetime import datetime, timedelta

now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M"))  # 格式化

# 解析字符串
d = datetime.strptime("2026-08-01", "%Y-%m-%d")

# 时间运算
tomorrow = now + timedelta(days=1)

# 时间戳
ts = now.timestamp()
print(datetime.fromtimestamp(ts))`,
        javascript: `const now = new Date();

// 原生 API 较弱是共识，项目常用 dayjs
console.log(now.toISOString());
console.log(now.getFullYear(), now.getMonth() + 1);

// 时间戳（毫秒）
const ts = Date.now();

// dayjs 风格（npm i dayjs）：
// dayjs().format("YYYY-MM-DD HH:mm")
// dayjs().add(1, "day")`,
        java: `// java.time（Java 8 引入，抛弃 Date/Calendar）
LocalDateTime now = LocalDateTime.now();
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
System.out.println(now.format(fmt));

// 解析
LocalDate d = LocalDate.parse("2026-08-01");

// 时间运算
LocalDateTime tomorrow = now.plusDays(1);

// 时间戳
long ts = Instant.now().toEpochMilli();`,
        go: `import "time"

now := time.Now()

// Go 的格式化用"参考时间"：2006-01-02 15:04:05
fmt.Println(now.Format("2006-01-02 15:04"))

// 解析
d, _ := time.Parse("2006-01-02", "2026-08-01")

// 时间运算
tomorrow := now.Add(24 * time.Hour)

// 时间戳
ts := now.Unix()`,
        rust: `// 标准库只有基础，日常用 chrono
use chrono::{Local, Duration, NaiveDate};

let now = Local::now();
println!("{}", now.format("%Y-%m-%d %H:%M"));

// 解析
let d = NaiveDate::parse_from_str("2026-08-01", "%Y-%m-%d").unwrap();

// 时间运算
let tomorrow = now + Duration::days(1);

// 时间戳
let ts = now.timestamp();`,
      },
    },
    {
      id: 'regex',
      title: { zh: '正则表达式', en: 'Regular Expressions' },
      snippets: {
        python: `import re

text = "订单号: A12345, 金额: 99.5"

# 查找
m = re.search(r"金额: ([\\d.]+)", text)
print(m.group(1))       # 99.5

# 全量匹配
ids = re.findall(r"[A-Z]\\d+", text)  # ['A12345']

# 替换
masked = re.sub(r"\\d", "*", text)

# 预编译（高频使用提速）
pattern = re.compile(r"\\w+@\\w+\\.com")`,
        javascript: `const text = "订单号: A12345, 金额: 99.5";

// 查找
const m = text.match(/金额: ([\\d.]+)/);
console.log(m[1]);            // 99.5

// 全量匹配
const ids = text.match(/[A-Z]\\d+/g); // ['A12345']

// 替换
const masked = text.replace(/\\d/g, "*");

// 测试
/^\\w+@\\w+\\.com$/.test("a@b.com");  // true`,
        java: `// Pattern + Matcher
String text = "订单号: A12345, 金额: 99.5";

Pattern p = Pattern.compile("金额: ([\\\\d.]+)");
Matcher m = p.matcher(text);
if (m.find()) {
    System.out.println(m.group(1));  // 99.5
}

// 快速校验
boolean ok = "a@b.com".matches("\\\\w+@\\\\w+\\\\.com");

// 替换
String masked = text.replaceAll("\\\\d", "*");`,
        go: `import "regexp"

text := "订单号: A12345, 金额: 99.5"

// 预编译（包级复用）
re := regexp.MustCompile(\`金额: ([\\d.]+)\`)
m := re.FindStringSubmatch(text)
fmt.Println(m[1])  // 99.5

// 全量匹配
ids := regexp.MustCompile(\`[A-Z]\\d+\`).FindAllString(text, -1)

// 替换
masked := regexp.MustCompile(\`\\d\`).ReplaceAllString(text, "*")`,
        rust: `// regex crate（无内置正则）
use regex::Regex;

let text = "订单号: A12345, 金额: 99.5";

let re = Regex::new(r"金额: ([\\d.]+)").unwrap();
if let Some(caps) = re.captures(text) {
    println!("{}", &caps[1]);  // 99.5
}

// 替换
let masked = Regex::new(r"\\d").unwrap()
    .replace_all(text, "*");

// 高频使用用 lazy_static/once_cell 缓存编译结果`,
      },
    },
    {
      id: 'testing',
      title: { zh: '单元测试', en: 'Unit Testing' },
      description: {
        zh: '测试文件名与运行方式各有约定：Go/Rust 测试和源码住在一起。',
        en: 'Naming and runner conventions differ: Go/Rust tests live next to source code.',
      },
      snippets: {
        python: `# test_calc.py —— pytest 风格（主流）
def add(a, b):
    return a + b

def test_add():
    assert add(2, 3) == 5
    assert add(-1, 1) == 0

# 参数化：一次写多组用例
import pytest

@pytest.mark.parametrize("a,b,want", [(2, 3, 5), (0, 0, 0)])
def test_add_cases(a, b, want):
    assert add(a, b) == want

# 运行: pytest`,
        javascript: `// calc.test.js —— node:test（18+ 内置）
const { test } = require("node:test");
const assert = require("node:assert");

function add(a, b) { return a + b; }

test("add 基本加法", () => {
  assert.strictEqual(add(2, 3), 5);
});

test("add 边界情况", () => {
  assert.strictEqual(add(-1, 1), 0);
});

// 运行: node --test
// 项目常用: vitest / jest（expect 语法）`,
        java: `// CalcTest.java —— JUnit 5（Maven 标准结构）
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalcTest {

    @Test
    void add基本加法() {
        assertEquals(5, Calc.add(2, 3));
    }

    @Test
    void add边界情况() {
        assertEquals(0, Calc.add(-1, 1));
    }
}
// 运行: mvn test`,
        go: `// calc_test.go —— 与源码同目录同名
package main

import "testing"

func TestAdd(t *testing.T) {
    if got := Add(2, 3); got != 5 {
        t.Errorf("Add(2,3) = %d, want 5", got)
    }
}

// 表驱动测试（Go 招牌风格）
func TestAddCases(t *testing.T) {
    cases := []struct{ a, b, want int }{{2, 3, 5}, {0, 0, 0}}
    for _, c := range cases {
        if got := Add(c.a, c.b); got != c.want {
            t.Errorf("Add(%d,%d) = %d", c.a, c.b, got)
        }
    }
}
// 运行: go test ./...`,
        rust: `// 测试直接写在源文件末尾（或 tests/ 目录）
fn add(a: i32, b: i32) -> i32 { a + b }

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    #[should_panic]  // 验证会 panic
    fn test_overflow() {
        let _ = i32::MAX + 1;
    }
}
// 运行: cargo test`,
      },
    },
    {
      id: 'http-client',
      title: { zh: '发起 HTTP 请求', en: 'HTTP Client' },
      description: {
        zh: '调用下游 API 是后端日常。注意 Java 示例用 JDK 8 可用的方式。',
        en: 'Calling downstream APIs is daily backend work. The Java example sticks to JDK 8.',
      },
      snippets: {
        python: `import requests  # 事实标准（httpx 是异步新选）

# GET 带参数
resp = requests.get(
    "https://api.example.com/users",
    params={"page": 1},
    timeout=10,
)
data = resp.json()

# POST JSON
resp = requests.post(
    "https://api.example.com/users",
    json={"name": "小明"},
    headers={"Authorization": "Bearer token"},
)
resp.raise_for_status()  # 非 2xx 抛异常`,
        javascript: `// fetch（Node 18+ 内置，无需装包）
const resp = await fetch("https://api.example.com/users?page=1", {
  headers: { Authorization: "Bearer token" },
});
const data = await resp.json();

// POST JSON
const resp2 = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "小明" }),
});

// 注意: fetch 不会因 4xx/5xx 抛异常，要自己判断 resp.ok`,
        java: `// JDK 8 时代: HttpURLConnection（或 OkHttp/Apache HttpClient）
URL url = new URL("https://api.example.com/users?page=1");
HttpURLConnection conn = (HttpURLConnection) url.openConnection();
conn.setRequestMethod("GET");
conn.setRequestProperty("Authorization", "Bearer token");
conn.setConnectTimeout(10_000);

try (BufferedReader br = new BufferedReader(
        new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
    String body = br.lines().collect(Collectors.joining());
    System.out.println(body);
}
// Java 11+ 才有现代化的 HttpClient`,
        go: `import ("net/http"; "io"; "encoding/json")

// GET
resp, err := http.Get("https://api.example.com/users?page=1")
if err != nil {
    log.Fatal(err)
}
defer resp.Body.Close()  // 必须关闭！

body, _ := io.ReadAll(resp.Body)

// POST JSON + 自定义请求
payload := strings.NewReader(\`{"name":"小明"}\`)
req, _ := http.NewRequest("POST", url, payload)
req.Header.Set("Content-Type", "application/json")
resp2, _ := (&http.Client{Timeout: 10 * time.Second}).Do(req)`,
        rust: `// reqwest（tokio 生态主流）
// Cargo.toml: reqwest = { version = "0.12", features = ["json"] }

let client = reqwest::Client::new();

// GET 带参数
let resp = client
    .get("https://api.example.com/users")
    .query(&[("page", "1")])
    .timeout(std::time::Duration::from_secs(10))
    .send()
    .await?;
let data: serde_json::Value = resp.json().await?;

// POST JSON
client.post("https://api.example.com/users")
    .json(&serde_json::json!({"name": "小明"}))
    .bearer_auth("token")
    .send()
    .await?;`,
      },
    },
  ],
};
