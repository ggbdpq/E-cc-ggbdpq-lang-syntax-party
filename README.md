# Syntax Party 语法派对

中英双语的**五后端语言语法对比学习网站**，灵感来自 [component-party.dev](https://component-party.dev/)：
同一个主题，Python / Node.js / Java / Go / Rust 五种语言并排展示代码，直观对比语法差异，
帮助前端工程师快速上手后端与全栈开发。

技术栈：**Vite + React 19 + TypeScript + Tailwind CSS + Prism.js**

## 启动

```bash
npm install        # 首次安装依赖
npm run dev        # 开发预览（默认 http://localhost:5173）
npm run build      # 生产构建，输出到 dist/
```

## 四条学习路径（顶部页签切换）

| 页签 | 内容 | 参考体系 |
|------|------|----------|
| 🎉 五语言语法 | 17 个分类 70+ 主题：基础语法 → 进阶 → 框架实战 → 综合案例 → 常用处理逻辑 → LeetCode Hot 100 → 语言内核 | 《JavaScript 高级程序设计》（红宝书）视角 |
| 📦 JSON 速成 | JSON 语法六类型、合法/非法对照、真实 API 响应结构、JSON Schema 验证、安全陷阱 + 五语言读写 JSON 对照 | 《JSON 必知必会》 |
| 🌿 Git & GitHub | 初始配置、.gitignore、日常三板斧（status/add/commit）、log/diff、分支合并、撤销改写、SSH 推送、PR 协作流、标签发布 | 《GitHub 入门与实践》 |
| 🐬 MySQL 速成 | 连接库表、SELECT/排序/过滤/LIKE、函数、聚合分组、子查询、JOIN、增删改、事务、索引与 EXPLAIN + 五语言连接 MySQL 对照 | 《MySQL 必知必会》 |

## 网站特性

- **中英双语切换**，顶部五语言开关聚焦想看的技术栈（Git 页自动隐藏）
- **代码卡片**自适应列宽、自动换行——任何屏幕宽度下完整可见，无需横向滚动，一键复制
- **右侧悬浮工具条**：回到顶部 / 回到底部 / 全站导航图（点击跳转）+ 实时阅读进度
- Prism.js 语法高亮：python / javascript / java / go / rust / json / bash / sql

## 目录结构

```
syntax-party/
├── src/
│   ├── App.tsx                  # 路由 + 全局状态（UI 语言、语言开关）
│   ├── pages/                   # Home / JsonGuide / GitGuide / MysqlGuide
│   ├── components/              # Header(页签) / Sidebar / TopicSection / GuideSection
│   │                            # GuidePage / CodePanel / FloatNav / FrameworksSection
│   ├── data/                    # 全部教学内容（纯数据，与 UI 解耦）
│   │   ├── c1-*.ts ~ c15-*.ts   #   语法路径 17 个分类
│   │   ├── g1-json.ts           #   JSON 速成
│   │   ├── g2-git.ts            #   Git & GitHub 速成
│   │   ├── g3-mysql.ts          #   MySQL 速成
│   │   └── frameworks.ts        #   五语言框架生态对比
│   └── i18n.ts                  # 中英双语文案
└── dist/                        # 生产构建产物
```

## 如何扩充内容

所有教学内容都是 `src/data/` 下的纯 TypeScript 数据：

- 五语言对比主题：实现 `Topic` 接口（`snippets` 按语言 ID 填代码字符串），加入对应分类数组
- 单语言教学主题（如 Git/SQL）：实现 `GuideTopic` 接口（指定 `lang` 高亮语言 + `code`）
- 新分类：在 `src/data/index.ts` 的 `CATEGORIES` 中注册，侧边栏和导航图自动接入
