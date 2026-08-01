import type { Topic } from './types';

/**
 * 综合案例 B：领域建模与数据结构综合题
 */
export const capstonePartB: Topic[] = [
  {
    id: 'order-domain',
    title: { zh: '电商订单：状态机 + 金额计算', en: 'E-commerce Order: State Machine + Money' },
    description: {
      zh: '任务：订单含商品明细，状态按 待支付→已支付→已发货→已完成/已取消 流转，非法流转报错；VIP 打 9 折。融合：枚举、OOP、错误处理。重点看各语言怎么处理"钱"（浮点陷阱！）。',
      en: 'Task: orders with line items, state machine Pending→Paid→Shipped→Done/Cancelled with illegal-transition errors; VIP 10% off. Watch how each language handles money (float traps!).',
    },
    difficulty: 4,
    snippets: {
      python: `from enum import Enum, auto
from dataclasses import dataclass, field
from decimal import Decimal  # 钱用 Decimal，不用 float！


class OrderStatus(Enum):
    PENDING = auto()
    PAID = auto()
    SHIPPED = auto()
    DONE = auto()
    CANCELLED = auto()


# 状态机：当前状态 → 允许的目标状态集合
ALLOWED = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DONE},
    OrderStatus.DONE: set(),
    OrderStatus.CANCELLED: set(),  # 终态
}


@dataclass
class Item:
    name: str
    price: Decimal  # 单价（元）
    qty: int


@dataclass
class Order:
    items: list = field(default_factory=list)
    is_vip: bool = False
    status: OrderStatus = OrderStatus.PENDING

    def total(self) -> Decimal:
        amount = sum(i.price * i.qty for i in self.items)
        if self.is_vip:
            amount *= Decimal("0.9")  # 字符串构造，避免浮点污染
        return amount.quantize(Decimal("0.01"))  # 保留两位

    def transition(self, target: OrderStatus) -> None:
        if target not in ALLOWED[self.status]:
            raise ValueError(
                f"非法状态流转: {self.status.name} → {target.name}")
        self.status = target


# 使用
order = Order(
    items=[Item("键盘", Decimal("299"), 1), Item("鼠标", Decimal("99"), 2)],
    is_vip=True,
)
print(order.total())                 # 447.30
order.transition(OrderStatus.PAID)   # 合法
order.transition(OrderStatus.DONE)   # ValueError: 非法状态流转！`,
      javascript: `const STATUS = Object.freeze({
  PENDING: 'PENDING', PAID: 'PAID', SHIPPED: 'SHIPPED',
  DONE: 'DONE', CANCELLED: 'CANCELLED',
});

// 状态机表
const ALLOWED = {
  [STATUS.PENDING]: [STATUS.PAID, STATUS.CANCELLED],
  [STATUS.PAID]: [STATUS.SHIPPED, STATUS.CANCELLED],
  [STATUS.SHIPPED]: [STATUS.DONE],
  [STATUS.DONE]: [],
  [STATUS.CANCELLED]: [],  // 终态
};

class Order {
  #status = STATUS.PENDING;  // 私有字段保护状态

  constructor(items = [], isVip = false) {
    this.items = items;      // [{ name, priceCents, qty }]
    this.isVip = isVip;
  }

  get status() { return this.#status; }

  /** 金额用"分"（整数）计算，杜绝浮点误差 */
  totalCents() {
    const amount = this.items
      .reduce((sum, i) => sum + i.priceCents * i.qty, 0);
    return this.isVip ? Math.round(amount * 0.9) : amount;
  }

  totalYuan() {
    return (this.totalCents() / 100).toFixed(2);
  }

  transition(target) {
    if (!ALLOWED[this.#status].includes(target)) {
      throw new Error(\`非法状态流转: \${this.#status} → \${target}\`);
    }
    this.#status = target;
  }
}

const order = new Order(
  [{ name: '键盘', priceCents: 29900, qty: 1 },
   { name: '鼠标', priceCents: 9900, qty: 2 }],
  true,
);
console.log(order.totalYuan());        // 447.30
order.transition(STATUS.PAID);         // 合法
order.transition(STATUS.DONE);         // Error: 非法状态流转！`,
        java: `// 金额必须用 BigDecimal —— 真实项目的铁律
enum OrderStatus { PENDING, PAID, SHIPPED, DONE, CANCELLED }

class Item {
    final String name;
    final BigDecimal price;  // 单价（元）
    final int qty;
    Item(String name, BigDecimal price, int qty) {
        this.name = name; this.price = price; this.qty = qty;
    }
}

class Order {
    // 状态机表（EnumMap 是枚举 key 的最优容器）
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED =
        new EnumMap<>(OrderStatus.class);
    static {
        ALLOWED.put(OrderStatus.PENDING,
            EnumSet.of(OrderStatus.PAID, OrderStatus.CANCELLED));
        ALLOWED.put(OrderStatus.PAID,
            EnumSet.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED));
        ALLOWED.put(OrderStatus.SHIPPED, EnumSet.of(OrderStatus.DONE));
        ALLOWED.put(OrderStatus.DONE, EnumSet.noneOf(OrderStatus.class));
        ALLOWED.put(OrderStatus.CANCELLED, EnumSet.noneOf(OrderStatus.class));
    }

    private final List<Item> items;
    private final boolean vip;
    private OrderStatus status = OrderStatus.PENDING;

    Order(List<Item> items, boolean vip) {
        this.items = items; this.vip = vip;
    }

    BigDecimal total() {
        BigDecimal amount = items.stream()
            .map(i -> i.price.multiply(BigDecimal.valueOf(i.qty)))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (vip) amount = amount.multiply(new BigDecimal("0.9"));
        return amount.setScale(2, RoundingMode.HALF_UP);  // 两位小数
    }

    void transition(OrderStatus target) {
        if (!ALLOWED.get(status).contains(target)) {
            throw new IllegalStateException(
                "非法状态流转: " + status + " → " + target);
        }
        this.status = target;
    }
}`,
        go: `package main

import "fmt"

// iota 枚举 + 显式状态机表
type OrderStatus int

const (
    Pending OrderStatus = iota
    Paid
    Shipped
    Done
    Cancelled
)

var allowed = map[OrderStatus][]OrderStatus{
    Pending:   {Paid, Cancelled},
    Paid:      {Shipped, Cancelled},
    Shipped:   {Done},
    Done:      {},
    Cancelled: {},
}

type Item struct {
    Name       string
    PriceCents int64 // 金额用"分"存 int64，杜绝浮点误差
    Qty        int
}

type Order struct {
    Items  []Item
    IsVIP  bool
    Status OrderStatus
}

func (o *Order) TotalCents() int64 {
    var amount int64
    for _, it := range o.Items {
        amount += it.PriceCents * int64(it.Qty)
    }
    if o.IsVIP {
        amount = amount * 9 / 10
    }
    return amount
}

func (o *Order) TotalYuan() string {
    return fmt.Sprintf("%.2f", float64(o.TotalCents())/100)
}

// 错误即值：非法流转返回 error，调用方必须处理
func (o *Order) Transition(target OrderStatus) error {
    for _, s := range allowed[o.Status] {
        if s == target {
            o.Status = target
            return nil
        }
    }
    return fmt.Errorf("非法状态流转: %v → %v", o.Status, target)
}

func main() {
    order := &Order{
        Items: []Item{{"键盘", 29900, 1}, {"鼠标", 9900, 2}},
        IsVIP: true,
    }
    fmt.Println(order.TotalYuan())        // 447.30
    _ = order.Transition(Paid)            // 合法
    if err := order.Transition(Done); err != nil {
        fmt.Println(err)                  // 非法状态流转: 1 → 3
    }
}`,
        rust: `#[derive(Debug, Clone, Copy, PartialEq)]
enum OrderStatus { Pending, Paid, Shipped, Done, Cancelled }

impl OrderStatus {
    /// 状态机写进类型方法，match 穷尽检查防漏
    fn can_go(self, target: OrderStatus) -> bool {
        use OrderStatus::*;
        matches!(
            (self, target),
            (Pending, Paid) | (Pending, Cancelled)
                | (Paid, Shipped) | (Paid, Cancelled)
                | (Shipped, Done)
        )
    }
}

struct Item {
    #[allow(dead_code)]
    name: String,
    price_cents: u64,  // 金额用"分"存整数，无浮点误差
    qty: u32,
}

struct Order {
    items: Vec<Item>,
    is_vip: bool,
    status: OrderStatus,
}

impl Order {
    fn total_cents(&self) -> u64 {
        let amount: u64 = self.items
            .iter()
            .map(|i| i.price_cents * i.qty as u64)
            .sum();
        if self.is_vip { amount * 9 / 10 } else { amount }
    }

    fn total_yuan(&self) -> String {
        format!("{:.2}", self.total_cents() as f64 / 100.0)
    }

    /// 状态被 &mut self 保护，外部无法直接改写
    fn transition(&mut self, target: OrderStatus) -> Result<(), String> {
        if self.status.can_go(target) {
            self.status = target;
            Ok(())
        } else {
            Err(format!("非法状态流转: {:?} → {:?}", self.status, target))
        }
    }
}

fn main() {
    let mut order = Order {
        items: vec![
            Item { name: "键盘".into(), price_cents: 29900, qty: 1 },
            Item { name: "鼠标".into(), price_cents: 9900, qty: 2 },
        ],
        is_vip: true,
        status: OrderStatus::Pending,
    };
    println!("{}", order.total_yuan());        // 447.30
    order.transition(OrderStatus::Paid).unwrap();  // 合法
    println!("{:?}", order.transition(OrderStatus::Done)); // Err(...)
}`,
    },
  },
  {
    id: 'lru-cache',
    title: { zh: '泛型 LRU 缓存', en: 'Generic LRU Cache' },
    description: {
      zh: '任务：容量有限的缓存，get/put 都算"使用"，超容量淘汰最久未用项，要求 O(1)。融合：哈希表 + 双向链表的组合拳、泛型、OOP。各语言实现难度差异巨大，非常体现语言性格。',
      en: 'Task: bounded cache where get/put count as usage; evict least-recently-used beyond capacity, all O(1). Combines hash map + doubly-linked list, generics, OOP. Difficulty varies wildly by language.',
    },
    difficulty: 4,
    snippets: {
      python: `from collections import OrderedDict
from typing import Generic, TypeVar, Optional

K = TypeVar("K")
V = TypeVar("V")


class LRUCache(Generic[K, V]):
    """OrderedDict 自带双向链表，Python 实现最轻松"""

    def __init__(self, capacity: int):
        self._cap = capacity
        self._data: "OrderedDict[K, V]" = OrderedDict()

    def get(self, key: K) -> Optional[V]:
        if key not in self._data:
            return None
        self._data.move_to_end(key)  # 标记为最近使用
        return self._data[key]

    def put(self, key: K, value: V) -> None:
        if key in self._data:
            self._data.move_to_end(key)
        self._data[key] = value
        if len(self._data) > self._cap:
            self._data.popitem(last=False)  # 弹出最久未用


cache = LRUCache[str, int](capacity=2)
cache.put("a", 1)
cache.put("b", 2)
print(cache.get("a"))  # 1（a 变热）
cache.put("c", 3)      # 超容量，b 被淘汰
print(cache.get("b"))  # None
print(cache.get("a"))  # 1`,
      javascript: `class LRUCache {
  /** Map 天然保持插入序，删了重插 = 移到最新，无需手写链表 */

  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);   // 删除重插，刷新到最新位置
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.cap) {
      // 迭代器第一个 key 即最久未用
      this.map.delete(this.map.keys().next().value);
    }
  }
}

const cache = new LRUCache(2);
cache.put('a', 1);
cache.put('b', 2);
console.log(cache.get('a')); // 1（a 变热）
cache.put('c', 3);           // b 被淘汰
console.log(cache.get('b')); // undefined
console.log(cache.get('a')); // 1`,
        java: `import java.util.LinkedHashMap;
import java.util.Map;

// LinkedHashMap 原生支持访问序，是 Java 的隐藏王牌
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        // accessOrder = true：按"访问顺序"而非插入顺序排列
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        // 返回 true 时自动删除最老（最久未用）的条目
        return size() > capacity;
    }

    public static void main(String[] args) {
        LRUCache<String, Integer> cache = new LRUCache<>(2);
        cache.put("a", 1);
        cache.put("b", 2);
        cache.get("a");              // a 变热
        cache.put("c", 3);           // b 被淘汰
        System.out.println(cache.get("b")); // null
        System.out.println(cache.get("a")); // 1
    }
}`,
        go: `package main

import (
    "container/list"
    "fmt"
)

// 哈希表 + 双向链表的标准配方（Go 1.18+ 泛型版）
type entry[K comparable, V any] struct {
    key   K
    value V
}

type LRUCache[K comparable, V any] struct {
    cap  int
    ll   *list.List // 前热后冷
    data map[K]*list.Element
}

func NewLRUCache[K comparable, V any](capacity int) *LRUCache[K, V] {
    return &LRUCache[K, V]{
        cap:  capacity,
        ll:   list.New(),
        data: make(map[K]*list.Element),
    }
}

func (c *LRUCache[K, V]) Get(key K) (V, bool) {
    if el, ok := c.data[key]; ok {
        c.ll.MoveToFront(el) // 标记为最近使用
        return el.Value.(*entry[K, V]).value, true
    }
    var zero V
    return zero, false // Go 惯例：返回零值 + ok
}

func (c *LRUCache[K, V]) Put(key K, value V) {
    if el, ok := c.data[key]; ok {
        c.ll.MoveToFront(el)
        el.Value.(*entry[K, V]).value = value
        return
    }
    el := c.ll.PushFront(&entry[K, V]{key, value})
    c.data[key] = el
    if c.ll.Len() > c.cap {
        back := c.ll.Back() // 淘汰最久未用
        c.ll.Remove(back)
        delete(c.data, back.Value.(*entry[K, V]).key)
    }
}

func main() {
    cache := NewLRUCache[string, int](2)
    cache.Put("a", 1)
    cache.Put("b", 2)
    v, _ := cache.Get("a") // a 变热
    fmt.Println(v)         // 1
    cache.Put("c", 3)      // b 被淘汰
    _, ok := cache.Get("b")
    fmt.Println(ok) // false
}`,
        rust: `// 诚实的对照：手写 O(1) LRU 在 Rust 里最费劲
// （所有权 + 循环引用），生产项目直接用 lru crate:
//   let mut cache = LruCache::<String, i32>::new(NonZeroUsize::new(2).unwrap());
//   cache.put("a".into(), 1);
//   cache.get(&"a".to_string());

// 学习版：HashMap + 逻辑时钟（O(n) 淘汰，重点看所有权设计）
use std::collections::HashMap;
use std::hash::Hash;

struct LruCache<K, V> {
    cap: usize,
    tick: u64,                  // 逻辑时钟代替链表
    data: HashMap<K, (V, u64)>, // 值 + 最后访问时间
}

impl<K: Hash + Eq + Clone, V> LruCache<K, V> {
    fn new(cap: usize) -> Self {
        Self { cap, tick: 0, data: HashMap::new() }
    }

    fn get(&mut self, key: &K) -> Option<&V> {
        self.tick += 1;
        let tick = self.tick;
        // get_mut 拿到可变借用，刷新时间后转不可变返回
        self.data.get_mut(key).map(|(v, t)| {
            *t = tick;
            &*v
        })
    }

    fn put(&mut self, key: K, value: V) {
        self.tick += 1;
        self.data.insert(key.clone(), (value, self.tick));
        if self.data.len() > self.cap {
            let oldest = self.data.iter()
                .min_by_key(|(_, (_, t))| *t)   // 找最旧
                .map(|(k, _)| k.clone())        // clone 化解借用冲突
                .unwrap();
            self.data.remove(&oldest);
        }
    }
}

fn main() {
    let mut cache = LruCache::new(2);
    cache.put("a", 1);
    cache.put("b", 2);
    cache.get(&"a");    // a 变热
    cache.put("c", 3);  // b 被淘汰
    assert_eq!(cache.get(&"b"), None);
    assert_eq!(cache.get(&"a"), Some(&1));
}`,
    },
  },
];
