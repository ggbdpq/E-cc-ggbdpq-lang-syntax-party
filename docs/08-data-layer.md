# 08 数据层：从内存到 MySQL 再到 Redis

> 对应网站页签：🛠️ 全栈核心 → 数据层；🐬 MySQL 速成。数据源 `src/data/g5-fullstack-data.ts`、`g3-mysql.ts`。

## 先说结论

数据层解决三件事，难度递增：

1. **配置**：连接串不能写死在代码里 → 环境变量。
2. **持久化**：内存数组换成 SQL 表 → 同一份 CRUD 契约换 store 实现。
3. **性能与一致性**：事务保证多步写入的原子性，Redis 把热读挡在库前。

网站把这条路线概括为「内存 CRUD：先跑通再换库」——你在第 06 篇跑通的内存版，就是换库之前的那个 store。

## 环境变量：配置与代码分离

前端你用过 `import.meta.env.VITE_API_URL`，后端同一个思想，落地工具是各语言的 dotenv 生态。原则只有一条：**连接串、密钥、端口进环境变量，`.env` 进 `.gitignore`**。

```python
# Python：os.environ 或 pydantic-settings
import os
db_url = os.environ["DATABASE_URL"]
```

```javascript
// Node：process.env（配合 dotenv 包读 .env 文件）
const dbUrl = process.env.DATABASE_URL;
```

```java
// Spring：application.properties 里直接引用环境变量
spring.datasource.url=${DATABASE_URL}
```

```go
// Go：os.Getenv，注意空串判断
dbURL := os.Getenv("DATABASE_URL")
```

```rust
// Rust：std::env 或 dotenvy
let db_url = std::env::var("DATABASE_URL")?;
```

第 07 篇说过 JWT 实验室的 `secret` 写死在代码里是简化。真实项目里它就该是 `os.environ["JWT_SECRET"]`——现在你知道往哪改了。

## SQL CRUD：换 store 不换契约

Todo 的契约不变，`_todos` 数组换成一张表：

```sql
CREATE TABLE todos (
  id       BIGINT PRIMARY KEY AUTO_INCREMENT,
  title    VARCHAR(200) NOT NULL,
  done     BOOLEAN NOT NULL DEFAULT FALSE,
  owner_id BIGINT NOT NULL
);
```

四个动词的 SQL 对应（MySQL 速成页 `g3-mysql.ts` 有完整查询训练）：

| 动词 | 内存版 | SQL 版 |
|------|--------|--------|
| 列表 | `_todos.filter(...)` | `SELECT * FROM todos WHERE owner_id = ?` |
| 创建 | `append/ push` | `INSERT INTO todos (title, owner_id) VALUES (?, ?)` |
| 更新 | `item.done = true` | `UPDATE todos SET done = ? WHERE id = ? AND owner_id = ?` |
| 删除 | `splice` | `DELETE FROM todos WHERE id = ?` |

两种写法里最值得养成习惯的是 **`?` 占位符参数化查询**。五语言连库示例（网站「五语言连接 MySQL 对照」主题）全部使用参数化而不是字符串拼接——拼 SQL 是 SQL 注入的唯一来源。前端读者可以这么理解：**`?` 占位符之于 SQL，等于 React 里不拼 HTML 字符串之于 XSS**，同一个教训的两处现场。

```javascript
// Node (mysql2)：参数化
await db.query('SELECT * FROM todos WHERE owner_id = ?', [userId]);
```

```python
# Python (aiomysql/SQLAlchemy)：同样参数化
await conn.execute("SELECT * FROM todos WHERE owner_id = %s", (user_id,))
```

## 事务：提交失败要整笔回滚

网站用「转账」讲事务的必要性：A 扣 100 和 B 加 100 是两条 UPDATE，中间任何一步失败，钱就凭空消失或凭空出现。事务把多条语句捆成一个原子操作：

```sql
START TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- 任一步出错则 ROLLBACK
```

应用层的写法（Spring 版最典型）：

```java
@Transactional  // 方法内所有库操作在一个事务里，异常自动回滚
public void transfer(Long from, Long to, BigDecimal amount) {
    accountRepo.deduct(from, amount);
    accountRepo.add(to, amount);
}
```

前端对应物：你删一条有子记录的数据时遇到的「外键约束失败」，或者乐观锁冲突时的提交失败——那些「要么全成要么全不算」的需求，服务端全靠事务实现。**判断一个功能要不要事务的简单标准：这个操作成功一半算不算成功？** 算，就不用；不算，就必须。

## Redis 缓存：别每次都打库

列表页每次都 `SELECT` 全表，数据库会成为第一个瓶颈。Redis 是内存键值库，读性能比 MySQL 高一到两个数量级。缓存的经典套路：

```
读：先查 Redis → 命中直接返回
              → 未命中查 MySQL → 写入 Redis（带过期时间）→ 返回
写：更新 MySQL → 删除对应 Redis 键（下读时重建）
```

代价是网站数据层主题里明说的：**缓存引入脏数据窗口**——写库和删缓存之间有时间差，读到的可能是旧值。所以「列表秒开 或 脏数据」是一对共生体，什么数据能容忍脏读（商品详情可以，库存余额不行）是架构判断力的体现。第 11 篇的 BFF 案例里你会看到 `redis.lpush("audio:jobs", job_id)` 的另一种用法：Redis 当队列，不只是缓存。

## MySQL 查询基本功：速成页怎么用

`g3-mysql.ts` 按《MySQL 必知必会》体系组织了 15 个主题，学法建议：

- **必练**：SELECT/LIMIT、ORDER BY、WHERE、聚合 GROUP BY、JOIN、事务、索引与 EXPLAIN。这七件事覆盖日常后端 90% 的查询场景。
- **高危区**：`UPDATE`/`DELETE` 主题标题里就写了「高危操作」——线上环境永远先 `SELECT` 确认影响范围，再套同样的 WHERE 执行写操作；不带 WHERE 的 UPDATE 是事故榜第一名。
- **性能直觉**：EXPLAIN 看「有没有走索引」。WHERE 和 JOIN 涉及的列建索引，索引不是越多越好（写入变慢）。

网站还配了五语言连接 MySQL 的对照实战（「连接 MySQL 并查询用户表」主题），每种语言从建连接到带参查询的完整样本。

## 练习

1. 本机装 MySQL（或起 Docker：`docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8`），跑通 MySQL 速成页的查询三板斧。
2. 改造练习（本系列最值得做的一个）：把 `labs/todo-api/node-express/index.js` 的内存数组换成 mysql2 连接（建上面那张 todos 表），契约保持不变。你的前端页面不用改一行代码——这就是「换 store 不换契约」的直观证明。
3. 写一个故意中途失败的转账（第二条 UPDATE 改个不存在的 id），验证 ROLLBACK 生效。
4. 给 todo 列表接口加 Redis 缓存，再用 PATCH 改数据，观察缓存脏数据窗口——亲眼看见比背十条缓存原则有用。

## 下一步

数据落库了，但一个「能上线」的服务还缺：出错时不能返回 500 HTML、日志要有、大列表要分页、容器里要能健康检查。第 09 篇把这些上线层的事一次讲完。
