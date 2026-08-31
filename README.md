# Syntax Party 语法派对

中英双语的**五后端语言对照学习站**，灵感来自 [component-party.dev](https://component-party.dev/)：
同一个主题，Python / Node.js / Java / Go / Rust 五种语言并排展示，帮助前端工程师转全栈。

技术栈：**Vite + React 19 + TypeScript + Tailwind CSS + Prism.js**

这是 `backend/` 下唯一的五语言学习入口。可运行服务在 `labs/hello-api/`、`labs/todo-api/` 与 `labs/auth-todo-api/`。

## 启动

```bash
npm install        # 首次安装依赖
npm run dev        # 开发预览（http://localhost:3000）
npm run build      # 生产构建，输出到 dist/
npm test           # 校验 Hello + Todo + JWT 实验室入口文件齐全、端口不冲突
```

## 学习路径（顶部页签）

主线是 **全栈核心 + 动手实验室**。语法页当字典，JSON / Git / MySQL 当工具课。

| 页签 | 内容 | 怎么用 |
|------|------|--------|
| 🛠️ 全栈核心 | 请求一圈地图 + 四层五语言对照：HTTP → 鉴权 → 数据 → 上线 | **主线**。按页内 6 天顺序读 |
| 🧪 动手实验室 | Hello（8001–8005）+ Todo CRUD（8011–8015）+ JWT Todo（8021–8025）+ BFF/Worker 案例课 | **考场**。先 curl Hello，再跑通 Todo，第三关带 token
| 🎉 五语言语法 | 基础语法 → 进阶 → 框架实战 → 综合案例 → 常用逻辑 → 算法 → 语言内核 | 某句语法卡壳时来查 |
| 📦 JSON 速成 | 六类型、合法/非法、API 结构、Schema、安全陷阱 + 五语言读写 | 工具课 |
| 🌿 Git & GitHub | 配置、日常三板斧、分支合并、撤销、SSH、PR、标签 | 工具课 |
| 🐬 MySQL 速成 | SELECT/JOIN/事务/索引 + 五语言连库 | 工具课，配合全栈核心「数据层」 |

建议顺序：全栈核心第 1 天地图 → 实验室 Hello → 全栈核心 HTTP 层 → 实验室 Todo → JWT 实验室 → 数据 / 上线。

## 网站特性

- **中英双语切换**，顶部五语言开关聚焦想看的技术栈（Git 页自动隐藏）
- **代码卡片**自适应列宽、自动换行，一键复制
- **右侧悬浮工具条**：回到顶部 / 底部 / 全站导航图 + 阅读进度
- Prism.js 高亮：python / javascript / java / go / rust / json / bash / sql

## 目录结构

```
syntax-party/
├── src/
│   ├── App.tsx                  # 路由 + 全局状态
│   ├── pages/                   # Home / FullstackGuide / Json / Git / Mysql / Labs
│   ├── components/
│   ├── data/
│   │   ├── c1-*.ts ~ c15-*.ts   # 语法路径
│   │   ├── g1-json.ts
│   │   ├── g2-git.ts
│   │   ├── g3-mysql.ts
│   │   ├── g4-labs.ts           # 实验室元数据、Hello / Todo / JWT 对照、BFF 课
│   │   ├── g5-fullstack-*.ts    # 全栈核心四层 + 地图
│   │   └── frameworks.ts
│   └── i18n.ts
├── labs/hello-api/              # 五语言 GET /hello（8001–8005）
├── labs/todo-api/               # 五语言 Todo CRUD（8011–8015）
├── labs/auth-todo-api/          # 五语言 JWT + 受保护 Todo（8021–8025）
└── dist/
```

## 如何扩充内容

所有教学内容都是 `src/data/` 下的纯 TypeScript 数据：

- 五语言对比主题：实现 `Topic` 接口（`snippets` 按语言 ID 填代码字符串）
- 单语言教学主题：实现 `GuideTopic` 接口
- 新语法分类：在 `src/data/index.ts` 的 `CATEGORIES` 中注册
- 新的可运行实验：放到 `labs/`，并在 `g4-labs.ts` 登记；`scripts/check-labs.mjs` 会校验入口文件与端口唯一
