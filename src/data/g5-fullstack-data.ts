import type { Category } from './types';

export const fullstackData: Category = {
  id: 'fs-data',
  title: { zh: '数据层：表格背后那一次 IO', en: 'Data: the IO behind your table' },
  topics: [
    {
      id: 'fs-env',
      title: { zh: '配置与环境变量', en: 'Config and env vars' },
      description: {
        zh: '对应前端的 import.meta.env。端口、密钥、数据库地址不许写进代码。密钥不许进 git。',
        en: 'Same idea as import.meta.env. Ports, secrets, and DB URLs do not belong in source. Secrets do not belong in git.',
      },
      snippets: {
        python: `import os
PORT = int(os.getenv("PORT", "8011"))
DATABASE_URL = os.environ["DATABASE_URL"]          # 缺了直接炸，避免连错库
JWT_SECRET = os.environ["JWT_SECRET"]

# .env 用 python-dotenv 只给本地
# 生产用进程管理器或容器注入`,
        javascript: `const PORT = Number(process.env.PORT || 8012);
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL required');

// Node 18+ 可用 --env-file=.env
// 不要把 .env 提交进仓库，只提交 .env.example`,
        java: `// application.properties
# server.port=\${PORT:8015}
# spring.datasource.url=\${DATABASE_URL}
# jwt.secret=\${JWT_SECRET}

@Value("\${jwt.secret}")
private String jwtSecret;

// 本地 application-local.properties 加入 .gitignore`,
        go: `port := os.Getenv("PORT")
if port == "" { port = "8013" }
dsn := os.Getenv("DATABASE_URL")
if dsn == "" { log.Fatal("DATABASE_URL required") }

// 第三方：github.com/joho/godotenv 仅本地`,
        rust: `let port = std::env::var("PORT").unwrap_or_else(|_| "8014".into());
let dsn = std::env::var("DATABASE_URL").expect("DATABASE_URL required");

// dotenvy::dotenv().ok();  // 本地可选`,
      },
    },
    {
      id: 'fs-memory-crud',
      title: { zh: '内存 CRUD：先跑通再换库', en: 'In-memory CRUD: run first, then swap the store' },
      description: {
        zh: '实验室 Todo 就是这一套。接口契约先稳定，存储从数组换成 SQL 时 Handler 可以不动。',
        en: 'The Todo lab is this pattern. Freeze the HTTP contract first. Swapping an array for SQL should not rewrite handlers.',
      },
      snippets: {
        python: `from itertools import count
todos, ids = [], count(1)

def list_todos():
    return {"items": todos}

def create(title: str):
    item = {"id": next(ids), "title": title, "done": False}
    todos.append(item)
    return item

def patch(id: int, done: bool | None, title: str | None):
    item = next((t for t in todos if t["id"] == id), None)
    if not item: return None
    if done is not None: item["done"] = done
    if title is not None: item["title"] = title
    return item

def delete(id: int) -> bool:
    before = len(todos)
    todos[:] = [t for t in todos if t["id"] != id]
    return len(todos) < before`,
        javascript: `let seq = 1;
const todos = [];

const store = {
  list: () => ({ items: todos }),
  create: (title) => {
    const item = { id: seq++, title, done: false };
    todos.push(item);
    return item;
  },
  patch: (id, patch) => {
    const item = todos.find((t) => t.id === id);
    if (!item) return null;
    Object.assign(item, patch);
    return item;
  },
  remove: (id) => {
    const i = todos.findIndex((t) => t.id === id);
    if (i < 0) return false;
    todos.splice(i, 1);
    return true;
  },
};`,
        java: `private final Map<Long, Todo> store = new ConcurrentHashMap<>();
private final AtomicLong seq = new AtomicLong(1);

public List<Todo> list() { return new ArrayList<>(store.values()); }

public Todo create(String title) {
    long id = seq.getAndIncrement();
    Todo t = new Todo(id, title, false);
    store.put(id, t);
    return t;
}

public Todo patch(long id, Boolean done, String title) {
    Todo t = store.get(id);
    if (t == null) return null;
    if (done != null) t.setDone(done);
    if (title != null) t.setTitle(title);
    return t;
}

public boolean delete(long id) { return store.remove(id) != null; }`,
        go: `var (
    mu    sync.Mutex
    seq   int64 = 1
    todos        = map[int64]Todo{}
)

func create(title string) Todo {
    mu.Lock(); defer mu.Unlock()
    id := seq; seq++
    t := Todo{ID: id, Title: title, Done: false}
    todos[id] = t
    return t
}

// 多 goroutine 共享 map 必须加锁，这是 Go 版的「前端单例 store」`,
        rust: `struct App { inner: Mutex<Inner> }
struct Inner { seq: u64, todos: HashMap<u64, Todo> }

impl App {
    fn create(&self, title: String) -> Todo {
        let mut g = self.inner.lock().unwrap();
        g.seq += 1;
        let t = Todo { id: g.seq, title, done: false };
        g.todos.insert(t.id, t.clone());
        t
    }
}

// Handler 只调 App 方法。换 sqlx 时改 App，不改路由。`,
      },
    },
    {
      id: 'fs-sql-crud',
      title: { zh: 'SQL CRUD：同一契约换持久化', en: 'SQL CRUD: same contract, real persistence' },
      description: {
        zh: '前端表格不关心你用数组还是 MySQL。换库只换 store，响应字段保持 id/title/done。',
        en: 'The table does not care if you used an array or MySQL. Swap the store. Keep id/title/done.',
      },
      snippets: {
        python: `# FastAPI + SQLAlchemy 2.x
class Todo(Base):
    __tablename__ = "todos"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    done: Mapped[bool] = mapped_column(default=False)

def list_todos(db: Session):
    rows = db.scalars(select(Todo).order_by(Todo.id.desc())).all()
    return {"items": rows}

def create(db: Session, title: str):
    row = Todo(title=title)
    db.add(row); db.commit(); db.refresh(row)
    return row`,
        javascript: `// pg 或 Prisma。Handler 仍然返回 {items}
const { rows } = await pool.query(
  'SELECT id, title, done FROM todos ORDER BY id DESC'
);
res.json({ items: rows });

const inserted = await pool.query(
  'INSERT INTO todos(title, done) VALUES ($1, false) RETURNING *',
  [title]
);
res.status(201).json(inserted.rows[0]);`,
        java: `public interface TodoMapper {
    @Select("SELECT id, title, done FROM todos ORDER BY id DESC")
    List<Todo> list();

    @Insert("INSERT INTO todos(title, done) VALUES(#{title}, 0)")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Todo todo);
}

@Service
public class TodoService {
    public List<Todo> list() { return mapper.list(); }
}`,
        go: `type Todo struct {
    ID    int64  \`db:"id" json:"id"\`
    Title string \`db:"title" json:"title"\`
    Done  bool   \`db:"done" json:"done"\`
}

func list(db *sqlx.DB) ([]Todo, error) {
    var rows []Todo
    err := db.Select(&rows, "SELECT id, title, done FROM todos ORDER BY id DESC")
    return rows, err
}`,
        rust: `let items = sqlx::query_as!(Todo, "SELECT id, title, done FROM todos ORDER BY id DESC")
    .fetch_all(&pool)
    .await?;
Json(json!({ "items": items }))

sqlx::query_as!(Todo,
    "INSERT INTO todos (title, done) VALUES ($1, false) RETURNING id, title, done",
    title)
    .fetch_one(&pool).await?`,
      },
    },
    {
      id: 'fs-tx',
      title: { zh: '事务：提交失败要整笔回滚', en: 'Transactions: roll back the whole write' },
      description: {
        zh: '对应前端「提交失败表单不该半更新」。跨两张表的写必须同一事务，否则刷新会看到半成品。',
        en: 'Same idea as a failed submit that must not half-update the form. Writes across two tables share one transaction, or a refresh shows a half-finished row.',
      },
      snippets: {
        python: `def transfer(db: Session, from_id: int, to_id: int, amount: int):
    try:
        a = db.get(Account, from_id)
        b = db.get(Account, to_id)
        a.balance -= amount
        b.balance += amount
        db.add(Ledger(from_id=from_id, to_id=to_id, amount=amount))
        db.commit()
    except Exception:
        db.rollback()
        raise`,
        javascript: `const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id=$2', [amount, fromId]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id=$2', [amount, toId]);
  await client.query('INSERT INTO ledger(from_id,to_id,amount) VALUES ($1,$2,$3)', [fromId, toId, amount]);
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}`,
        java: `@Transactional
public void transfer(long fromId, long toId, long amount) {
    accountMapper.debit(fromId, amount);
    accountMapper.credit(toId, amount);
    ledgerMapper.insert(fromId, toId, amount);
    // 抛异常即回滚。不要在这里吃掉异常再 return 成功。
}`,
        go: `tx, err := db.Beginx()
if err != nil { return err }
defer tx.Rollback() // commit 成功后 Rollback 是 no-op

if _, err = tx.Exec("UPDATE accounts SET balance=balance-? WHERE id=?", amount, fromID); err != nil { return err }
if _, err = tx.Exec("UPDATE accounts SET balance=balance+? WHERE id=?", amount, toID); err != nil { return err }
if _, err = tx.Exec("INSERT INTO ledger(from_id,to_id,amount) VALUES (?,?,?)", fromID, toID, amount); err != nil { return err }
return tx.Commit()`,
        rust: `let mut tx = pool.begin().await?;
sqlx::query("UPDATE accounts SET balance = balance - $1 WHERE id = $2")
    .bind(amount).bind(from_id).execute(&mut *tx).await?;
sqlx::query("UPDATE accounts SET balance = balance + $1 WHERE id = $2")
    .bind(amount).bind(to_id).execute(&mut *tx).await?;
tx.commit().await?; // 出错不 commit，连接回收时回滚`,
      },
    },
    {
      id: 'fs-redis',
      title: { zh: 'Redis 缓存：别每次都打库', en: 'Redis: stop hitting the DB every time' },
      description: {
        zh: '对应前端 SWR：热点读走缓存，写时删缓存。缓存可以丢，数据库才是真相。',
        en: 'Same idea as SWR: hot reads hit cache, writes invalidate. Cache is disposable. The database is source of truth.',
      },
      snippets: {
        python: `def list_todos():
    cached = r.get("todos:all")
    if cached:
        return json.loads(cached)
    rows = db.query(Todo).all()
    payload = {"items": [t.asdict() for t in rows]}
    r.setex("todos:all", 30, json.dumps(payload))  # 30 秒
    return payload

def create(title: str):
    row = save(title)
    r.delete("todos:all")  # 写后删，下一次读回源
    return row`,
        javascript: `async function listTodos() {
  const hit = await redis.get('todos:all');
  if (hit) return JSON.parse(hit);
  const items = await db.list();
  const payload = { items };
  await redis.set('todos:all', JSON.stringify(payload), 'EX', 30);
  return payload;
}

async function create(title) {
  const row = await db.create(title);
  await redis.del('todos:all');
  return row;
}`,
        java: `@Cacheable(value = "todos", key = "'all'")
public List<Todo> list() { return mapper.list(); }

@CacheEvict(value = "todos", allEntries = true)
public Todo create(String title) { return mapper.insert(title); }

// 或 RedisTemplate.opsForValue().set("todos:all", json, 30, SECONDS)`,
        go: `func list(rdb *redis.Client, db *sqlx.DB) (any, error) {
    if s, err := rdb.Get(ctx, "todos:all").Result(); err == nil {
        var payload any
        json.Unmarshal([]byte(s), &payload)
        return payload, nil
    }
    rows, err := queryTodos(db)
    b, _ := json.Marshal(gin.H{"items": rows})
    rdb.Set(ctx, "todos:all", b, 30*time.Second)
    return gin.H{"items": rows}, err
}`,
        rust: `if let Ok(Some(hit)) = redis.get::<_, Option<String>>("todos:all").await {
    return Json(serde_json::from_str(&hit)?);
}
let items = sqlx::query_as!(Todo, "SELECT id,title,done FROM todos").fetch_all(&pool).await?;
let payload = json!({ "items": items });
let _: () = redis.set_ex("todos:all", payload.to_string(), 30).await?;
Json(payload)`,
      },
    },
  ],
};
