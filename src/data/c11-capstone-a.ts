import type { Topic } from './types';

/**
 * 综合案例 A：多知识点融合的完整小项目
 */
export const capstonePartA: Topic[] = [
  {
    id: 'concurrent-fetcher',
    title: { zh: '并发抓取器（限流 + 超时 + 汇总）', en: 'Concurrent Fetcher (Rate Limit + Timeout + Aggregate)' },
    description: {
      zh: '任务：抓取 10 个 URL，最多 3 个并发，单个 2 秒超时，最后汇总成功/失败。融合：并发、HTTP、错误处理、集合聚合。',
      en: 'Task: fetch 10 URLs with max 3 concurrent, 2s timeout each, then aggregate results. Combines concurrency, HTTP, error handling, aggregation.',
    },
    difficulty: 3,
    snippets: {
      python: `import asyncio

URLS = [f"https://api.example.com/item/{i}" for i in range(10)]
MAX_CONCURRENT = 3
TIMEOUT = 2.0


async def real_fetch(url: str) -> dict:
    # 真实项目: async with aiohttp.ClientSession() as s: await s.get(url)
    await asyncio.sleep(0.1)      # 模拟网络请求
    if url.endswith("/4"):
        raise ConnectionError("连接被重置")
    return {"url": url, "status": 200}


async def fetch_one(sem: asyncio.Semaphore, url: str) -> dict:
    async with sem:               # 信号量 = 并发上限
        try:
            # wait_for 实现超时控制
            data = await asyncio.wait_for(real_fetch(url), TIMEOUT)
            return {"ok": True, "data": data}
        except Exception as e:    # 超时/网络错误统一兜底
            return {"ok": False, "url": url, "error": str(e)}


async def main():
    sem = asyncio.Semaphore(MAX_CONCURRENT)
    results = await asyncio.gather(*[fetch_one(sem, u) for u in URLS])

    ok = [r for r in results if r["ok"]]
    failed = [r for r in results if not r["ok"]]
    print(f"成功 {len(ok)}，失败 {len(failed)}")
    for f in failed:
        print("  失败:", f["url"], f["error"])


asyncio.run(main())`,
      javascript: `const URLS = Array.from({ length: 10 }, (_, i) => \`https://api.example.com/item/\${i}\`);
const MAX_CONCURRENT = 3;
const TIMEOUT_MS = 2000;

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, { signal: controller.signal });
    return { ok: true, status: resp.status };
  } catch (e) {
    return { ok: false, url, error: e.name === 'AbortError' ? '超时' : e.message };
  } finally {
    clearTimeout(timer);
  }
}

// 手写并发池（等价于 p-limit 库）
async function pool(urls, limit) {
  const results = [];
  const executing = new Set();

  for (const url of urls) {
    const p = fetchWithTimeout(url).then((r) => {
      executing.delete(p);
      results.push(r);
    });
    executing.add(p);
    if (executing.size >= limit) {
      await Promise.race(executing); // 池满则等一个完成
    }
  }
  await Promise.all(executing);
  return results;
}

const results = await pool(URLS, MAX_CONCURRENT);
const ok = results.filter((r) => r.ok);
console.log(\`成功 \${ok.length}，失败 \${results.length - ok.length}\`);`,
      java: `record FetchResult(String url, boolean ok, String error) { }
// JDK 8 无 record，请用普通 class（此处为示意简化）

static FetchResult fetchOne(String url) {
    try {
        HttpURLConnection conn = (HttpURLConnection)
            new URL(url).openConnection();
        conn.setConnectTimeout(2000);   // 连接超时
        conn.setReadTimeout(2000);      // 读取超时
        conn.getInputStream().close();
        return new FetchResult(url, true, null);
    } catch (Exception e) {
        return new FetchResult(url, false, e.getMessage());
    }
}

public static void main(String[] args) {
    List<String> urls = IntStream.range(0, 10)
        .mapToObj(i -> "https://api.example.com/item/" + i)
        .collect(Collectors.toList());

    // 固定线程池 = 并发上限
    ExecutorService pool = Executors.newFixedThreadPool(3);

    List<CompletableFuture<FetchResult>> futures = urls.stream()
        .map(u -> CompletableFuture.supplyAsync(() -> fetchOne(u), pool))
        .collect(Collectors.toList());

    // 等全部完成后统一汇总
    List<FetchResult> results = futures.stream()
        .map(CompletableFuture::join)
        .collect(Collectors.toList());

    long ok = results.stream().filter(FetchResult::ok).count();
    System.out.println("成功 " + ok + "，失败 " + (results.size() - ok));
    pool.shutdown();
}`,
      go: `package main

import (
    "fmt"
    "io"
    "net/http"
    "sync"
    "time"
)

type Result struct {
    URL string
    OK  bool
    Err string
}

func main() {
    urls := make([]string, 10)
    for i := range urls {
        urls[i] = fmt.Sprintf("https://api.example.com/item/%d", i)
    }

    client := &http.Client{Timeout: 2 * time.Second} // 超时内建
    sem := make(chan struct{}, 3)                    // 信号量 = 并发上限
    results := make(chan Result, len(urls))
    var wg sync.WaitGroup

    for _, url := range urls {
        wg.Add(1)
        go func(u string) {
            defer wg.Done()
            sem <- struct{}{}        // 获取槽位
            defer func() { <-sem }() // 释放槽位

            resp, err := client.Get(u)
            if err != nil {
                results <- Result{u, false, err.Error()}
                return
            }
            defer resp.Body.Close()
            io.Copy(io.Discard, resp.Body) // 读完复用连接
            results <- Result{u, true, ""}
        }(url)
    }

    wg.Wait() // 全部完成后关闭 channel
    close(results)

    ok := 0
    for r := range results { // 从 channel 汇总
        if r.OK {
            ok++
        } else {
            fmt.Println("  失败:", r.URL, r.Err)
        }
    }
    fmt.Printf("成功 %d，失败 %d\\n", ok, len(urls)-ok)
}`,
      rust: `use futures::stream::{self, StreamExt};
use std::time::Duration;

// 依赖: tokio / reqwest / futures

#[tokio::main]
async fn main() {
    let urls: Vec<String> = (0..10)
        .map(|i| format!("https://api.example.com/item/{}", i))
        .collect();

    // 客户端级超时配置
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(2))
        .build()
        .unwrap();

    // buffer_unordered：流式限流的招牌 API
    let results: Vec<(String, Result<reqwest::Response, reqwest::Error>)> =
        stream::iter(urls)
            .map(|url| {
                let client = client.clone(); // Client 内部 Arc，克隆廉价
                async move {
                    let resp = client.get(&url).send().await;
                    (url, resp)
                }
            })
            .buffer_unordered(3) // 最多 3 个并发
            .collect()
            .await;

    let ok = results.iter().filter(|(_, r)| r.is_ok()).count();
    println!("成功 {}，失败 {}", ok, results.len() - ok);
    for (url, r) in &results {
        if let Err(e) = r {
            println!("  失败: {} {}", url, e);
        }
    }
}`,
    },
  },
  {
    id: 'log-analyzer',
    title: { zh: 'Nginx 日志分析器', en: 'Nginx Log Analyzer' },
    description: {
      zh: '任务：解析 access.log，输出状态码分布、Top 3 IP、平均响应大小。融合：文件流式读取、正则、Map 聚合、排序取 TopK。',
      en: 'Task: parse access.log for status distribution, Top 3 IPs, average response size. Combines streaming file I/O, regex, map aggregation, Top-K sorting.',
    },
    difficulty: 3,
    snippets: {
      python: `import re
from collections import Counter

# 日志行: 192.168.1.10 - - [01/Aug/2026:08:00:01 +0800] "GET /api/users HTTP/1.1" 200 1234
LOG_RE = re.compile(
    r'(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] "(\\S+) (\\S+)[^"]*" (\\d{3}) (\\d+)'
)

status_counter = Counter()
ip_counter = Counter()
total_bytes = lines = 0

with open("access.log", encoding="utf-8") as f:  # 流式逐行，不吃内存
    for line in f:
        m = LOG_RE.search(line)
        if not m:                      # 脏行跳过，不能让程序崩
            continue
        ip, _time, _method, _path, status, size = m.groups()
        ip_counter[ip] += 1
        status_counter[status] += 1
        total_bytes += int(size)
        lines += 1

print("状态码分布:", dict(status_counter.most_common()))
print("Top 3 IP:", ip_counter.most_common(3))
print(f"平均响应大小: {total_bytes / max(lines, 1):.0f} B")`,
      javascript: `const fs = require('fs');
const readline = require('readline');

// 日志行: 192.168.1.10 - - [01/Aug/2026:08:00:01 +0800] "GET /api/users HTTP/1.1" 200 1234
const LOG_RE = /(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] "(\\S+) (\\S+)[^"]*" (\\d{3}) (\\d+)/;

const statusCount = new Map();
const ipCount = new Map();
let totalBytes = 0, lines = 0;

const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);

const rl = readline.createInterface({
  input: fs.createReadStream('access.log'),  // 流式读取大文件
});

for await (const line of rl) {               // 异步迭代器语法
  const m = line.match(LOG_RE);
  if (!m) continue;                          // 脏行跳过
  const [, ip, , , , status, size] = m;
  bump(ipCount, ip);
  bump(statusCount, status);
  totalBytes += Number(size);
  lines++;
}

const top = (map, n) =>
  [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);

console.log('状态码分布:', Object.fromEntries(statusCount));
console.log('Top 3 IP:', top(ipCount, 3));
console.log(\`平均响应大小: \${(totalBytes / Math.max(lines, 1)).toFixed(0)} B\`);`,
        java: `// 日志行: 192.168.1.10 - - [01/Aug/2026:08:00:01 +0800] "GET /api/users HTTP/1.1" 200 1234
Pattern LOG_RE = Pattern.compile(
    "(\\\\S+) \\\\S+ \\\\S+ \\\\[([^\\\\]]+)\\\\] \\"(\\\\S+) (\\\\S+)[^\\"]*\\" (\\\\d{3}) (\\\\d+)");

Map<String, Integer> statusCount = new HashMap<>();
Map<String, Integer> ipCount = new HashMap<>();
long[] totalBytes = { 0 };
long[] lines = { 0 };

try (Stream<String> stream = Files.lines(Paths.get("access.log"))) {
    stream.map(LOG_RE::matcher)
          .filter(Matcher::find)              // 脏行自动过滤
          .forEach(m -> {
              ipCount.merge(m.group(1), 1, Integer::sum);      // 聚合神器
              statusCount.merge(m.group(5), 1, Integer::sum);
              totalBytes[0] += Long.parseLong(m.group(6));
              lines[0]++;
          });
}

// Top 3 IP：Stream 排序取前 N
List<Map.Entry<String, Integer>> top3 = ipCount.entrySet().stream()
    .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
    .limit(3)
    .collect(Collectors.toList());

System.out.println("状态码分布: " + statusCount);
System.out.println("Top 3 IP: " + top3);
System.out.printf("平均响应大小: %d B%n",
    lines[0] == 0 ? 0 : totalBytes[0] / lines[0]);`,
        go: `package main

import (
    "bufio"
    "fmt"
    "os"
    "regexp"
    "sort"
    "strconv"
)

// 日志行: 192.168.1.10 - - [01/Aug/2026:08:00:01 +0800] "GET /api/users HTTP/1.1" 200 1234
var logRe = regexp.MustCompile(
    \`(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] "(\\S+) (\\S+)[^"]*" (\\d{3}) (\\d+)\`)

func main() {
    file, err := os.Open("access.log")
    if err != nil {
        panic(err)
    }
    defer file.Close()

    statusCount := map[string]int{}
    ipCount := map[string]int{}
    totalBytes, lines := 0, 0

    scanner := bufio.NewScanner(file)
    for scanner.Scan() {             // 流式逐行
        m := logRe.FindStringSubmatch(scanner.Text())
        if m == nil {                // 脏行跳过
            continue
        }
        ipCount[m[1]]++
        statusCount[m[5]]++
        size, _ := strconv.Atoi(m[6])
        totalBytes += size
        lines++
    }

    // Top 3 IP：Go 无内置 topK，sort 切片
    type kv struct {
        K string
        V int
    }
    pairs := make([]kv, 0, len(ipCount))
    for k, v := range ipCount {
        pairs = append(pairs, kv{k, v})
    }
    sort.Slice(pairs, func(i, j int) bool { return pairs[i].V > pairs[j].V })

    fmt.Println("状态码分布:", statusCount)
    for i := 0; i < 3 && i < len(pairs); i++ {
        fmt.Printf("Top%d IP: %s (%d 次)\\n", i+1, pairs[i].K, pairs[i].V)
    }
    if lines > 0 {
        fmt.Printf("平均响应大小: %d B\\n", totalBytes/lines)
    }
}`,
        rust: `use regex::Regex;
use std::collections::HashMap;
use std::fs::File;
use std::io::{BufRead, BufReader};

fn main() -> std::io::Result<()> {
    // 日志行: 192.168.1.10 - - [01/Aug/2026:08:00:01 +0800] "GET /api/users HTTP/1.1" 200 1234
    let log_re = Regex::new(
        r#"(\\S+) \\S+ \\S+ \\[([^\\]]+)\\] "(\\S+) (\\S+)[^"]*" (\\d{3}) (\\d+)"#,
    ).unwrap();

    let mut status_count: HashMap<String, u32> = HashMap::new();
    let mut ip_count: HashMap<String, u32> = HashMap::new();
    let mut total_bytes: u64 = 0;
    let mut lines: u64 = 0;

    let file = BufReader::new(File::open("access.log")?);
    for line in file.lines() {
        let line = line?;
        let Some(caps) = log_re.captures(&line) else {
            continue; // let-else 语法：不匹配就跳过（Rust 2021+）
        };
        *ip_count.entry(caps[1].to_string()).or_insert(0) += 1;
        *status_count.entry(caps[5].to_string()).or_insert(0) += 1;
        total_bytes += caps[6].parse::<u64>().unwrap_or(0);
        lines += 1;
    }

    // Top 3 IP
    let mut ips: Vec<_> = ip_count.iter().collect();
    ips.sort_by(|a, b| b.1.cmp(a.1));

    println!("状态码分布: {:?}", status_count);
    println!("Top 3 IP: {:?}", &ips[..ips.len().min(3)]);
    if lines > 0 {
        println!("平均响应大小: {} B", total_bytes / lines);
    }
    Ok(())
}`,
    },
  },
];
