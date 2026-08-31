import type { GuideCategory, Category } from './types';

const SQL_COLOR = '#c4b5fd';

/** 连接与库表（对应《MySQL 必知必会》第 1-3 章） */
export const mysqlConnect: GuideCategory = {
  id: 'mysql-connect',
  title: { zh: '连接与库表', en: 'Connection & Tables' },
  topics: [
    {
      id: 'mysql-connect-cmd',
      title: { zh: '连接与选择数据库', en: 'Connect & Select Database' },
      description: {
        zh: '命令行客户端是最直接的学习工具：连上服务器、选一个数据库（USE），之后所有操作都针对它。',
        en: 'The CLI client is the most direct learning tool: connect to the server, USE a database, and all subsequent operations target it.',
      },
      lang: 'sql',
      langLabel: 'Bash / SQL',
      color: SQL_COLOR,
      code: `-- 连接 MySQL 服务器（-u 用户名 -p 密码 -h 主机 -P 端口）
-- 命令行里输入：mysql -u root -p
mysql -u root -p -h 127.0.0.1 -P 3306

-- 查看有哪些数据库，选择要操作的
SHOW DATABASES;
USE shop;                  -- 之后所有 SQL 默认作用于 shop

-- 确认当前身份和所在数据库（迷路时自查）
SELECT USER(), DATABASE();`,
    },
    {
      id: 'mysql-show',
      title: { zh: '查看库表结构', en: 'Inspect Databases & Tables' },
      description: {
        zh: 'SHOW 家族 + DESCRIBE：到一个陌生项目，先用这几条摸清数据库里有什么表、每张表长什么样。',
        en: 'The SHOW family + DESCRIBE: joining an unfamiliar project, use these to map out what tables exist and what each looks like.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 当前库里有哪些表
SHOW TABLES;

-- 某张表的字段结构（类型、能否为 NULL、键、默认值）
DESCRIBE users;
-- +------------+--------------+------+-----+---------+----------------+
-- | Field      | Type         | Null | Key | Default | Extra          |
-- +------------+--------------+------+-----+---------+----------------+
-- | id         | bigint       | NO   | PRI | NULL    | auto_increment |
-- | username   | varchar(50)  | NO   | UNI | NULL    |                |
-- | created_at | datetime     | YES  |     | NULL    |                |
-- +------------+--------------+------+-----+---------+----------------+

-- 看完整的建表语句（学别人怎么设计表）
SHOW CREATE TABLE users;

-- 看表上的索引
SHOW INDEX FROM users;

-- 服务器状态与版本
SELECT VERSION();
SHOW STATUS LIKE 'Threads_connected';`,
    },
    {
      id: 'mysql-create',
      title: { zh: '建库建表', en: 'CREATE DATABASE & TABLE' },
      description: {
        zh: '一张表的核心要素：主键、字段类型、NOT NULL、默认值、字符集。照这个模板建你的第一张表。',
        en: 'Core elements of a table: primary key, column types, NOT NULL, defaults, charset. Use this template for your first table.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 建库：utf8mb4 字符集才能存 emoji 和全部中文
CREATE DATABASE IF NOT EXISTS shop
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE shop;

-- 建表：一个标准用户表模板
CREATE TABLE IF NOT EXISTS users (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键',
  username   VARCHAR(50)  NOT NULL UNIQUE COMMENT '用户名',
  email      VARCHAR(100) NOT NULL COMMENT '邮箱',
  age        TINYINT UNSIGNED DEFAULT 0 COMMENT '年龄',
  balance    DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '余额',
  status     TINYINT NOT NULL DEFAULT 1 COMMENT '1正常 0禁用',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
             ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_email (email)
) ENGINE = InnoDB COMMENT '用户表';

-- 常用类型速查：
--   INT / BIGINT      整数        DECIMAL(M,N) 精确小数（钱！）
--   VARCHAR(n)        变长字符串   TEXT          长文本
--   DATETIME          日期时间     TINYINT(1)    常当布尔用`,
    },
  ],
};

/** 查询三板斧（对应《MySQL 必知必会》第 4-9 章） */
export const mysqlQuery: GuideCategory = {
  id: 'mysql-query',
  title: { zh: '查询三板斧', en: 'Query Essentials' },
  topics: [
    {
      id: 'mysql-select',
      title: { zh: 'SELECT 检索与 LIMIT', en: 'SELECT & LIMIT' },
      description: {
        zh: 'SELECT 是一切查询的起点：选列、去重、分页。生产环境永远记得加 LIMIT，别一把 SELECT * 全表扫。',
        en: 'SELECT starts every query: pick columns, dedupe, paginate. Always add LIMIT in production — never SELECT * a whole table blindly.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 检索单个列 / 多个列 / 所有列
SELECT username FROM users;
SELECT username, email FROM users;
SELECT * FROM users;               -- 学习可用，生产慎用

-- 去重：只看有哪些不同的状态值
SELECT DISTINCT status FROM users;

-- 限制行数：LIMIT 行数 / LIMIT 偏移, 行数
SELECT * FROM users LIMIT 5;        -- 前 5 行
SELECT * FROM users LIMIT 5, 10;    -- 跳过 5 行再取 10 行（第 2 页）

-- 分页公式：第 page 页、每页 size 条 → LIMIT (page-1)*size, size
SELECT id, username FROM users LIMIT 20, 20;  -- 第 2 页

-- 完全限定名：跨库查询时带上库名
SELECT * FROM shop.users;`,
    },
    {
      id: 'mysql-order',
      title: { zh: 'ORDER BY 排序', en: 'ORDER BY Sorting' },
      description: {
        zh: 'ORDER BY 永远在 WHERE 之后、语句末尾。多列排序按书写顺序依次生效，DESC 降序 ASC 升序（默认）。',
        en: 'ORDER BY comes after WHERE, at the end. Multi-column sort applies in written order; DESC descending, ASC ascending (default).',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 单列排序
SELECT username, balance FROM users ORDER BY balance DESC;  -- 余额从高到低

-- 多列排序：先按 status，再按余额降序
SELECT username, status, balance
FROM users
ORDER BY status, balance DESC;

-- 经典组合：最新注册的 10 个用户
SELECT id, username, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 注意：ORDER BY 的列可以不在 SELECT 里
-- 注意：中文按 utf8mb4_unicode_ci 排序，不是拼音顺序
SELECT username FROM users ORDER BY username;`,
    },
    {
      id: 'mysql-where',
      title: { zh: 'WHERE 过滤', en: 'WHERE Filtering' },
      description: {
        zh: 'WHERE 操作符全家：比较、BETWEEN、IN、AND/OR、NULL 判断。NULL 不能用等号，这是新手第一大坑。',
        en: 'The full WHERE operator set: comparison, BETWEEN, IN, AND/OR, NULL checks. NULL cannot use = — the #1 beginner trap.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 比较操作符：= <> != < <= > >=
SELECT * FROM users WHERE age >= 18;
SELECT * FROM users WHERE status <> 1;

-- 范围：BETWEEN 含两端
SELECT * FROM users WHERE age BETWEEN 18 AND 30;

-- 集合：IN 比一串 OR 更高效也更清晰
SELECT * FROM users WHERE status IN (1, 2, 3);
SELECT * FROM users WHERE username IN ('xiaomai', 'laoqi');

-- 组合条件：AND 优先级高于 OR，用括号显式分组！
SELECT * FROM users
WHERE status = 1 AND (age < 18 OR balance > 1000);

-- NOT 取反
SELECT * FROM users WHERE status NOT IN (0, 2);

-- ⚠️ NULL 判断：只能用 IS NULL / IS NOT NULL
SELECT * FROM users WHERE deleted_at IS NULL;
-- WHERE deleted_at = NULL  -- ❌ 永远匹配不到任何行！`,
    },
    {
      id: 'mysql-like',
      title: { zh: 'LIKE 通配符与正则', en: 'LIKE Wildcards & REGEXP' },
      description: {
        zh: '% 匹配任意多个字符，_ 匹配单个字符。LIKE 走不了索引（前缀模糊时），大数据量要换全文索引或搜索引擎。',
        en: '% matches any run of characters, _ matches exactly one. LIKE can\'t use indexes with leading wildcards — use full-text index or a search engine at scale.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- %：任意个任意字符（含 0 个）
SELECT * FROM users WHERE username LIKE 'xiao%';   -- xiao 开头
SELECT * FROM users WHERE email LIKE '%@gmail.com'; -- gmail 结尾
SELECT * FROM users WHERE username LIKE '%ai%';    -- 包含 ai

-- _：恰好一个字符
SELECT * FROM users WHERE username LIKE 'xia_ma_'; -- 6 位、中间两空位

-- ⚠️ 性能陷阱：开头带 % 的模糊查询无法使用索引
-- username LIKE 'xiao%'   ✅ 可以走索引
-- username LIKE '%xiao%'  ❌ 全表扫描

-- 正则匹配（MySQL 8+）
SELECT * FROM users WHERE username REGEXP '^[a-z]+[0-9]{2,}$';
SELECT * FROM users WHERE email REGEXP '@(gmail|qq)\\.com$';`,
    },
  ],
};

/** 进阶查询（对应《MySQL 必知必会》第 10-16 章） */
export const mysqlAdvanced: GuideCategory = {
  id: 'mysql-advanced',
  title: { zh: '进阶查询', en: 'Advanced Queries' },
  topics: [
    {
      id: 'mysql-functions',
      title: { zh: '计算字段与处理函数', en: 'Computed Fields & Functions' },
      description: {
        zh: '拼接、算术、文本/日期/数值函数：SQL 不只能取数，还能在数据库侧完成加工，减少应用层搬运。',
        en: 'Concatenation, arithmetic, text/date/numeric functions: SQL can transform data in-database, reducing app-layer work.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 拼接字段 + 别名（AS）
SELECT CONCAT(username, ' <', email, '>') AS contact FROM users;

-- 算术计算：订单总价 = 单价 × 数量
SELECT order_no, price, quantity, price * quantity AS total
FROM order_items;

-- 文本函数
SELECT UPPER(username), LENGTH(email), LEFT(username, 4),
       TRIM('  xiao  '), SUBSTRING(email, 1, 5)
FROM users;

-- 日期函数（面试高频）
SELECT NOW(), CURDATE(), DATE_FORMAT(created_at, '%Y-%m-%d') AS day,
       DATEDIFF(NOW(), created_at) AS days_since_reg
FROM users;

-- 条件函数：把状态码翻译成人话
SELECT username,
       CASE status
         WHEN 1 THEN '正常'
         WHEN 0 THEN '禁用'
         ELSE '未知'
       END AS status_text
FROM users;`,
    },
    {
      id: 'mysql-group',
      title: { zh: '聚合与分组 GROUP BY', en: 'Aggregation & GROUP BY' },
      description: {
        zh: 'COUNT/AVG/SUM/MAX/MIN 五个聚合函数 + GROUP BY 分组 + HAVING 过滤分组，报表统计的核心套路。',
        en: 'COUNT/AVG/SUM/MAX/MIN plus GROUP BY and HAVING: the core recipe for reports and statistics.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 聚合函数：对一组行算出一个值
SELECT COUNT(*) AS user_count,        -- 总行数
       COUNT(email) AS has_email,     -- 非 NULL 的行数
       AVG(age) AS avg_age,
       MAX(balance) AS richest,
       MIN(created_at) AS first_reg
FROM users;

-- GROUP BY：每个状态各有多少人
SELECT status, COUNT(*) AS cnt
FROM users
GROUP BY status;

-- HAVING：过滤分组结果（WHERE 过滤行，HAVING 过滤组）
-- 找出"订单数超过 5 的用户"
SELECT user_id, COUNT(*) AS order_cnt
FROM orders
GROUP BY user_id
HAVING order_cnt > 5;

-- 完整子句顺序（背诵！）：
-- SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT
SELECT status, COUNT(*) AS cnt
FROM users
WHERE age >= 18
GROUP BY status
HAVING cnt > 10
ORDER BY cnt DESC
LIMIT 3;`,
    },
    {
      id: 'mysql-subquery',
      title: { zh: '子查询', en: 'Subqueries' },
      description: {
        zh: '把一条查询的结果嵌进另一条查询：过滤条件、计算字段都能用。读懂嵌套结构是看懂复杂 SQL 的第一步。',
        en: 'Embed one query\'s result inside another: in filters and computed columns alike. Reading nested structure is step one of complex SQL.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 子查询做过滤：查出下过订单的用户
SELECT username, email
FROM users
WHERE id IN (SELECT user_id FROM orders);

-- 子查询做计算字段：每个用户的订单总数
SELECT username,
       (SELECT COUNT(*)
        FROM orders
        WHERE orders.user_id = users.id) AS order_count
FROM users;

-- 子查询对比聚合值：余额高于平均值的用户
SELECT username, balance
FROM users
WHERE balance > (SELECT AVG(balance) FROM users);

-- 注意：IN 子查询在大表上可能慢，
-- 很多场景可以改写成 JOIN（见下一节）或 EXISTS：
SELECT username FROM users u
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);`,
    },
    {
      id: 'mysql-join',
      title: { zh: 'JOIN 联结表', en: 'JOINs' },
      description: {
        zh: '关系型数据库的灵魂：数据分散在多张表，JOIN 按需拼回。内联结取交集，左联结保左表，这是必须形成直觉的知识。',
        en: 'The soul of relational databases: data spread across tables, JOIN assembles it on demand. INNER takes the intersection, LEFT preserves the left table — build this intuition.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- INNER JOIN：两张表都匹配上的行（交集）
SELECT o.order_no, u.username, o.amount
FROM orders AS o
INNER JOIN users AS u ON o.user_id = u.id;

-- LEFT JOIN：左表全保留，右表没匹配补 NULL
-- 场景：所有用户及其订单数（含没下过单的）
SELECT u.username, COUNT(o.id) AS order_cnt
FROM users AS u
LEFT JOIN orders AS o ON o.user_id = u.id
GROUP BY u.id, u.username;

-- RIGHT JOIN 同理保右表（实际开发中 LEFT 更常用）

-- 多表联结：订单 + 用户 + 商品三表齐拼
SELECT o.order_no, u.username, p.name AS product, oi.quantity
FROM orders AS o
JOIN users AS u      ON o.user_id = u.id
JOIN order_items AS oi ON oi.order_id = o.id
JOIN products AS p   ON oi.product_id = p.id
WHERE o.status = 'PAID'
ORDER BY o.created_at DESC
LIMIT 20;

-- 性能要点：ON 条件的关联字段必须建索引！`,
    },
  ],
};

/** 写入与事务（对应《MySQL 必知必会》第 17-26 章精选） */
export const mysqlWrite: GuideCategory = {
  id: 'mysql-write',
  title: { zh: '增删改、事务与索引', en: 'Writes, Transactions & Indexes' },
  topics: [
    {
      id: 'mysql-insert',
      title: { zh: 'INSERT 插入数据', en: 'INSERT' },
      description: {
        zh: '单行、多行、从查询结果插入。自增主键不用管，时间默认值自动生成，插入后 LAST_INSERT_ID() 拿新 ID。',
        en: 'Single row, multi-row, insert from a query. Auto-increment keys and timestamp defaults handle themselves; LAST_INSERT_ID() returns the new ID.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 单行插入（推荐显式列名，不受表结构变更影响）
INSERT INTO users (username, email, age)
VALUES ('xiaomai', 'xiaomai@example.com', 28);

-- 一次插多行（比循环单插快得多）
INSERT INTO users (username, email, age) VALUES
  ('laoqi', 'laoqi@example.com', 31),
  ('aqiang', 'aqiang@example.com', 25);

-- 拿到刚插入的自增 ID
SELECT LAST_INSERT_ID();

-- 从另一个表/查询结果插入（数据迁移常用）
INSERT INTO user_backup (id, username, email)
SELECT id, username, email FROM users WHERE status = 0;

-- 主键/唯一键冲突时改为更新（UPSERT，幂等接口神器）
INSERT INTO users (id, username, email)
VALUES (10001, 'xiaomai', 'new@example.com')
ON DUPLICATE KEY UPDATE email = VALUES(email);`,
    },
    {
      id: 'mysql-update-delete',
      title: { zh: 'UPDATE 与 DELETE（高危操作）', en: 'UPDATE & DELETE (Handle with Care)' },
      description: {
        zh: '不带 WHERE 的 UPDATE/DELETE 会动全表！安全姿势：先 SELECT 同条件确认行数，开事务操作，线上数据先备份。',
        en: 'UPDATE/DELETE without WHERE touches every row! Safe routine: SELECT with the same condition first, operate in a transaction, back up production data.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 更新：永远带 WHERE！
UPDATE users
SET email = 'new@example.com', updated_at = NOW()
WHERE id = 10001;

-- 安全的操作流程：
-- 1. 先用同条件 SELECT 确认影响范围
SELECT * FROM users WHERE status = 0;
-- 2. 确认无误再执行
UPDATE users SET balance = 0 WHERE status = 0;

-- 删除（同样必须带 WHERE）
DELETE FROM users WHERE id = 10001;

-- 逻辑删除（企业主流）：不真删，打标记
UPDATE users SET deleted_at = NOW() WHERE id = 10001;
-- 查询时统一过滤：WHERE deleted_at IS NULL

-- 清空整表（谨慎！TRUNCATE 更快且不可回滚）
-- TRUNCATE TABLE logs;`,
    },
    {
      id: 'mysql-transaction',
      title: { zh: '事务：转账不能有中间态', en: 'Transactions' },
      description: {
        zh: '事务 = 一组 SQL 要么全成功要么全回滚。InnoDB 默认自动提交，START TRANSACTION 开启手动控制。ACID 四性是面试必考。',
        en: 'A transaction is a group of SQL that all succeeds or all rolls back. InnoDB autocommits by default; START TRANSACTION takes manual control. ACID is a classic interview topic.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 经典场景：A 给 B 转账 100 元，两步必须同生共死
START TRANSACTION;

UPDATE accounts SET balance = balance - 100 WHERE user_id = 'A';
-- 这里如果断电/报错，没有事务的话 A 的钱就凭空消失了
UPDATE accounts SET balance = balance + 100 WHERE user_id = 'B';

COMMIT;      -- 两步都成功：提交，永久生效
-- ROLLBACK; -- 任何一步出问题：全部撤销

-- 保存点：长事务里部分回滚
START TRANSACTION;
INSERT INTO orders (...) VALUES (...);
SAVEPOINT after_order;
INSERT INTO order_items (...) VALUES (...);
ROLLBACK TO after_order;   -- 只撤销 order_items，保留 orders
COMMIT;

-- ACID 速记：
--   原子性 Atomicity   全做或全不做
--   一致性 Consistency 约束始终成立
--   隔离性 Isolation   并发事务互不干扰（默认 RR 级别）
--   持久性 Durability  提交后断电不丢`,
    },
    {
      id: 'mysql-index',
      title: { zh: '索引与 EXPLAIN', en: 'Indexes & EXPLAIN' },
      description: {
        zh: '索引是查询性能的杠杆：给 WHERE/JOIN/ORDER BY 的列建索引，用 EXPLAIN 验证是否用上。最左前缀原则必须理解。',
        en: 'Indexes are the lever of query performance: index WHERE/JOIN/ORDER BY columns, verify with EXPLAIN. The leftmost-prefix rule is essential.',
      },
      lang: 'sql',
      langLabel: 'SQL',
      color: SQL_COLOR,
      code: `-- 建索引的三种姿势
CREATE INDEX idx_email ON users (email);
CREATE UNIQUE INDEX uk_username ON users (username);
ALTER TABLE orders ADD INDEX idx_user_status (user_id, status); -- 联合索引

-- 最左前缀原则（联合索引的灵魂）：
-- 索引 (user_id, status) 能加速：
--   WHERE user_id = 1                    ✅
--   WHERE user_id = 1 AND status = 2     ✅
-- 但不能加速：
--   WHERE status = 2                     ❌ 跳过了最左列

-- EXPLAIN：看 SQL 到底走没走索引
EXPLAIN SELECT * FROM users WHERE email = 'a@b.com';
-- 重点看三列：
--   type: ref/range ✅    ALL（全表扫描）❌
--   key:  实际用到的索引名（NULL = 没用索引）
--   rows: 预估扫描行数（越小越好）

-- 索引失效常见原因：
--   对列做函数/运算：WHERE DATE(created_at) = '2026-08-01' ❌
--   隐式类型转换：字符串列用数字查 ❌
--   LIKE '%x' 前缀模糊 ❌
--   OR 两侧有一侧无索引 ❌`,
    },
  ],
};

/** 五语言连接 MySQL 对照 */
export const mysqlCompare: Category = {
  id: 'mysql-compare',
  title: { zh: '五语言连接 MySQL 对照', en: 'MySQL in Five Languages' },
  topics: [
    {
      id: 'mysql-driver',
      title: { zh: '连接 MySQL 并查询用户表', en: 'Connect & Query the users Table' },
      description: {
        zh: '同一个需求五种姿势：连接池、参数化查询（防 SQL 注入）、结果映射。参数占位符风格各语言不同，注意区分。',
        en: 'One task, five ways: connection pooling, parameterized queries (SQL-injection defense), result mapping. Placeholder styles differ per language.',
      },
      snippets: {
        python: `# pip install pymysql
import pymysql

conn = pymysql.connect(
    host='127.0.0.1', port=3306,
    user='root', password='123456',
    database='shop', charset='utf8mb4',
)

# with 自动关闭游标和连接
with conn.cursor() as cur:
    # %s 是参数占位符（不是字符串格式化！防注入）
    cur.execute(
        'SELECT id, username, email FROM users WHERE age >= %s LIMIT %s',
        (18, 10),
    )
    for row in cur.fetchall():
        print(row)  # (10001, 'xiaomai', 'xiaomai@example.com')

conn.close()`,
        javascript: `// npm install mysql2
import mysql from 'mysql2/promise';

// 生产环境用连接池，不要每次新建连接
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '123456',
  database: 'shop',
  connectionLimit: 10,
});

// ? 是参数占位符，驱动自动转义防注入
const [rows] = await pool.execute(
  'SELECT id, username, email FROM users WHERE age >= ? LIMIT ?',
  [18, 10],
);
for (const row of rows) {
  console.log(row); // { id: 10001, username: 'xiaomai', ... }
}

await pool.end();`,
        java: `// Maven: mysql-connector-j + HikariCP（Spring Boot 默认连接池）
import java.sql.*;

String url = "jdbc:mysql://127.0.0.1:3306/shop?useSSL=false&serverTimezone=Asia/Shanghai";

// try-with-resources 自动关闭连接
try (Connection conn = DriverManager.getConnection(url, "root", "123456");
     // PreparedStatement 预编译 + ? 占位符，防注入
     PreparedStatement ps = conn.prepareStatement(
         "SELECT id, username, email FROM users WHERE age >= ? LIMIT ?")) {

    ps.setInt(1, 18);   // 占位符从 1 开始数！
    ps.setInt(2, 10);

    try (ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            System.out.println(rs.getLong("id") + " "
                + rs.getString("username") + " " + rs.getString("email"));
        }
    }
}`,
        go: `package main

// go get github.com/go-sql-driver/mysql
import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// DSN 格式：用户名:密码@tcp(主机:端口)/库名
	db, err := sql.Open("mysql",
		"root:123456@tcp(127.0.0.1:3306)/shop?charset=utf8mb4&parseTime=true")
	if err != nil {
		panic(err)
	}
	defer db.Close()
	db.SetMaxOpenConns(10) // sql.DB 自带连接池

	// ? 是参数占位符
	rows, err := db.Query(
		"SELECT id, username, email FROM users WHERE age >= ? LIMIT ?", 18, 10)
	if err != nil {
		panic(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int64
		var username, email string
		rows.Scan(&id, &username, &email) // Scan 必须传指针
		fmt.Println(id, username, email)
	}
}`,
        rust: `// Cargo.toml: sqlx = { features = ["runtime-tokio", "mysql"] }
use sqlx::mysql::MySqlPool;

#[derive(sqlx::FromRow, Debug)]
struct User {
    id: i64,
    username: String,
    email: String,
}

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    // 连接池
    let pool = MySqlPool::connect(
        "mysql://root:123456@127.0.0.1:3306/shop",
    )
    .await?;

    // ? 是参数占位符；query_as 自动映射到结构体
    let users: Vec<User> = sqlx::query_as::<_, User>(
        "SELECT id, username, email FROM users WHERE age >= ? LIMIT ?",
    )
    .bind(18) // bind 链式传参
    .bind(10)
    .fetch_all(&pool)
    .await?;

    for u in users {
        println!("{} {} {}", u.id, u.username, u.email);
    }
    Ok(())
}`,
      },
    },
  ],
};
