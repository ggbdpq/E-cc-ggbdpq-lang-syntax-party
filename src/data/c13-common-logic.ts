import type { Category } from './types';

/**
 * 常用处理逻辑：业务开发中反复出现的数据处理模式
 */
export const commonLogic: Category = {
  id: 'common-logic',
  title: { zh: '常用处理逻辑', en: 'Common Processing Patterns' },
  topics: [
    {
      id: 'dedupe-group',
      title: { zh: '去重与分组统计', en: 'Dedupe & Group By' },
      description: {
        zh: '业务数据处理双雄：列表去重、按字段分组计数——每天都在写的逻辑。',
        en: 'The dynamic duo of business data work: deduplication and group-by counting.',
      },
      difficulty: 2,
      snippets: {
        python: `orders = [
    {"user": "小明", "city": "北京", "amount": 100},
    {"user": "小红", "city": "上海", "amount": 200},
    {"user": "小明", "city": "北京", "amount": 150},
]

# 去重（保序）：dict.fromkeys 是经典技巧
cities = list(dict.fromkeys(o["city"] for o in orders))
# ['北京', '上海']

# 分组统计：每城市总金额
from collections import defaultdict
by_city = defaultdict(int)
for o in orders:
    by_city[o["city"]] += o["amount"]
# {'北京': 250, '上海': 200}

# 去重对象列表（按某个键）
seen = {}
for o in orders:
    seen.setdefault(o["user"], o)
unique_users = list(seen.values())`,
        javascript: `const orders = [
  { user: '小明', city: '北京', amount: 100 },
  { user: '小红', city: '上海', amount: 200 },
  { user: '小明', city: '北京', amount: 150 },
];

// 去重：Set 一行搞定
const cities = [...new Set(orders.map(o => o.city))];
// ['北京', '上海']

// 分组统计：每城市总金额
const byCity = orders.reduce((acc, o) => {
  acc[o.city] = (acc[o.city] || 0) + o.amount;
  return acc;
}, {});
// { 北京: 250, 上海: 200 }

// 去重对象列表（按某个键）：Map 保序去重
const uniqueUsers = [...new Map(orders.map(o => [o.user, o])).values()];

// 2024+ 还有原生: Object.groupBy(orders, o => o.city)`,
        java: `List<Order> orders = Arrays.asList(
    new Order("小明", "北京", 100),
    new Order("小红", "上海", 200),
    new Order("小明", "北京", 150));

// 去重（保序）：LinkedHashSet
Set<String> cities = orders.stream()
    .map(Order::getCity)
    .collect(Collectors.toCollection(LinkedHashSet::new));

// 分组统计：Collectors 三剑客之一 groupingBy
Map<String, Integer> byCity = orders.stream().collect(
    Collectors.groupingBy(
        Order::getCity,
        Collectors.summingInt(Order::getAmount)));
// {北京=250, 上海=200}

// 按用户去重：toMap 合并函数取先出现的
Map<String, Order> unique = orders.stream().collect(
    Collectors.toMap(Order::getUser, o -> o, (a, b) -> a,
        LinkedHashMap::new));`,
        go: `orders := []Order{
    {"小明", "北京", 100},
    {"小红", "上海", 200},
    {"小明", "北京", 150},
}

// 去重：map 当 set 用（保序需额外切片）
seen := map[string]bool{}
var cities []string
for _, o := range orders {
    if !seen[o.City] {
        seen[o.City] = true
        cities = append(cities, o.City)
    }
}

// 分组统计：每城市总金额
byCity := map[string]int{}
for _, o := range orders {
    byCity[o.City] += o.Amount
}
fmt.Println(cities, byCity)
// [北京 上海] map[北京:250 上海:200]`,
        rust: `let orders = vec![
    ("小明", "北京", 100),
    ("小红", "上海", 200),
    ("小明", "北京", 150),
];

// 去重（保序）：HashSet 判重 + Vec 保序
let mut seen = std::collections::HashSet::new();
let cities: Vec<_> = orders.iter()
    .filter(|(_, city, _)| seen.insert(*city))
    .map(|(_, city, _)| *city)
    .collect();

// 分组统计：每城市总金额
let mut by_city: std::collections::HashMap<&str, i32> =
    std::collections::HashMap::new();
for (_, city, amount) in &orders {
    *by_city.entry(city).or_insert(0) += amount;
}
println!("{:?} {:?}", cities, by_city);
// ["北京", "上海"] {"北京": 250, "上海": 200}`,
      },
    },
    {
      id: 'retry-backoff',
      title: { zh: '重试与指数退避', en: 'Retry with Backoff' },
      description: {
        zh: '调用不稳定下游的保命逻辑：失败重试 3 次，间隔按 1s→2s→4s 指数增长。',
        en: 'Survival logic for flaky downstreams: 3 retries with exponential backoff 1s→2s→4s.',
      },
      difficulty: 3,
      snippets: {
        python: `import time
import random

def with_retry(func, max_attempts=3, base_delay=1.0):
    """通用重试装饰器：指数退避 + 抖动"""
    for attempt in range(1, max_attempts + 1):
        try:
            return func()
        except Exception as e:
            if attempt == max_attempts:
                raise  # 最后一次失败，放弃并抛出
            delay = base_delay * (2 ** (attempt - 1))
            # 加抖动防止"惊群"：多个客户端同时重试
            delay *= random.uniform(0.5, 1.5)
            print(f"第{attempt}次失败({e})，{delay:.1f}s 后重试")
            time.sleep(delay)

def call_flaky_api():
    if random.random() < 0.7:
        raise ConnectionError("下游抖动")
    return {"data": "ok"}

result = with_retry(call_flaky_api)
print(result)`,
        javascript: `async function withRetry(fn, maxAttempts = 3, baseDelay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === maxAttempts) throw e; // 最后一次失败，放弃
      // 指数退避 + 抖动（防止惊群）
      const delay = baseDelay * 2 ** (attempt - 1) * (0.5 + Math.random());
      console.log(\`第\${attempt}次失败(\${e.message})，\${delay | 0}ms 后重试\`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

async function callFlakyApi() {
  if (Math.random() < 0.7) throw new Error('下游抖动');
  return { data: 'ok' };
}

const result = await withRetry(callFlakyApi);
console.log(result);`,
        java: `// 手写重试工具（生产可用 Spring Retry / Resilience4j）
public static <T> T withRetry(Supplier<T> supplier, int maxAttempts)
        throws InterruptedException {
    Random random = new Random();
    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return supplier.get();
        } catch (RuntimeException e) {
            if (attempt == maxAttempts) throw e; // 最后一次失败，放弃
            // 指数退避 + 抖动
            long delay = (long) (1000 * Math.pow(2, attempt - 1)
                * (0.5 + random.nextDouble()));
            System.out.println("第" + attempt + "次失败(" + e.getMessage()
                + ")，" + delay + "ms 后重试");
            Thread.sleep(delay);
        }
    }
    throw new IllegalStateException("不可达");
}

// 使用
String result = withRetry(() -> callFlakyApi(), 3);`,
        go: `// 重试 + 指数退避 + 抖动
func withRetry(fn func() error, maxAttempts int, baseDelay time.Duration) error {
    var err error
    for attempt := 1; attempt <= maxAttempts; attempt++ {
        if err = fn(); err == nil {
            return nil // 成功
        }
        if attempt == maxAttempts {
            break // 最后一次失败，放弃
        }
        // 指数退避 + 抖动（防止惊群）
        delay := baseDelay * time.Duration(1<<(attempt-1))
        delay = time.Duration(float64(delay) * (0.5 + rand.Float64()))
        fmt.Printf("第%d次失败(%v)，%v 后重试\\n", attempt, err, delay)
        time.Sleep(delay)
    }
    return err // 返回最后一次的错误
}

// 使用
err := withRetry(func() error {
    return callFlakyApi()
}, 3, time.Second)`,
        rust: `use std::time::Duration;

// 重试 + 指数退避 + 抖动
fn with_retry<F, T, E>(mut f: F, max_attempts: u32, base: Duration) -> Result<T, E>
where
    F: FnMut() -> Result<T, E>,
{
    let mut attempt = 1;
    loop {
        match f() {
            Ok(v) => return Ok(v),
            Err(e) => {
                if attempt == max_attempts {
                    return Err(e); // 最后一次失败，放弃
                }
                let delay = base * 2u32.pow(attempt - 1);
                // 生产环境加抖动: rand::random::<f64>() * 0.5 + 0.5
                println!("第{}次失败，{:?} 后重试", attempt, delay);
                std::thread::sleep(delay);
                attempt += 1;
            }
        }
    }
}

// 异步版本用 tokio::time::sleep
// 生产推荐 backoff crate，与 reqwest 无缝配合`,
      },
    },
    {
      id: 'flatten-tree',
      title: { zh: '树形结构递归处理', en: 'Tree Recursion' },
      description: {
        zh: '菜单树、部门树、评论楼——后端永恒的递归题：把树打平成带层级的列表。',
        en: 'Menu trees, org trees, comment threads — the eternal backend recursion: flatten a tree into a leveled list.',
      },
      difficulty: 3,
      snippets: {
        python: `tree = {
    "id": 1, "name": "公司", "children": [
        {"id": 2, "name": "技术部", "children": [
            {"id": 4, "name": "后端组", "children": []},
            {"id": 5, "name": "前端组", "children": []},
        ]},
        {"id": 3, "name": "市场部", "children": []},
    ],
}

def flatten(node, depth=0):
    """深度优先遍历：父在前，子缩进"""
    yield {"id": node["id"], "name": node["name"], "depth": depth}
    for child in node.get("children", []):
        yield from flatten(child, depth + 1)  # 委托生成器

for row in flatten(tree):
    print("  " * row["depth"] + row["name"])
# 公司 /   技术部 /     后端组 /     前端组 /   市场部`,
        javascript: `const tree = {
  id: 1, name: '公司', children: [
    { id: 2, name: '技术部', children: [
      { id: 4, name: '后端组', children: [] },
      { id: 5, name: '前端组', children: [] },
    ]},
    { id: 3, name: '市场部', children: [] },
  ],
};

function flatten(node, depth = 0) {
  return [
    { id: node.id, name: node.name, depth },
    // 递归展开子节点
    ...(node.children || []).flatMap(c => flatten(c, depth + 1)),
  ];
}

for (const row of flatten(tree)) {
  console.log('  '.repeat(row.depth) + row.name);
}
// 公司 /   技术部 /     后端组 /     前端组 /   市场部`,
        java: `class Dept {
    int id;
    String name;
    List<Dept> children = new ArrayList<>();
    Dept(int id, String name) { this.id = id; this.name = name; }
}

// 深度优先打平：结果收集进列表参数
static void flatten(Dept node, int depth, List<String> out) {
    out.add("  ".repeat(depth) + node.name);
    for (Dept child : node.children) {
        flatten(child, depth + 1, out);  // 递归处理子树
    }
}

public static void main(String[] args) {
    Dept root = buildTree();  // 省略建树过程
    List<String> rows = new ArrayList<>();
    flatten(root, 0, rows);
    rows.forEach(System.out::println);
    // 公司 /   技术部 /     后端组 /     前端组 /   市场部
}
// 注意: "  ".repeat() 是 Java 11+；JDK 8 用 String.join("", Collections.nCopies(depth, "  "))`,
        go: `type Dept struct {
    ID       int
    Name     string
    Children []*Dept
}

// 深度优先打平：返回带层级的行
func flatten(node *Dept, depth int) []string {
    rows := []string{strings.Repeat("  ", depth) + node.Name}
    for _, child := range node.Children {
        // 递归结果拼接到当前层
        rows = append(rows, flatten(child, depth+1)...)
    }
    return rows
}

func main() {
    root := &Dept{1, "公司", []*Dept{
        {2, "技术部", []*Dept{{4, "后端组", nil}, {5, "前端组", nil}}},
        {3, "市场部", nil},
    }}
    for _, row := range flatten(root, 0) {
        fmt.Println(row)
    }
    // 公司 /   技术部 /     后端组 /     前端组 /   市场部
}`,
        rust: `struct Dept {
    id: i32,
    name: String,
    children: Vec<Dept>,
}

// 深度优先打平：迭代器链式展开
fn flatten(node: &Dept, depth: usize) -> Vec<String> {
    let indent = "  ".repeat(depth);
    std::iter::once(format!("{}{}", indent, node.name))
        .chain(node.children.iter()
            .flat_map(|c| flatten(c, depth + 1)))  // 递归拍平
        .collect()
}

fn main() {
    let root = Dept {
        id: 1,
        name: "公司".into(),
        children: vec![
            Dept { id: 2, name: "技术部".into(), children: vec![
                Dept { id: 4, name: "后端组".into(), children: vec![] },
                Dept { id: 5, name: "前端组".into(), children: vec![] },
            ]},
            Dept { id: 3, name: "市场部".into(), children: vec![] },
        ],
    };
    for row in flatten(&root, 0) {
        println!("{}", row);
    }
    // 公司 /   技术部 /     后端组 /     前端组 /   市场部
}`,
      },
    },
    {
      id: 'memoize',
      title: { zh: '记忆化缓存（Memoize）', en: 'Memoization' },
      description: {
        zh: '给昂贵函数加一层"算过就存"的缓存——以斐波那契为例，O(2ⁿ) 秒变 O(n)。',
        en: 'Cache expensive function calls — Fibonacci goes from O(2ⁿ) to O(n).',
      },
      difficulty: 2,
      snippets: {
        python: `import functools
import time

# 装饰器一行搞定（标准库神器）
@functools.lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

start = time.time()
print(fib(100))          # 无缓存根本算不完
print(f"{time.time()-start:.4f}s")  # 0.0000s

# 手写版（理解原理）
def memoize(func):
    cache = {}
    @functools.wraps(func)
    def wrapper(n):
        if n not in cache:
            cache[n] = func(n)
        return cache[n]
    return wrapper`,
        javascript: `// 手写记忆化装饰器
function memoize(fn) {
  const cache = new Map();
  return function (n) {
    if (cache.has(n)) return cache.get(n);
    const result = fn(n);
    cache.set(n, result);
    return result;
  };
}

// 注意：递归调用要指向包装后的版本
const fib = memoize((n) => (n < 2 ? n : fib(n - 1) + fib(n - 2)));

console.time('fib');
console.log(fib(100)); // 无缓存根本算不完
console.timeEnd('fib'); // ~0.1ms`,
        java: `// Map.computeIfAbsent：Java 8 的记忆化利器
class Fib {
    private static final Map<Integer, Long> cache = new HashMap<>();

    static long fib(int n) {
        if (n < 2) return n;
        // 有缓存直接返回，没有才计算
        return cache.computeIfAbsent(n, k -> fib(k - 1) + fib(k - 2));
    }
}

public static void main(String[] args) {
    long start = System.nanoTime();
    System.out.println(Fib.fib(50));  // 无缓存要跑几十秒
    System.out.println((System.nanoTime() - start) / 1_000_000 + "ms");
}`,
        go: `// 闭包封装缓存
func memoize(fn func(int) int) func(int) int {
    cache := map[int]int{}
    return func(n int) int {
        if v, ok := cache[n]; ok {
            return v
        }
        v := fn(n)
        cache[n] = v
        return v
    }
}

// 递归引用要先声明再赋值
var fib func(int) int
fib = memoize(func(n int) int {
    if n < 2 {
        return n
    }
    return fib(n-1) + fib(n-2)
})

func main() {
    start := time.Now()
    fmt.Println(fib(50))  // 无缓存要跑几十秒
    fmt.Println(time.Since(start))
}`,
        rust: `use std::collections::HashMap;

// struct 持有缓存（Rust 闭包+可变的所有权太绕，struct 更顺手）
struct Fib {
    cache: HashMap<u32, u64>,
}

impl Fib {
    fn new() -> Self {
        Self { cache: HashMap::new() }
    }

    fn calc(&mut self, n: u32) -> u64 {
        if n < 2 {
            return n as u64;
        }
        if let Some(&v) = self.cache.get(&n) {
            return v;  // 命中缓存
        }
        let v = self.calc(n - 1) + self.calc(n - 2);
        self.cache.insert(n, v);
        v
    }
}

fn main() {
    let mut fib = Fib::new();
    let start = std::time::Instant::now();
    println!("{}", fib.calc(90));  // 无缓存根本算不完
    println!("{:?}", start.elapsed());
}`,
      },
    },
  ],
};
