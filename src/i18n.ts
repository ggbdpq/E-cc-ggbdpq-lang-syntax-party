export type UiLang = 'zh' | 'en';

export const UI = {
  siteTitle: { zh: 'Syntax Party 语法派对', en: 'Syntax Party' },
  tagline: {
    zh: '五种语言 · 同一主题 · 并排对比',
    en: 'Five languages, same topic, side by side',
  },
  heroTitle: {
    zh: '像 Component Party 一样，但对比的是编程语言',
    en: 'Like Component Party, but for programming languages',
  },
  heroDesc: {
    zh: '从前端框架到后端语言：Python / Node.js / Java / Go / Rust 基础语法逐主题对比。点击左侧导航跳转，用上方开关聚焦你想看的语言。',
    en: 'From frontend frameworks to backend languages: basic syntax of Python / Node.js / Java / Go / Rust, compared topic by topic. Navigate from the sidebar, toggle languages above to focus.',
  },
  contents: { zh: '目录', en: 'Contents' },
  languages: { zh: '语言筛选', en: 'Languages' },
  copy: { zh: '复制', en: 'Copy' },
  copied: { zh: '已复制', en: 'Copied' },
  topics: { zh: '个主题', en: 'topics' },
  categories: { zh: '个分类', en: 'categories' },
  frameworks: { zh: '个框架', en: 'frameworks' },
  frameworksTitle: { zh: '框架生态', en: 'Frameworks' },
  frameworksDesc: {
    zh: '每种语言精选 3-5 个主流热门框架：定位、风格、适用场景与最小路由示例。',
    en: '3-5 mainstream frameworks per language: positioning, style, use cases, and minimal route examples.',
  },
  practiceTitle: { zh: '框架实战', en: 'Frameworks in Production' },
  practiceDesc: {
    zh: '源自真实 Spring Boot 项目的生产场景：统一响应、参数校验、全局异常、中间件、CRUD、分页、JWT。各语言用旗舰框架对照实现：FastAPI / Express / Spring Boot / Gin / Axum。',
    en: 'Production scenarios from real Spring Boot projects: unified responses, validation, global errors, middleware, CRUD, pagination, JWT — mirrored in each language\u2019s flagship framework: FastAPI / Express / Spring Boot / Gin / Axum.',
  },
  footer: {
    zh: '灵感来自 component-party.dev · 为你的全栈学习之旅而建',
    en: 'Inspired by component-party.dev · built for your full-stack journey',
  },
  backToTop: { zh: '回到顶部', en: 'Back to top' },
  backToBottom: { zh: '回到底部', en: 'Back to bottom' },
  navMap: { zh: '导航图', en: 'Site map' },
  navMapDesc: { zh: '点击跳转', en: 'Click to jump' },
  learnPaths: { zh: '学习路径', en: 'Learning Paths' },
  tabSyntax: { zh: '五语言语法', en: 'Syntax' },
  tabJson: { zh: 'JSON 速成', en: 'JSON' },
  tabGit: { zh: 'Git & GitHub', en: 'Git & GitHub' },
  tabMysql: { zh: 'MySQL 速成', en: 'MySQL' },
  jsonHeroTitle: { zh: 'JSON 速成：一门每个后端都绕不开的数据格式', en: 'JSON Quickstart' },
  jsonHeroDesc: {
    zh: '参考《JSON 必知必会》章节体系：先吃透 JSON 语法与六种数据类型，再用五种语言对照练习解析与生成，最后了解 JSON Schema 验证与安全陷阱。',
    en: 'Following "JSON Quick Start": master syntax and six data types first, then practice parsing/serializing in five languages, and finish with JSON Schema validation and security pitfalls.',
  },
  gitHeroTitle: { zh: 'Git & GitHub 速成：从第一行命令到团队协作', en: 'Git & GitHub Quickstart' },
  gitHeroDesc: {
    zh: '参考《GitHub 入门与实践》章节体系：初始配置 → 日常三板斧（add/commit/log）→ 分支与撤销 → SSH 推送 → Pull Request 协作流。每条命令都可直接复制上手。',
    en: 'Following "GitHub for Beginners": setup → daily trio (add/commit/log) → branching & undo → SSH push → Pull Request workflow. Every command is copy-paste ready.',
  },
  mysqlHeroTitle: { zh: 'MySQL 速成：后端必备的查询基本功', en: 'MySQL Quickstart' },
  mysqlHeroDesc: {
    zh: '参考《MySQL 必知必会》章节体系：连接与库表 → SELECT/排序/过滤三板斧 → 函数、分组、子查询、JOIN → 增删改与事务索引。结尾附五种语言连接 MySQL 实战。',
    en: 'Following "MySQL Crash Course": connection & tables → SELECT/ORDER/WHERE essentials → functions, grouping, subqueries, JOINs → writes, transactions & indexes. Ends with five-language MySQL connection practice.',
  },
  compareTitle: { zh: '五语言对照实战', en: 'Five-language Practice' },
} as const;

export function t(entry: { zh: string; en: string }, lang: UiLang): string {
  return entry[lang];
}
