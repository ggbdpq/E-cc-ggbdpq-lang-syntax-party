import type { Category } from './types';

/**
 * 算法与 LeetCode Hot 100：面试常考题的五语言实现
 */
export const algorithms: Category = {
  id: 'algorithms',
  title: { zh: '算法与 LeetCode Hot 100', en: 'Algorithms & LeetCode Hot 100' },
  topics: [
    {
      id: 'sorting',
      title: { zh: '排序算法：冒泡与快排', en: 'Sorting: Bubble & QuickSort' },
      description: {
        zh: '手写排序是基本功：冒泡理解交换，快排理解分治。附各语言内置排序的正确姿势。',
        en: 'Hand-written sorts are fundamentals: bubble for swapping, quicksort for divide & conquer — plus the right way to use built-in sorts.',
      },
      difficulty: 2,
      snippets: {
        python: `def bubble_sort(nums):
    """冒泡：相邻比较，大的往后冒"""
    nums = nums[:]  # 不改原列表
    n = len(nums)
    for i in range(n):
        swapped = False
        for j in range(n - 1 - i):
            if nums[j] > nums[j + 1]:
                nums[j], nums[j + 1] = nums[j + 1], nums[j]
                swapped = True
        if not swapped:      # 提前退出优化
            break
    return nums

def quick_sort(nums):
    """快排：选基准，小的左大的右，递归分治"""
    if len(nums) <= 1:
        return nums
    pivot = nums[len(nums) // 2]
    left = [x for x in nums if x < pivot]
    mid = [x for x in nums if x == pivot]
    right = [x for x in nums if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

# 生产用内置（Timsort，O(n log n)）
sorted(nums)          # 返回新列表
nums.sort(reverse=True)  # 原地降序`,
        javascript: `function bubbleSort(nums) {
  nums = [...nums];  // 不改原数组
  for (let i = 0; i < nums.length; i++) {
    let swapped = false;
    for (let j = 0; j < nums.length - 1 - i; j++) {
      if (nums[j] > nums[j + 1]) {
        [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]]; // 解构交换
        swapped = true;
      }
    }
    if (!swapped) break;  // 提前退出
  }
  return nums;
}

function quickSort(nums) {
  if (nums.length <= 1) return nums;
  const pivot = nums[nums.length >> 1];
  const left = nums.filter(x => x < pivot);
  const mid = nums.filter(x => x === pivot);
  const right = nums.filter(x => x > pivot);
  return [...quickSort(left), ...mid, ...quickSort(right)];
}

// 生产用内置（默认按字符串排！数字必须传比较函数）
nums.sort((a, b) => a - b);  // 升序
nums.sort((a, b) => b - a);  // 降序`,
        java: `// 冒泡排序
static void bubbleSort(int[] nums) {
    for (int i = 0; i < nums.length; i++) {
        boolean swapped = false;
        for (int j = 0; j < nums.length - 1 - i; j++) {
            if (nums[j] > nums[j + 1]) {
                int tmp = nums[j];
                nums[j] = nums[j + 1];
                nums[j + 1] = tmp;
                swapped = true;
            }
        }
        if (!swapped) break;  // 提前退出
    }
}

// 快排：原地分区版（面试标准写法）
static void quickSort(int[] nums, int lo, int hi) {
    if (lo >= hi) return;
    int pivot = nums[(lo + hi) / 2];
    int i = lo, j = hi;
    while (i <= j) {
        while (nums[i] < pivot) i++;
        while (nums[j] > pivot) j--;
        if (i <= j) {
            int tmp = nums[i]; nums[i] = nums[j]; nums[j] = tmp;
            i++; j--;
        }
    }
    quickSort(nums, lo, j);
    quickSort(nums, i, hi);
}

// 生产用内置: Arrays.sort(nums)（双轴快排）
// 对象排序: list.sort(Comparator.comparing(User::getAge))`,
        go: `// 冒泡排序
func bubbleSort(nums []int) {
    for i := 0; i < len(nums); i++ {
        swapped := false
        for j := 0; j < len(nums)-1-i; j++ {
            if nums[j] > nums[j+1] {
                nums[j], nums[j+1] = nums[j+1], nums[j] // 并行交换
                swapped = true
            }
        }
        if !swapped {
            break // 提前退出
        }
    }
}

// 快排：原地分区版
func quickSort(nums []int, lo, hi int) {
    if lo >= hi {
        return
    }
    pivot := nums[(lo+hi)/2]
    i, j := lo, hi
    for i <= j {
        for nums[i] < pivot { i++ }
        for nums[j] > pivot { j-- }
        if i <= j {
            nums[i], nums[j] = nums[j], nums[i]
            i++
            j--
        }
    }
    quickSort(nums, lo, j)
    quickSort(nums, i, hi)
}

// 生产用内置: sort.Ints(nums)
// 自定义: sort.Slice(users, func(i, j int) bool { return users[i].Age < users[j].Age })`,
        rust: `// 冒泡排序
fn bubble_sort(nums: &mut [i32]) {
    let n = nums.len();
    for i in 0..n {
        let mut swapped = false;
        for j in 0..n - 1 - i {
            if nums[j] > nums[j + 1] {
                nums.swap(j, j + 1);  // 切片原生 swap
                swapped = true;
            }
        }
        if !swapped {
            break; // 提前退出
        }
    }
}

// 快排：原地分区版
fn quick_sort(nums: &mut [i32], lo: isize, hi: isize) {
    if lo >= hi {
        return;
    }
    let pivot = nums[((lo + hi) / 2) as usize];
    let (mut i, mut j) = (lo, hi);
    while i <= j {
        while nums[i as usize] < pivot { i += 1; }
        while nums[j as usize] > pivot { j -= 1; }
        if i <= j {
            nums.swap(i as usize, j as usize);
            i += 1;
            j -= 1;
        }
    }
    quick_sort(nums, lo, j);
    quick_sort(nums, i, hi);
}

// 生产用内置: nums.sort() / nums.sort_by(|a, b| b.cmp(a))
// 稳定排序: sort()；不稳定更快: sort_unstable()`,
      },
    },
    {
      id: 'two-sum',
      title: { zh: 'LeetCode 1. 两数之和', en: 'LeetCode 1. Two Sum' },
      description: {
        zh: 'Hot 100 第一题：数组中找两个数和为 target，返回下标。哈希表一次遍历 O(n)。',
        en: 'Hot 100 opener: find two numbers summing to target, return indices. One-pass hash map, O(n).',
      },
      difficulty: 2,
      snippets: {
        python: `def two_sum(nums, target):
    """哈希表存"值→下标"，边遍历边查补数"""
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:          # 补数见过？命中！
            return [seen[target - x], i]
        seen[x] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]`,
        javascript: `function twoSum(nums, target) {
  const seen = new Map();  // 值 → 下标
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {  // 补数见过？命中！
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]`,
        java: `// 哈希表一次遍历
public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> seen = new HashMap<>();  // 值 → 下标
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (seen.containsKey(complement)) {  // 补数见过？命中！
            return new int[]{ seen.get(complement), i };
        }
        seen.put(nums[i], i);
    }
    return new int[0];
}

// twoSum(new int[]{2, 7, 11, 15}, 9) → [0, 1]`,
        go: `// 哈希表一次遍历
func twoSum(nums []int, target int) []int {
    seen := map[int]int{}  // 值 → 下标
    for i, x := range nums {
        if j, ok := seen[target-x]; ok { // 补数见过？命中！
            return []int{j, i}
        }
        seen[x] = i
    }
    return nil
}

// twoSum([]int{2, 7, 11, 15}, 9) → [0 1]`,
        rust: `use std::collections::HashMap;

fn two_sum(nums: &[i32], target: i32) -> Option<(usize, usize)> {
    let mut seen: HashMap<i32, usize> = HashMap::new();
    for (i, &x) in nums.iter().enumerate() {
        if let Some(&j) = seen.get(&(target - x)) {
            return Some((j, i));  // 补数见过？命中！
        }
        seen.insert(x, i);
    }
    None
}

// two_sum(&[2, 7, 11, 15], 9) → Some((0, 1))`,
      },
    },
    {
      id: 'binary-search',
      title: { zh: 'LeetCode 704. 二分查找', en: 'LeetCode 704. Binary Search' },
      description: {
        zh: '有序数组查找，O(log n)。细节是魔鬼：mid 防溢出、区间开闭一致性。',
        en: 'O(log n) search in sorted arrays. The devil is in details: overflow-safe mid, consistent interval semantics.',
      },
      difficulty: 2,
      snippets: {
        python: `def binary_search(nums, target):
    """闭区间 [lo, hi] 写法"""
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1     # 排除 mid，缩到右半
        else:
            hi = mid - 1     # 缩到左半
    return -1

# Python 内置: import bisect; bisect.bisect_left(nums, target)`,
        javascript: `function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;  // 闭区间
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;      // 位运算取中点
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) {
      lo = mid + 1;                  // 排除 mid，缩到右半
    } else {
      hi = mid - 1;                  // 缩到左半
    }
  }
  return -1;
}

console.log(binarySearch([-1, 0, 3, 5, 9, 12], 9)); // 4`,
        java: `static int binarySearch(int[] nums, int target) {
    int lo = 0, hi = nums.length - 1;  // 闭区间
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;  // 防溢出写法！
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) {
            lo = mid + 1;              // 排除 mid，缩到右半
        } else {
            hi = mid - 1;              // 缩到左半
        }
    }
    return -1;
}
// Java 内置: Arrays.binarySearch(nums, target)`,
        go: `func binarySearch(nums []int, target int) int {
    lo, hi := 0, len(nums)-1   // 闭区间
    for lo <= hi {
        mid := lo + (hi-lo)/2  // 防溢出写法
        switch {
        case nums[mid] == target:
            return mid
        case nums[mid] < target:
            lo = mid + 1       // 排除 mid，缩到右半
        default:
            hi = mid - 1       // 缩到左半
        }
    }
    return -1
}
// Go 内置: sort.SearchInts(nums, target)（返回插入位，需再判断）`,
        rust: `fn binary_search(nums: &[i32], target: i32) -> Option<usize> {
    let (mut lo, mut hi) = (0usize, nums.len());
    while lo < hi {                    // 半开区间 [lo, hi)
        let mid = lo + (hi - lo) / 2;  // 防溢出
        match nums[mid].cmp(&target) {
            std::cmp::Ordering::Equal => return Some(mid),
            std::cmp::Ordering::Less => lo = mid + 1,
            std::cmp::Ordering::Greater => hi = mid,
        }
    }
    None
}

// Rust 内置: nums.binary_search(&target) → Result<usize, usize>
// Ok(下标) 找到 / Err(插入位) 未找到`,
      },
    },
    {
      id: 'reverse-linked-list',
      title: { zh: 'LeetCode 206. 反转链表', en: 'LeetCode 206. Reverse Linked List' },
      description: {
        zh: 'Hot 100 链表入门：三指针迭代反转。Rust 所有权让这题画风突变，附递归版。',
        en: 'Hot 100 linked-list starter: three-pointer iterative reversal. Rust ownership changes the picture — recursive version included.',
      },
      difficulty: 3,
      snippets: {
        python: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    """三指针：prev ← cur → next，逐个掉头"""
    prev = None
    cur = head
    while cur:
        nxt = cur.next   # 1. 先记住后继
        cur.next = prev  # 2. 掉头
        prev = cur       # 3. prev 前进
        cur = nxt        # 4. cur 前进
    return prev          # prev 停在新头节点

# 递归版（更优雅，注意栈深度）
def reverse_list_v2(head):
    if not head or not head.next:
        return head
    new_head = reverse_list_v2(head.next)
    head.next.next = head
    head.next = None
    return new_head`,
        javascript: `class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let cur = head;
  while (cur) {
    const nxt = cur.next;  // 1. 先记住后继
    cur.next = prev;       // 2. 掉头
    prev = cur;            // 3. prev 前进
    cur = nxt;             // 4. cur 前进
  }
  return prev;             // prev 停在新头节点
}

// 一行流递归版
const reverseV2 = (head) =>
  !head || !head.next
    ? head
    : ((newHead) => ((head.next.next = head), (head.next = null), newHead))
        (reverseV2(head.next));`,
        java: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

// 三指针迭代（标准答案）
public static ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode cur = head;
    while (cur != null) {
        ListNode nxt = cur.next;  // 1. 先记住后继
        cur.next = prev;          // 2. 掉头
        prev = cur;               // 3. prev 前进
        cur = nxt;                // 4. cur 前进
    }
    return prev;                  // prev 停在新头节点
}

// 递归版
public static ListNode reverseListV2(ListNode head) {
    if (head == null || head.next == null) return head;
    ListNode newHead = reverseListV2(head.next);
    head.next.next = head;
    head.next = null;
    return newHead;
}`,
        go: `type ListNode struct {
    Val  int
    Next *ListNode
}

// 三指针迭代（标准答案）
func reverseList(head *ListNode) *ListNode {
    var prev *ListNode
    cur := head
    for cur != nil {
        nxt := cur.Next  // 1. 先记住后继
        cur.Next = prev  // 2. 掉头
        prev = cur       // 3. prev 前进
        cur = nxt        // 4. cur 前进
    }
    return prev // prev 停在新头节点
}

// 递归版
func reverseListV2(head *ListNode) *ListNode {
    if head == nil || head.Next == nil {
        return head
    }
    newHead := reverseListV2(head.Next)
    head.Next.Next = head
    head.Next = nil
    return newHead
}`,
        rust: `// Rust 的链表 = Box 指针，所有权让迭代版反而绕
type Link = Option<Box<ListNode>>;

struct ListNode {
    val: i32,
    next: Link,
}

impl ListNode {
    fn new(val: i32) -> Self {
        Self { val, next: None }
    }
}

// 迭代版：take() 把所有权"换出来"是核心技巧
fn reverse_list(mut head: Link) -> Link {
    let mut prev: Link = None;
    while let Some(mut node) = head {
        head = node.next.take(); // 取出后继，node.next 置 None
        node.next = prev;        // 掉头指向 prev
        prev = Some(node);       // prev 前进
    }
    prev
}

// 为什么难：其他语言改指针即可，Rust 要保证每一刻
// 每个节点只有一个所有者——这正是所有权的价值`,
      },
    },
    {
      id: 'max-subarray',
      title: { zh: 'LeetCode 53. 最大子数组和', en: 'LeetCode 53. Maximum Subarray' },
      description: {
        zh: 'Kadane 算法：经典 DP 入门，O(n) 一次遍历。',
        en: "Kadane's algorithm: the classic DP introduction, one-pass O(n).",
      },
      difficulty: 2,
      snippets: {
        python: `def max_sub_array(nums):
    """Kadane：到 i 为止的最大和 = max(单独开头, 接上前面)"""
    best = cur = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)   # 负数拖累就重新起头
        best = max(best, cur)
    return best

print(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))  # 6（[4,-1,2,1]）`,
        javascript: `function maxSubArray(nums) {
  let best = nums[0], cur = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]); // 负数拖累就重新起头
    best = Math.max(best, cur);
  }
  return best;
}

console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6`,
        java: `public static int maxSubArray(int[] nums) {
    int best = nums[0], cur = nums[0];
    for (int i = 1; i < nums.length; i++) {
        cur = Math.max(nums[i], cur + nums[i]); // 负数拖累就重新起头
        best = Math.max(best, cur);
    }
    return best;
}
// maxSubArray({-2,1,-3,4,-1,2,1,-5,4}) → 6`,
        go: `func maxSubArray(nums []int) int {
    best, cur := nums[0], nums[0]
    for _, x := range nums[1:] {
        cur = max(x, cur+x) // Go 1.21+ 内置 max/min
        best = max(best, cur)
    }
    return best
}
// maxSubArray([]int{-2,1,-3,4,-1,2,1,-5,4}) → 6`,
        rust: `fn max_sub_array(nums: &[i32]) -> i32 {
    let mut best = nums[0];
    let mut cur = nums[0];
    for &x in &nums[1..] {
        cur = x.max(cur + x);  // 负数拖累就重新起头
        best = best.max(cur);
    }
    best
}

// max_sub_array(&[-2,1,-3,4,-1,2,1,-5,4]) → 6`,
      },
    },
    {
      id: 'valid-parentheses',
      title: { zh: 'LeetCode 20. 有效的括号', en: 'LeetCode 20. Valid Parentheses' },
      description: {
        zh: '栈的教科书应用：左括号入栈，右括号匹配栈顶。',
        en: 'The textbook stack problem: push openers, match closers against the top.',
      },
      difficulty: 2,
      snippets: {
        python: `def is_valid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)           # 左括号入栈
        elif ch in pairs:
            # 栈空或不匹配 → 非法
            if not stack or stack.pop() != pairs[ch]:
                return False
    return not stack                   # 栈空才算合法

print(is_valid("()[]{}"))   # True
print(is_valid("([)]"))     # False`,
        javascript: `function isValid(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' };
  const stack = [];
  for (const ch of s) {
    if ('([{'.includes(ch)) {
      stack.push(ch);              // 左括号入栈
    } else if (pairs[ch]) {
      // 栈空或不匹配 → 非法
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  return stack.length === 0;       // 栈空才算合法
}

console.log(isValid('()[]{}'));  // true
console.log(isValid('([)]'));    // false`,
        java: `public static boolean isValid(String s) {
    Map<Character, Character> pairs = Map.of(
        ')', '(', ']', '[', '}', '{');  // JDK 9+；JDK 8 用 HashMap
    Deque<Character> stack = new ArrayDeque<>();
    for (char ch : s.toCharArray()) {
        if (ch == '(' || ch == '[' || ch == '{') {
            stack.push(ch);             // 左括号入栈
        } else if (pairs.containsKey(ch)) {
            // 栈空或不匹配 → 非法
            if (stack.isEmpty() || stack.pop() != pairs.get(ch)) {
                return false;
            }
        }
    }
    return stack.isEmpty();             // 栈空才算合法
}`,
        go: `func isValid(s string) bool {
    pairs := map[rune]rune{')': '(', ']': '[', '}': '{'}
    stack := make([]rune, 0, len(s))
    for _, ch := range s {
        switch {
        case ch == '(' || ch == '[' || ch == '{':
            stack = append(stack, ch) // 左括号入栈
        default:
            want, isCloser := pairs[ch]
            // 非括号字符跳过；栈空或不匹配 → 非法
            if isCloser {
                if len(stack) == 0 || stack[len(stack)-1] != want {
                    return false
                }
                stack = stack[:len(stack)-1] // 切片模拟出栈
            }
        }
    }
    return len(stack) == 0 // 栈空才算合法
}`,
        rust: `fn is_valid(s: &str) -> bool {
    let pairs = [(')', '('), (']', '['), ('}', '{')]
        .into_iter()
        .collect::<std::collections::HashMap<_, _>>();
    let mut stack: Vec<char> = Vec::new();

    for ch in s.chars() {
        if "([{".contains(ch) {
            stack.push(ch);            // 左括号入栈
        } else if let Some(&want) = pairs.get(&ch) {
            // Vec::pop 天然返回 Option：栈空 → None → 非法
            if stack.pop() != Some(want) {
                return false;
            }
        }
    }
    stack.is_empty()                   // 栈空才算合法
}

// is_valid("()[]{}") → true；is_valid("([)]") → false`,
      },
    },
    {
      id: 'climb-stairs',
      title: { zh: 'LeetCode 70. 爬楼梯', en: 'LeetCode 70. Climbing Stairs' },
      description: {
        zh: '动态规划第一课：每次爬 1 或 2 级，n 级楼梯多少种爬法？本质是斐波那契。',
        en: 'DP lesson one: climb 1 or 2 steps at a time — how many ways to reach step n? Fibonacci in disguise.',
      },
      difficulty: 2,
      snippets: {
        python: `def climb_stairs(n):
    """dp[i] = dp[i-1] + dp[i-2]，滚动变量省空间"""
    if n <= 2:
        return n
    prev, cur = 1, 2   # dp[1], dp[2]
    for _ in range(3, n + 1):
        prev, cur = cur, prev + cur
    return cur

print(climb_stairs(10))  # 89`,
        javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let prev = 1, cur = 2;  // dp[1], dp[2]
  for (let i = 3; i <= n; i++) {
    [prev, cur] = [cur, prev + cur];  // 滚动变量
  }
  return cur;
}

console.log(climbStairs(10)); // 89`,
        java: `public static int climbStairs(int n) {
    if (n <= 2) return n;
    int prev = 1, cur = 2;  // dp[1], dp[2]
    for (int i = 3; i <= n; i++) {
        int next = prev + cur;
        prev = cur;
        cur = next;
    }
    return cur;
}
// climbStairs(10) → 89`,
        go: `func climbStairs(n int) int {
    if n <= 2 {
        return n
    }
    prev, cur := 1, 2  // dp[1], dp[2]
    for i := 3; i <= n; i++ {
        prev, cur = cur, prev+cur  // 并行赋值天然滚动
    }
    return cur
}
// climbStairs(10) → 89`,
        rust: `fn climb_stairs(n: u32) -> u64 {
    if n <= 2 {
        return n as u64;
    }
    let (mut prev, mut cur) = (1u64, 2u64); // dp[1], dp[2]
    for _ in 3..=n {
        let next = prev + cur;
        prev = cur;
        cur = next;
    }
    cur
}

// 函数式写法也很 Rust:
// (3..=n).fold((1u64, 2u64), |(p, c), _| (c, p + c)).1
// climb_stairs(10) → 89`,
      },
    },
  ],
};
