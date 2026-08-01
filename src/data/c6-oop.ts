import type { Category } from './types';

export const oop: Category = {
  id: 'oop',
  title: { zh: '面向对象', en: 'OOP' },
  topics: [
    {
      id: 'class-method',
      title: { zh: '类与方法', en: 'Classes & Methods' },
      description: {
        zh: 'Go/Rust 没有 class，用 struct + 方法实现同样的封装。',
        en: 'Go/Rust have no classes — structs + methods achieve the same encapsulation.',
      },
      snippets: {
        python: `class Counter:
    count = 0              # 类属性（所有实例共享）

    def __init__(self, name):
        self.name = name   # 实例属性
        self._value = 0    # 单下划线 = 约定私有

    def inc(self):         # 第一个参数必须是 self
        self._value += 1
        return self._value

c = Counter("访问量")
print(c.inc())  # 1`,
        javascript: `class Counter {
  static count = 0;        // 静态属性
  #value = 0;              // # 前缀 = 真私有（ES2022）

  constructor(name) {
    this.name = name;
  }

  inc() {
    return ++this.#value;
  }
}

const c = new Counter("访问量");
console.log(c.inc()); // 1`,
        java: `public class Counter {
    private static int count = 0;  // 静态字段
    private int value;             // 私有实例字段
    private final String name;

    public Counter(String name) {
        this.name = name;
    }

    public int inc() {
        return ++value;
    }
}
// new Counter("访问量").inc() == 1`,
        go: `// 无 class：struct + 方法
type Counter struct {
    name  string
    value int  // 小写 = 包内私有
}

// 构造函数是约定俗成的工厂函数
func NewCounter(name string) *Counter {
    return &Counter{name: name}
}

// 指针接收者可修改，值接收者是副本
func (c *Counter) Inc() int {
    c.value++
    return c.value
}`,
        rust: `// 无 class：struct + impl 块
struct Counter {
    name: String,
    value: i32,  // 默认私有
}

impl Counter {
    // 关联函数（类似静态方法/构造函数）
    fn new(name: &str) -> Self {
        Counter { name: name.into(), value: 0 }
    }

    // &mut self 可变借用，&self 只读借用
    fn inc(&mut self) -> i32 {
        self.value += 1;
        self.value
    }
}`,
      },
    },
    {
      id: 'interface-polymorphism',
      title: { zh: '接口与多态', en: 'Interfaces & Polymorphism' },
      snippets: {
        python: `# 鸭子类型：不需要显式接口
class Dog:
    def speak(self): return "汪！"
class Cat:
    def speak(self): return "喵～"

def make_speak(animal):   # 有 speak 方法就行
    print(animal.speak())

# 也可用 abc 定义抽象基类强制约束
from abc import ABC, abstractmethod
class Animal(ABC):
    @abstractmethod
    def speak(self): ...`,
        javascript: `// 鸭子类型：天然支持
class Dog { speak() { return "汪！"; } }
class Cat { speak() { return "喵～"; } }

function makeSpeak(animal) {
  console.log(animal.speak());  // 有 speak 方法就行
}

// JS 无接口关键字（TypeScript 有 interface）
// 通常用继承或约定
class Animal {
  speak() { throw new Error("必须重写此方法"); }
}`,
        java: `// interface 显式契约（Java 8 支持默认方法）
interface Animal {
    String speak();

    default String introduce() {   // 默认实现
        return "我是动物，" + speak();
    }
}

class Dog implements Animal {
    public String speak() { return "汪！"; }
}

Animal a = new Dog();   // 多态
System.out.println(a.introduce());`,
        go: `// interface 隐式实现：实现了方法就自动满足
type Animal interface {
    Speak() string
}

type Dog struct{}
func (Dog) Speak() string { return "汪！" }

type Cat struct{}
func (Cat) Speak() string { return "喵～" }

func MakeSpeak(a Animal) {  // 无需 implements 声明
    fmt.Println(a.Speak())
}`,
        rust: `// trait 定义共享行为
trait Animal {
    fn speak(&self) -> String;

    // 可提供默认实现
    fn introduce(&self) -> String {
        format!("我是动物，{}", self.speak())
    }
}

struct Dog;
impl Animal for Dog {
    fn speak(&self) -> String { "汪！".into() }
}

// dyn 动态分发 / 泛型静态分发
fn make_speak(a: &dyn Animal) {
    println!("{}", a.speak());
}`,
      },
    },
  ],
};
