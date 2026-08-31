import type { Category } from './types';

export const dataStructures: Category = {
  id: 'data-structures',
  title: { zh: '数据结构', en: 'Data Structures' },
  topics: [
    {
      id: 'list-array',
      title: { zh: '列表与数组', en: 'Lists & Arrays' },
      description: {
        zh: '定长数组 vs 动态列表：Python/JS 一种类型走天下，Go/Rust/Java 区分两者。',
        en: 'Fixed arrays vs dynamic lists: Python/JS unify them, Go/Rust/Java distinguish.',
      },
      snippets: {
        python: `# list 动态列表，长度可变
nums = [1, 2, 3]
nums.append(4)        # 追加
nums.insert(0, 0)     # 插入
nums.pop()            # 弹出末尾

print(nums[1:3])      # 切片 [2, 3]
print(len(nums))      # 长度 4
squares = [x**2 for x in nums]  # 列表推导式`,
        javascript: `// Array 动态数组
const nums = [1, 2, 3];
nums.push(4);         // 追加
nums.unshift(0);      // 头部插入
nums.pop();           // 弹出末尾

console.log(nums.slice(1, 3)); // 切片 [2, 3]
console.log(nums.length);      // 长度 4
const squares = nums.map(x => x ** 2);`,
        java: `// 定长数组
int[] arr = {1, 2, 3, 4};
System.out.println(arr.length); // 4

// ArrayList 动态列表
List<Integer> nums = new ArrayList<>(Arrays.asList(1, 2, 3));
nums.add(4);
nums.remove(0);
System.out.println(nums.get(0)); // 2

// Java 8 Stream 处理
List<Integer> squares = nums.stream()
    .map(x -> x * x).collect(Collectors.toList());`,
        go: `// 数组定长，切片 slice 动态
arr := [4]int{1, 2, 3, 4}   // 数组
nums := []int{1, 2, 3}      // 切片（常用）
nums = append(nums, 4)      // 追加

fmt.Println(nums[1:3])  // 切片 [2 3]
fmt.Println(len(nums))  // 长度 4

// 无推导式，循环处理
squares := make([]int, len(nums))
for i, x := range nums {
    squares[i] = x * x
}`,
        rust: `// 数组定长，Vec 动态
let arr: [i32; 4] = [1, 2, 3, 4];
let mut nums = vec![1, 2, 3];
nums.push(4);
nums.pop();

println!("{:?}", &nums[0..2]); // 切片 [1, 2]
println!("{}", nums.len());    // 长度

// 迭代器链式处理
let squares: Vec<i32> = nums.iter().map(|x| x * x).collect();`,
      },
    },
    {
      id: 'map-dict',
      title: { zh: '字典与映射', en: 'Maps & Dicts' },
      snippets: {
        python: `# dict 字典
user = {"name": "小明", "age": 25}
user["city"] = "北京"          # 增/改
print(user.get("age", 0))      # 安全读取
del user["city"]               # 删除

for key, val in user.items():
    print(key, val)

print("name" in user)  # True  # 键存在判断`,
        javascript: `// Map（比对象更适合做字典）
const user = new Map([["name", "小明"], ["age", 25]]);
user.set("city", "北京");
console.log(user.get("age"));   // 25
user.delete("city");

for (const [key, val] of user) {
  console.log(key, val);
}
console.log(user.has("name"));  // true

// 普通对象也常用: { name: "小明", age: 25 }`,
        java: `// HashMap
Map<String, Object> user = new HashMap<>();
user.put("name", "小明");
user.put("age", 25);
user.putIfAbsent("city", "北京");

System.out.println(user.get("age"));          // 25
System.out.println(user.getOrDefault("x", 0));

for (Map.Entry<String, Object> e : user.entrySet()) {
    System.out.println(e.getKey() + "=" + e.getValue());
}`,
        go: `// map 内置类型
user := map[string]int{"小明": 25, "小红": 23}
user["小刚"] = 30              // 增/改
delete(user, "小红")           // 删除

age, ok := user["小明"]        // 逗号 ok 惯用法
if ok {
    fmt.Println("年龄:", age)
}

for name, age := range user {
    fmt.Println(name, age)
}`,
        rust: `use std::collections::HashMap;

let mut user = HashMap::new();
user.insert("小明", 25);
user.insert("小红", 23);
user.remove("小红");

// entry API：存在则读取，不存在则插入
let age = user.entry("小刚").or_insert(30);
println!("{}", age);

for (name, age) in &user {
    println!("{} {}", name, age);
}`,
      },
    },
    {
      id: 'struct-object',
      title: { zh: '自定义数据类型', en: 'Custom Data Types' },
      snippets: {
        python: `# dataclass 自动生成构造/打印等方法（3.7+）
from dataclasses import dataclass

@dataclass
class Point:
    x: float
    y: float

p = Point(3.0, 4.0)
print(p.x, p)  # 3.0 Point(x=3.0, y=4.0)`,
        javascript: `// 对象字面量最常用
const p = { x: 3, y: 4 };
console.log(p.x); // 3

// class 定义结构化类型
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  distance() {
    return Math.hypot(this.x, this.y);
  }
}`,
        java: `// class 定义数据结构（Java 8 无 record）
public class Point {
    private final double x;
    private final double y;

    public Point(double x, double y) {
        this.x = x;
        this.y = y;
    }
    public double getX() { return x; }
    public double distance() {
        return Math.hypot(x, y);
    }
}`,
        go: `// struct 结构体（无 class）
type Point struct {
    X, Y float64  // 大写导出（公开）
}

// 方法挂在结构体上
func (p Point) Distance() float64 {
    return math.Hypot(p.X, p.Y)
}

p := Point{X: 3, Y: 4}
fmt.Println(p.X, p.Distance())`,
        rust: `// struct 定义数据结构
#[derive(Debug)]  // 自动实现 Debug 打印
struct Point {
    x: f64,
    y: f64,
}

// impl 块中定义方法
impl Point {
    fn distance(&self) -> f64 {
        self.x.hypot(self.y)
    }
}

let p = Point { x: 3.0, y: 4.0 };
println!("{:?} {}", p, p.distance());`,
      },
    },
  ],
};
