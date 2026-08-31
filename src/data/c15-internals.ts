import type { Category } from './types';

/** 红宝书视角：变量/类型/作用域/内存等语言内核机制的跨语言对照 */
export const internals: Category = {
  id: 'internals',
  title: { zh: '语言内核（红宝书视角）', en: 'Language Internals' },
  topics: [
    {
      id: 'internals-operators',
      title: { zh: '运算符全家福', en: 'The Full Operator Set' },
      description: {
        zh: '算术、位、逻辑、三元/空合并：五种语言的除法行为、短路求值和"0 是假值"陷阱各不相同。',
        en: 'Arithmetic, bitwise, logical, ternary/null-coalescing: division behavior, short-circuiting and falsy-zero traps differ per language.',
      },
      snippets: {
        python: `a, b = 7, 2
print(a + b, a - b, a * b, a / b)   # 9 5 14 3.5 —— / 总是得浮点
print(a // b, a % b, a ** b)        # 3 1 49：整除、取余、幂

# 位运算（按二进制位操作）
x = 0b1100   # 12
y = 0b1010   # 10
print(x & y, x | y, x ^ y, ~x, x << 1, x >> 1)  # 8 14 6 -13 24 6

# 逻辑运算：返回操作数本身，支持链式比较
ok = (a > 0) and (b > 0)
name = '' or '匿名'        # 短路求值 → '匿名'
print(1 < a < 10)         # True，链式比较是 Python 特产

# 海象运算符（3.8+）：赋值即判断
if (n := len('hello')) > 3:
    print(f'长度 {n}')     # 长度 5`,
        javascript: `const a = 7, b = 2;
console.log(a + b, a / b);                 // 9 3.5 —— JS 没有整除运算符
console.log(Math.floor(a / b), a % b, a ** b); // 3 1 49

// 位运算：操作数会先转成 32 位整数
const x = 0b1100, y = 0b1010;
console.log(x & y, x | y, x ^ y, ~x, x << 1, x >>> 1); // 8 14 6 -13 24 6

// || 和 ?? 的关键区别（高频坑）
const name1 = '' || '匿名';   // '匿名'：|| 遇任何假值都回退
const name2 = '' ?? '匿名';   // ''：?? 只在 null/undefined 时回退
const port = 0 || 8080;       // 8080（坑！0 是假值）
const port2 = 0 ?? 8080;      // 0（正确写法）

// 可选链 + 三元
const user = null;
console.log(user?.name ?? '游客');  // 游客
console.log(a > 5 ? '大' : '小');   // 大`,
        java: `int a = 7, b = 2;
System.out.println(a + b);          // 9
System.out.println(a / b);          // 3：int/int 直接整除
System.out.println(a / (double) b); // 3.5：先转型再除
System.out.println(a % b);          // 1
System.out.println(Math.pow(a, b)); // 49.0

// 位运算
int x = 0b1100, y = 0b1010;
System.out.println((x & y) + " " + (x | y) + " " + (x ^ y)); // 8 14 6
System.out.println(x << 1);   // 24
System.out.println(x >>> 1);  // 6：无符号右移

// 逻辑运算 && 和 || 都短路
boolean ok = a > 0 && b > 0;

// 三元表达式是 Java 主要的"表达式级"选择
String name = null;
String display = (name != null && !name.isEmpty()) ? name : "匿名";
System.out.println(ok + " " + display); // true 匿名`,
        go: `package main

import "fmt"

func main() {
	a, b := 7, 2
	fmt.Println(a+b, a/b, a%b)           // 9 3 1：int/int 整除
	fmt.Println(float64(a) / float64(b)) // 3.5：显式转换

	// 位运算
	x, y := 0b1100, 0b1010
	fmt.Println(x&y, x|y, x^y, x&^y) // 8 14 6 4：&^ 是按位清除
	fmt.Println(x<<1, x>>1)          // 24 6

	// 逻辑运算 && || 短路；Go 没有三元运算符
	ok := a > 0 && b > 0

	// 用 if 短语句代替三元
	display := "匿名"
	if name := ""; name != "" {
		display = name
	}
	fmt.Println(ok, display) // true 匿名
}`,
        rust: `fn main() {
    let a = 7;
    let b = 2;
    println!("{} {} {}", a + b, a / b, a % b); // 9 3 1：i32 整除
    println!("{}", a as f64 / b as f64);       // 3.5

    // 位运算
    let x = 0b1100;
    let y = 0b1010;
    println!("{} {} {} {}", x & y, x | y, x ^ y, !x); // 8 14 6 -13
    println!("{} {}", x << 1, x >> 1);                // 24 6

    // if 是表达式，可当三元用
    let name = "";
    let display = if name.is_empty() { "匿名" } else { name };

    // Option 的 unwrap_or 类似空合并
    let nick: Option<&str> = None;
    println!("{} {}", display, nick.unwrap_or("游客")); // 匿名 游客
}`,
      },
    },
    {
      id: 'internals-equality',
      title: { zh: '类型转换与相等判断', en: 'Type Conversion & Equality' },
      description: {
        zh: '== 比值还是比地址？隐式转换有多危险？这是五种语言面试和日常踩坑的重灾区。',
        en: 'Does == compare values or addresses? How dangerous is implicit conversion? A classic interview and bug hotspot.',
      },
      snippets: {
        python: `# 显式转换：一切靠构造函数
print(int('42'), float('3.14'), str(99))  # 42 3.14 '99'
print(int(3.99))        # 3：直接截断，不是四舍五入
print(bool(''), bool(0), bool([]))        # False False False：空即假
print(list('abc'))      # ['a', 'b', 'c']

# == 比值，is 比身份（是否同一对象）
a = [1, 2]
b = [1, 2]
print(a == b)   # True：内容相同
print(a is b)   # False：两个不同对象
c = a
print(c is a)   # True：同一个对象

# 小整数会被缓存，is 结果不可依赖：
x, y = 100, 100
print(x is y)   # True（缓存）——永远用 == 比值，别用 is`,
        javascript: `// == 会隐式转换，=== 严格比较 —— 永远用 ===
console.log(1 == '1');          // true（坑）
console.log(1 === '1');         // false
console.log(null == undefined); // true（唯一的"合理"例外）
console.log(NaN === NaN);       // false！用 Number.isNaN()

// 显式转换
console.log(Number('42'), String(99), Boolean(0)); // 42 '99' false
console.log(parseInt('42px'), parseFloat('3.14')); // 42 3.14

// 隐式转换的经典坑
console.log('5' + 3);     // '53'：+ 遇字符串变拼接
console.log('5' - 3);     // 2：- 只做数学
console.log(typeof null); // 'object'（历史 bug，记住即可）

// 对象比引用
const a = [1, 2], b = [1, 2];
console.log(a === b); // false：内容相同也不是同一个引用
console.log(JSON.stringify(a) === JSON.stringify(b)); // true：深比较土办法`,
        java: `// 基本类型 == 比值；引用类型 == 比地址！
String a = new String("hello");
String b = new String("hello");
System.out.println(a == b);      // false：两个对象
System.out.println(a.equals(b)); // true：内容相等 ← 字符串永远用 equals

// 字面量进常量池，所以下面反而是 true（别依赖）
String c = "hello", d = "hello";
System.out.println(c == d); // true（常量池复用）

// 装箱拆箱：Integer 缓存 -128~127
Integer x = 127, y = 127;
Integer m = 128, n = 128;
System.out.println(x == y); // true（缓存）
System.out.println(m == n); // false（超范围新对象）→ 用 equals

// 显式转换
int i = Integer.parseInt("42");
double dd = Double.parseDouble("3.14");
System.out.println(i + " " + dd + " " + String.valueOf(99));`,
        go: `package main

import (
	"fmt"
	"strconv"
)

func main() {
	// 没有隐式转换，一切显式
	var i int = 42
	f := float64(i)              // int → float64
	s := fmt.Sprintf("%d", i)    // 数字 → 字符串
	fmt.Println(f, s)

	// 字符串 ↔ 数字用 strconv
	n, err := strconv.Atoi("42") // 返回 (值, 错误)
	fmt.Println(n, err)          // 42 <nil>
	fmt.Println(strconv.Itoa(42)) // "42"

	// == 比值（可比较类型）；切片/映射/函数不可比
	a := [2]int{1, 2}
	b := [2]int{1, 2}
	fmt.Println(a == b) // true：数组是值类型，逐元素比

	// 切片用 slices.Equal（Go 1.21+）或 reflect.DeepEqual
	s1 := []int{1, 2}
	s2 := []int{1, 2}
	fmt.Println(slices.Equal(s1, s2)) // true
}`,
        rust: `fn main() {
    // 没有隐式转换，as 做基本类型强转
    let i: i32 = 42;
    let f = i as f64;
    println!("{}", f / 2.0); // 21

    // 字符串 ↔ 数字：parse + to_string
    let n: i32 = "42".parse().unwrap();
    let s = n.to_string();
    println!("{} {}", n, s);

    // == 调 PartialEq 比值；ptr::eq 比地址
    let a = vec![1, 2];
    let b = vec![1, 2];
    println!("{}", a == b); // true：Vec 逐元素比较
    let c = &a;
    println!("{}", std::ptr::eq(c, &a)); // true：同一引用

    // 自定义类型 derive 即可获得相等比较
    #[derive(PartialEq, Debug)]
    struct Point { x: i32, y: i32 }
    println!("{}", Point { x: 1, y: 2 } == Point { x: 1, y: 2 }); // true
}`,
      },
    },
    {
      id: 'internals-copy',
      title: { zh: '值与引用：深浅拷贝', en: 'Value vs Reference: Shallow & Deep Copy' },
      description: {
        zh: '赋值之后改一个会不会影响另一个？五种语言的答案完全不同，Rust 干脆在编译期杜绝这类坑。',
        en: 'After assignment, does mutating one affect the other? Five languages give five answers; Rust eliminates the trap at compile time.',
      },
      snippets: {
        python: `import copy

# 赋值 = 贴标签，两个名字指向同一对象
a = [1, [2, 3]]
b = a            # b 和 a 是同一个列表！
b[0] = 99
print(a)         # [99, [2, 3]] —— a 也被改了

# 浅拷贝：只复制最外层
c = a.copy()     # 或 copy.copy(a)、a[:]
c[0] = 1
c[1][0] = 88
print(a)         # [99, [88, 3]] —— 内层列表仍然共享！

# 深拷贝：递归复制所有层级
d = copy.deepcopy(a)
d[1][0] = 2
print(a)         # [99, [88, 3]] —— 互不影响`,
        javascript: `// 赋值复制的是引用
const a = { n: 1, list: [2, 3] };
const b = a;
b.n = 99;
console.log(a.n); // 99 —— 同一个对象

// 浅拷贝：展开运算符 / Object.assign
const c = { ...a };
c.n = 1;
c.list.push(4);
console.log(a.list); // [2, 3, 4] —— 嵌套结构仍共享

// 深拷贝：structuredClone（Node 17+，推荐）
const d = structuredClone(a);
d.list.push(5);
console.log(a.list); // [2, 3, 4] 不受影响

// 老办法：JSON 往返（会丢函数/undefined，Date 变字符串）
const e = JSON.parse(JSON.stringify(a));`,
        java: `// 基本类型赋值复制值；对象赋值复制引用
int x = 1;
int y = x;
y = 99;
System.out.println(x); // 1 —— 基本类型互不影响

int[] a = {1, 2, 3};
int[] b = a;      // 同一数组
b[0] = 99;
System.out.println(a[0]); // 99

// 浅拷贝：clone() / Arrays.copyOf
int[] c = a.clone();
c[0] = 1;
System.out.println(a[0]); // 99 —— 一维数组没问题

// 多维数组 clone 是浅拷贝，内层仍共享
int[][] m = {{1, 2}, {3, 4}};
int[][] n = m.clone();
n[0][0] = 99;
System.out.println(m[0][0]); // 99！

// 深拷贝：手动逐层复制（或序列化工具）
int[][] deep = new int[m.length][];
for (int i = 0; i < m.length; i++) deep[i] = m[i].clone();`,
        go: `package main

import "fmt"

func main() {
	// 数组是值类型：赋值即完整复制
	a := [3]int{1, 2, 3}
	b := a
	b[0] = 99
	fmt.Println(a[0]) // 1 —— 数组天然"深拷贝"

	// 切片是引用：共享底层数组
	s1 := []int{1, 2, 3}
	s2 := s1
	s2[0] = 99
	fmt.Println(s1[0]) // 99 —— 同一个底层数组！

	// 显式复制切片：copy 到新切片
	s3 := make([]int, len(s1))
	copy(s3, s1)
	s3[0] = 1
	fmt.Println(s1[0]) // 99 不受影响

	// map 同理是引用，没有 copy，需遍历手动复制
	m1 := map[string]int{"a": 1}
	m2 := m1
	m2["a"] = 99
	fmt.Println(m1["a"]) // 99
}`,
        rust: `fn main() {
    // 实现了 Copy 的类型（i32 等）：赋值即复制
    let x = 1;
    let y = x;
    println!("{} {}", x, y); // 都能用

    // 堆上类型（String/Vec）：赋值是移动，原变量失效
    let a = String::from("hello");
    let b = a;
    // println!("{}", a); // ❌ 编译错误：a 已被移动走
    println!("{}", b);

    // 想要两份？显式 clone（深拷贝）
    let v1 = vec![vec![1, 2], vec![3]];
    let v2 = v1.clone();      // 嵌套 Vec 也会被递归克隆
    let v3 = &v1;             // 借用：不复制、不夺走所有权
    println!("{} {} {}", v1[0][0], v2[0][0], v3[0][0]);

    // 编译器在编译期就杜绝了"浅拷贝踩坑"
}`,
      },
    },
    {
      id: 'internals-scope',
      title: { zh: '作用域与内存管理', en: 'Scope & Memory Management' },
      description: {
        zh: '变量在哪可见、何时被回收：var 提升与暂时性死区、引用计数、分代 GC、逃逸分析、所有权 Drop。',
        en: 'Where variables live and when they are reclaimed: hoisting & TDZ, refcounting, generational GC, escape analysis, ownership Drop.',
      },
      snippets: {
        python: `x = '全局'

def demo():
    # print(x)    # ❌ UnboundLocalError：函数内一旦赋值就是局部变量
    x = '局部'
    print(x)

demo()            # 局部
print(x)          # 全局 —— 函数内赋值不影响外部

# 想改全局？显式声明（不推荐滥用）
count = 0
def bump():
    global count
    count += 1

# 可变对象不用 global 也能改内容
items = []
def add():
    items.append(1)   # 合法：改内容，不是重新绑定

# 内存：引用计数 + 循环 GC，一般不用操心
import sys
lst = []
print(sys.getrefcount(lst))  # 引用计数（含临时引用，≥2）`,
        javascript: `// var 函数作用域 + 提升；let/const 块级作用域 —— 红宝书重点
function demo() {
  console.log(a);   // undefined：var 声明被提升，赋值没有
  var a = 1;
  // console.log(b); // ❌ ReferenceError：let 有暂时性死区
  let b = 2;
  if (true) {
    var c = 3;      // var 无视块
    let d = 4;      // let 只在块内
  }
  console.log(c);   // 3
  // console.log(d); // ❌ d is not defined
}

// 闭包：函数记住出生时的作用域
function counter() {
  let n = 0;
  return () => ++n;
}
const next = counter();
console.log(next(), next(), next()); // 1 2 3

// 内存：标记清除 GC 自动回收；解除引用帮助回收
let big = new Array(1e6);
big = null; // 变成不可达 → 等待 GC`,
        java: `// Java 有块级作用域，没有变量提升
{
    int x = 1;
    System.out.println(x);
}
// System.out.println(x); // ❌ 编译错误：x 已出作用域

// 局部变量必须初始化后才能用（编译器强制）
int n;
// System.out.println(n); // ❌ 编译错误：可能未初始化
n = 10;
System.out.println(n);

// 内存：JVM 分代 GC（新生代/老年代）
// 可达性分析：从 GC Roots 出发找不到的对象被回收
byte[] big = new byte[10_000_000];
big = null;   // 断开引用，等待 GC
System.gc();  // 只是建议，不保证立即执行

// 常见内存泄漏：静态集合只增不减、监听器忘了注销`,
        go: `package main

import (
	"fmt"
	"runtime"
)

func main() {
	x := "外层"
	{
		x := "内层" // 新变量遮蔽（shadow）外层
		fmt.Println(x) // 内层
	}
	fmt.Println(x) // 外层 —— 块内赋值不影响

	// if/for 的短语句变量只在语句内有效
	if n := len("hello"); n > 3 {
		fmt.Println(n) // 5
	}
	// fmt.Println(n) // ❌ undefined: n

	// 内存：三色标记 GC 自动回收
	// 逃逸分析决定变量在栈还是堆上，一般无需干预
	runtime.GC() // 手动触发（仅调试用）
	fmt.Println("done")
}`,
        rust: `fn main() {
    let x = "外层";
    {
        let x = "内层"; // 遮蔽（shadowing）：合法且常用
        println!("{}", x);
    }
    println!("{}", x); // 外层

    // 所有权 = 编译期的内存管理：离开作用域自动 Drop
    {
        let s = String::from("堆上字符串");
        println!("{}", s);
    } // s 在这里被自动释放，没有 GC 也没有泄漏

    // 借用规则：可同时多个 &T，或唯一 &mut T
    let mut v = vec![1, 2, 3];
    let r = &v;       // 不可变借用
    // let m = &mut v; // ❌ 编译错误：已有不可变借用
    println!("{}", r[0]);
    let m = &mut v;   // ✅ r 已不再使用（NLL 非词法生命周期）
    m.push(4);
    println!("{}", v.len()); // 4
}`,
      },
    },
    {
      id: 'internals-iterator',
      title: { zh: '迭代器与生成器', en: 'Iterators & Generators' },
      description: {
        zh: '惰性求值统一处理有限/无限序列：yield、function*、Stream、channel、Iterator 适配器链。',
        en: 'Lazy evaluation for finite and infinite sequences: yield, function*, Stream, channel, Iterator adapter chains.',
      },
      snippets: {
        python: `# 可迭代对象 → iter() 拿迭代器 → next() 逐个取
nums = [1, 2, 3]
it = iter(nums)
print(next(it), next(it))   # 1 2
# 取尽后 next() 抛 StopIteration —— for 循环靠它收尾

# 生成器函数：yield 产出值，暂停并记住现场
def countdown(n):
    while n > 0:
        yield n
        n -= 1

for x in countdown(3):
    print(x, end=' ')       # 3 2 1
print()

# 生成器表达式：惰性求值，省内存
squares = (x * x for x in range(10**8))  # 不立即计算
print(next(squares), next(squares))      # 0 1

# 迭代器工具链
from itertools import islice, chain
print(list(islice(chain([1, 2], [3, 4]), 3)))  # [1, 2, 3]`,
        javascript: `// 迭代器协议：对象实现 [Symbol.iterator]() 返回 { next() }
const it = [1, 2, 3][Symbol.iterator]();
console.log(it.next()); // { value: 1, done: false }

// 生成器函数：function* + yield
function* countdown(n) {
  while (n > 0) yield n--;
}
console.log([...countdown(3)]); // [3, 2, 1]

// 生成器是惰性的：可以表示无限序列
function* fib() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}
const f = fib();
console.log([f.next().value, f.next().value, f.next().value]); // 0 1 1

// 惰性 + take：只取前 5 个
const take = (gen, n) => Array.from({ length: n }, () => gen.next().value);
console.log(take(fib(), 5)); // [0, 1, 1, 2, 3]`,
        java: `import java.util.*;
import java.util.stream.*;

// Iterator：集合的统一遍历接口
List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c"));
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.equals("b")) it.remove(); // 遍历时安全删除的唯一姿势
}
System.out.println(list); // [a, c]

// for-each 语法糖底层就是 Iterator
for (String s : list) System.out.println(s);

// Stream 是"声明式迭代器"：惰性中间操作 + 终止操作
List<Integer> nums = Arrays.asList(1, 2, 3, 4, 5, 6);
List<Integer> result = nums.stream()
        .filter(n -> n % 2 == 0)   // 惰性：此时不执行
        .map(n -> n * 10)
        .collect(Collectors.toList()); // 终止操作触发计算
System.out.println(result); // [20, 40, 60]

// 无限流 + limit：类似生成器
Stream.iterate(0, n -> n + 2).limit(5)
      .forEach(n -> System.out.print(n + " ")); // 0 2 4 6 8`,
        go: `package main

import "fmt"

// Go 没有内置迭代器协议，惯用 channel 模拟生成器
func countdown(n int) <-chan int {
	ch := make(chan int)
	go func() {
		for i := n; i > 0; i-- {
			ch <- i // 逐个产出，协程自动暂停等待
		}
		close(ch)
	}()
	return ch
}

func fib() <-chan int {
	ch := make(chan int)
	go func() {
		a, b := 0, 1
		for { // 无限序列：惰性，取多少产多少
			ch <- a
			a, b = b, a+b
		}
	}()
	return ch
}

func main() {
	for x := range countdown(3) {
		fmt.Print(x, " ") // 3 2 1
	}
	fmt.Println()

	f := fib()
	for i := 0; i < 5; i++ {
		fmt.Print(<-f, " ") // 0 1 1 2 3
	}
	fmt.Println()

	// Go 1.23+ 还引入 iter.Seq 标准迭代器
}`,
        rust: `fn main() {
    // Iterator trait：next() 返回 Option，取尽返回 None
    let v = vec![1, 2, 3];
    let mut it = v.iter();
    println!("{:?} {:?}", it.next(), it.next()); // Some(1) Some(2)

    // 适配器链是惰性的：collect 才触发计算
    let evens: Vec<i32> = (1..=10)
        .filter(|n| n % 2 == 0)   // 惰性
        .map(|n| n * 10)
        .collect();               // 终止操作
    println!("{:?}", evens);      // [20, 40, 60, 80, 100]

    // 无限迭代器 + take：生成器等价物
    let fib5: Vec<u64> =
        std::iter::successors(Some((0u64, 1u64)), |&(a, b)| Some((b, a + b)))
            .map(|(a, _)| a)
            .take(5)
            .collect();
    println!("{:?}", fib5); // [0, 1, 1, 2, 3]

    // 惰性意味着零成本：不 collect 就什么都不做
    let _unused = (1..1_000_000_000).map(|x| x * x); // 瞬间返回
}`,
      },
    },
  ],
};
