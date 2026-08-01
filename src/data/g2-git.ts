import type { GuideCategory } from './types';

const BASH_COLOR = '#fcd34d';

/** 起步与配置（对应《GitHub 入门与实践》第 2-3 章） */
export const gitSetup: GuideCategory = {
  id: 'git-setup',
  title: { zh: '起步与配置', en: 'Getting Started' },
  topics: [
    {
      id: 'git-config',
      title: { zh: '安装后的初始配置', en: 'Initial Configuration' },
      description: {
        zh: '装完 Git 后的第一件事：告诉 Git 你是谁（会写进每条提交记录），再配几个提升幸福感的选项。',
        en: 'First thing after installing Git: tell it who you are (recorded in every commit), plus a few quality-of-life options.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 身份配置（--global 对所有仓库生效，写入 ~/.gitconfig）
git config --global user.name "xiaomai"
git config --global user.email "xiaomai@example.com"

# 默认主分支名改为 main（新仓库生效）
git config --global init.defaultBranch main

# 中文文件名/路径显示乱码时
git config --global core.quotepath false

# Windows 换行符策略：提交时转 LF，检出时转 CRLF
git config --global core.autocrlf true
# Mac/Linux 用：git config --global core.autocrlf input

# 实用别名：敲 git st / git lg 就行
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --decorate --all"

# 查看所有配置及来源
git config --list --show-origin`,
    },
    {
      id: 'git-init-clone',
      title: { zh: '创建与克隆仓库', en: 'Init & Clone' },
      description: {
        zh: '两条路：本地 git init 从零开始，或 git clone 把 GitHub 上的仓库整个复制到本地（含全部历史）。',
        en: 'Two paths: git init to start from scratch locally, or git clone to copy a GitHub repo (with full history) to your machine.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 方式一：本地从零开始
mkdir my-project && cd my-project
git init                        # 生成 .git 目录，仓库诞生
echo "# my-project" > README.md
git add README.md
git commit -m "docs: 初始化仓库"

# 方式二：克隆 GitHub 上的已有仓库
git clone git@github.com:owner/repo.git        # SSH 方式（推荐）
git clone https://github.com/owner/repo.git    # HTTPS 方式
git clone git@github.com:owner/repo.git mydir  # 克隆到指定目录名

# 克隆后确认远程地址
cd repo && git remote -v
# origin  git@github.com:owner/repo.git (fetch)
# origin  git@github.com:owner/repo.git (push)`,
    },
    {
      id: 'git-ignore',
      title: { zh: '.gitignore 与不该提交的东西', en: '.gitignore Essentials' },
      description: {
        zh: '依赖目录、编译产物、密钥、IDE 配置都不该进仓库。GitHub 创建仓库时可直接选 .gitignore 模板。',
        en: 'Dependencies, build artifacts, secrets, IDE configs should never be committed. GitHub offers .gitignore templates when creating a repo.',
      },
      lang: 'bash',
      langLabel: '.gitignore',
      color: BASH_COLOR,
      code: `# .gitignore 常用模板（后端全栈版）
# —— 依赖 ——
node_modules/
venv/
.venv/

# —— 编译产物 ——
target/
dist/
build/
*.class
*.jar

# —— 密钥与本地配置（重要！）——
.env
.env.local
*.pem
application-local.yml

# —— IDE / 系统 ——
.idea/
.vscode/
.DS_Store
Thumbs.db

# 规则速记：
#   *.log      所有 .log 文件
#   logs/      logs 目录
#   !keep.log  但 keep.log 除外
#   /doc.txt   只忽略根目录的 doc.txt

# 已经误提交了怎么办？先移出 Git 跟踪再提交：
git rm -r --cached node_modules
git rm --cached .env
git commit -m "chore: 停止跟踪依赖目录与密钥"`,
    },
  ],
};

/** 日常三板斧（对应《GitHub 入门与实践》第 4 章） */
export const gitDaily: GuideCategory = {
  id: 'git-daily',
  title: { zh: '日常三板斧', en: 'The Daily Trio' },
  topics: [
    {
      id: 'git-add-commit',
      title: { zh: 'status / add / commit', en: 'status / add / commit' },
      description: {
        zh: '工作区 → 暂存区 → 仓库的三段式流转，是每天重复几十遍的肌肉记忆。提交信息写好比写快重要。',
        en: 'Working tree → staging area → repository: the three-stage flow you repeat dozens of times a day. A good commit message beats a fast one.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 1. 随时查看状态：哪些改了、哪些已暂存
git status

# 2. 把工作区改动放进暂存区
git add hello.py              # 指定文件
git add .                     # 当前目录全部改动
git add -p                    # 逐块挑选（review 自己的改动）

# 3. 提交到仓库（暂存区 → 历史记录）
git commit -m "feat(user): 支持手机号注册"
git commit -am "fix: 修复空指针"   # 跟踪过的文件 add+commit 一步走

# 提交信息规范（Conventional Commits，企业常用）：
#   feat:     新功能
#   fix:      修 bug
#   docs:     文档
#   refactor: 重构（不改功能）
#   chore:    构建/依赖/杂务
#   test:     测试
# 示例：feat(order): 订单列表支持按状态筛选`,
    },
    {
      id: 'git-log-diff',
      title: { zh: 'log 与 diff：看清历史与改动', en: 'log & diff: History and Changes' },
      description: {
        zh: 'log 回答"之前做过什么"，diff 回答"这次改了什么"。排查问题时这两兄弟是你的时光机。',
        en: 'log answers "what happened before", diff answers "what changed this time". Together they are your time machine for debugging.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 查看提交历史
git log                          # 完整日志（q 退出）
git log --oneline                # 一行一条，最常用
git log --graph --oneline --all  # 分支图，直观
git log -p hello.py              # 查看某文件的每次改动内容
git log --since="2 weeks ago" --author="xiaomai"

# 查看改动差异
git diff                         # 工作区 vs 暂存区
git diff --staged                # 暂存区 vs 最近一次提交
git diff HEAD                    # 工作区 vs 最近一次提交
git diff main..feature-A         # 两个分支的差异
git diff abc123 def456           # 任意两次提交的差异

# 看看某行代码最后是谁改的（甩锅/求教神器）
git blame hello.py`,
    },
    {
      id: 'git-branch-merge',
      title: { zh: '分支：并行开发的基石', en: 'Branching: Parallel Development' },
      description: {
        zh: '特性分支工作流：从 main 拉分支干活，完了合回去。分支在 Git 里轻如鸿毛，放心大胆地用。',
        en: 'Feature-branch workflow: branch off main, do your work, merge back. Branches in Git are cheap — use them liberally.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 查看分支（* 号是当前分支）
git branch

# 创建并切换（两步合一）
git switch -c feature/login      # 新命令（Git 2.23+）
git checkout -b feature/login    # 老命令，等价

# 在分支上提交若干次后，切回主干合并
git switch main
git merge feature/login          # 把 feature/login 合进 main

# 合并完成后删除已合并分支
git branch -d feature/login

# 合并冲突长这样，手动改完再提交：
#   <<<<<<< HEAD
#   return "main 的逻辑"
#   =======
#   return "feature 的逻辑"
#   >>>>>>> feature/login
git add 冲突文件.py
git commit -m "merge: 解决登录逻辑冲突"`,
    },
    {
      id: 'git-undo',
      title: { zh: '撤销与改写历史', en: 'Undo & Rewrite History' },
      description: {
        zh: '改错了不可怕：restore 撤销改动、reset 回退提交、amend 修补最后一次提交、rebase -i 整理历史。已 push 的历史别乱改！',
        en: 'Mistakes are fixable: restore discards changes, reset rewinds commits, amend patches the last commit, rebase -i tidies history. Never rewrite pushed history!',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 撤销工作区的改动（还没 add）
git restore hello.py

# 撤销暂存（add 错了，改动保留在工作区）
git restore --staged hello.py

# 回退提交（三档，危险度递增）
git reset --soft HEAD~1   # 撤销提交，改动回到暂存区
git reset --mixed HEAD~1  # 撤销提交+暂存，改动留在工作区（默认）
git reset --hard HEAD~1   # 彻底丢弃最近一次提交 ⚠️ 不可恢复

# 修补最后一次提交（改漏了文件/写错了 message）
git add 漏掉的文件.py
git commit --amend -m "feat: 完整版提交信息"

# revert：生成一个"反向提交"来抵消，不动历史（已 push 时用）
git revert HEAD

# rebase -i：把杂乱的小提交压缩整理（push 前用）
git rebase -i HEAD~3   # 把最近 3 条 squash 成一条

# 找回被 reset --hard 丢掉的提交
git reflog             # 所有 HEAD 变动记录，后悔药本药`,
    },
  ],
};

/** GitHub 协作（对应《GitHub 入门与实践》第 3、5-7 章） */
export const gitCollab: GuideCategory = {
  id: 'git-collab',
  title: { zh: 'GitHub 协作流', en: 'GitHub Collaboration' },
  topics: [
    {
      id: 'git-ssh-remote',
      title: { zh: 'SSH Key 与远程推送', en: 'SSH Keys & Pushing' },
      description: {
        zh: '配好 SSH Key 后 push/pull 不再需要密码。第一次把本地仓库推上 GitHub 的完整流程都在这。',
        en: 'With SSH keys configured, push/pull needs no password. The complete flow of pushing a local repo to GitHub for the first time.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 1. 生成 SSH 密钥对（已有可跳过）
ssh-keygen -t ed25519 -C "xiaomai@example.com"
# 一路回车，生成 ~/.ssh/id_ed25519（私钥）和 .pub（公钥）

# 2. 把公钥内容贴到 GitHub → Settings → SSH Keys
cat ~/.ssh/id_ed25519.pub

# 3. 测试连接
ssh -T git@github.com
# Hi xiaomai! You've successfully authenticated...

# 4. 本地仓库关联 GitHub 上的空仓库并首次推送
git remote add origin git@github.com:xiaomai/my-project.git
git branch -M main            # 确保主分支叫 main
git push -u origin main       # -u 建立跟踪关系，之后直接 git push

# 查看/修改远程地址
git remote -v
git remote set-url origin git@github.com:xiaomai/new-name.git`,
    },
    {
      id: 'git-pr-flow',
      title: { zh: 'Pull Request 工作流', en: 'The Pull Request Workflow' },
      description: {
        zh: '团队协作的标准姿势：拉分支 → 提交 → 推送 → 开 PR → Code Review → 合并。PR 是讨论代码的地方，不只是合并按钮。',
        en: 'The standard team workflow: branch → commit → push → open PR → code review → merge. A PR is a place to discuss code, not just a merge button.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 1. 从最新的 main 拉出特性分支
git switch main
git pull
git switch -c feature/order-export

# 2. 干活并提交（小而多次）
git add .
git commit -m "feat(order): 导出接口支持 CSV"

# 3. 推送到远程同名分支
git push -u origin feature/order-export

# 4. 到 GitHub 网页上点 "Compare & pull request"，填写：
#    - 标题：feat(order): 订单导出支持 CSV
#    - 描述：改了什么、为什么、怎么自测的、截图
#    - Reviewers：@同事
# 5. 同事评论 → 本地修改 → 继续 push（PR 自动更新）
git add .
git commit -m "fix: 处理空订单的边界情况"
git push

# 6. 合并后清理：GitHub 上删远程分支，本地同步
git switch main
git pull
git branch -d feature/order-export
git fetch --prune   # 清理本地记录里已删除的远程分支`,
    },
    {
      id: 'git-pull-conflict',
      title: { zh: '同步与冲突处理', en: 'Sync & Conflict Resolution' },
      description: {
        zh: 'fetch 只看不摸，pull = fetch + merge。冲突不是事故，是两个改动撞车的正常信号，解决套路是固定的。',
        en: 'fetch downloads without touching; pull = fetch + merge. Conflicts are not accidents — just colliding changes with a fixed resolution routine.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# fetch：只下载远程最新状态，不改你的工作
git fetch origin
git log HEAD..origin/main --oneline   # 看看远程多了哪些提交

# pull = fetch + merge（开始干活前先 pull）
git pull origin main

# pull 冲突的标准处理流程：
# 1. Git 提示 CONFLICT，git status 列出冲突文件
git status
# 2. 打开文件，找到冲突标记，手动改成正确内容
#    <<<<<<< HEAD
#    你的改动
#    =======
#    远程的改动
#    >>>>>>> origin/main
# 3. 标记为已解决并完成合并
git add 冲突文件.py
git commit -m "merge: 同步 main 并解决冲突"

# 想完全放弃这次合并，回到 pull 之前
git merge --abort

# 进阶：pull --rebase 让历史保持一条直线（团队约定优先）
git pull --rebase origin main`,
    },
    {
      id: 'git-tag-release',
      title: { zh: '标签与版本发布', en: 'Tags & Releases' },
      description: {
        zh: 'tag 给重要提交（通常是发版）打永久书签；GitHub Release 在 tag 基础上附上更新说明和产物。',
        en: 'Tags put permanent bookmarks on important commits (usually releases); GitHub Releases attach notes and artifacts to a tag.',
      },
      lang: 'bash',
      langLabel: 'Bash',
      color: BASH_COLOR,
      code: `# 语义化版本号：主版本.次版本.修订号（v1.2.3）
#   主版本：不兼容的 API 变更
#   次版本：向后兼容的新功能
#   修订号：向后兼容的 bug 修复

# 附注标签（推荐）：带说明、作者、日期，可签名
git tag -a v1.0.0 -m "首个正式版：用户/订单/支付模块"

# 给历史提交补标签
git tag -a v0.9.0 abc1234 -m "内测版"

# 推送标签（push 默认不带标签）
git push origin v1.0.0
git push origin --tags        # 推送全部本地标签

# 查看与删除
git tag -l "v1.*"
git tag -d v0.9.0                    # 删本地
git push origin --delete v0.9.0      # 删远程

# 之后到 GitHub → Releases → Draft a new release
# 选择 tag，写更新说明（What's Changed 可自动生成），发布`,
    },
  ],
};
