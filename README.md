# 📘 C 语言闯关学习平台

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Levels](https://img.shields.io/badge/levels-59-orange)](https://github.com/Siloxane8888/c-learning-adventure)
[![Node](https://img.shields.io/badge/node-18%2B-brightgreen)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/Siloxane8888/c-learning-adventure)

> 基于《C Primer Plus》的交互式 C 语言学习网站 — 闯关式教学 × 在线编码 × 成就系统

**在线体验：** `http://127.0.0.1:4567`（本地运行）

---

## ✨ 功能特性

### 🎮 59 关闯关式学习
- **14 个章节 × 45 个常规关卡** — 从 Hello World 到指针、位操作、综合实战
- **14 个章末挑战（🏆）** — 每章末尾的综合挑战，从零编码，无初始代码
- **关卡锁定机制** — 前一关通关后解锁下一关；章末挑战需完成该章全部关卡
- 基于《C Primer Plus》知识体系，渐进式设计

### ✍️ 在线编码环境
- 浏览器内实时编写、编译、运行 C 代码
- **真实编译器支持**：GCC（MinGW-w64）或 MSVC（Visual Studio）
- **JS 模拟器后备**：无编译器时也能运行绝大多数代码
- MSVC/GCC 双编译器自动检测
- 5 秒运行超时 · 100KB 输出上限 · 危险函数拦截

### 🏆 成就系统
- **9 枚成就徽章**：闯关数 + XP 双维度
- 实时弹出动画提示
- 成就进度条（侧栏底部）

| 图标 | 名称 | 条件 |
|------|------|------|
| 🌱 | 初出茅庐 | 完成 1 关 |
| 🥉 | 小有所成 | 完成 5 关 |
| 🥈 | 炉火纯青 | 完成 10 关 |
| 🥇 | 登峰造极 | 完成 20 关 |
| 👑 | 大满贯 | 完成全部 36 关 |
| ⭐ | 编程学徒 | 100 XP |
| 🌟 | C语言专家 | 500 XP |
| 💎 | 编程大师 | 1000 XP |
| 🔥 | C语言传奇 | 2000 XP |

### 🎨 精致体验
- **暗色主题** — 护眼设计，适合长时间编码学习
- **开始界面 + 代码雨背景** — Canvas 黑客帝国风格动画
- **新手教程引导** — 首次使用 5 步交互式引导
- **三层提示系统** — 逐步揭示，防止卡关
- **Visual Studio 环境搭建教程** — 保姆级图文教学，从下载到运行

---

## 🚀 快速开始

### 前置要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| [Node.js](https://nodejs.org/) | 18+ | 必需，用于运行服务器 |
| GCC 或 MSVC | 任意版本 | 可选 — 用于真实编译运行 C 代码 |

> 💡 **即使没有 C 编译器，内置的 JavaScript C 模拟器也能运行绝大部分代码！**

### 安装运行

```bash
# 1. 克隆仓库
git clone https://github.com/Siloxane8888/c-learning-adventure.git
cd c-learning-adventure

# 2. 安装依赖（仅一个包：express）
npm install

# 3. 启动服务器
npm start
```

浏览器访问 **http://127.0.0.1:4567**

### 安装 C 编译器（可选，推荐）

**Windows:**
```bash
# 双击运行（自动检测 winget 安装 MinGW-w64）
install-gcc.bat

# 或手动安装 MinGW-w64 并加入 PATH
```

**macOS:**
```bash
# Xcode Command Line Tools 自带 clang（兼容 gcc 语法）
xcode-select --install
```

**Linux:**
```bash
sudo apt install gcc    # Debian/Ubuntu
sudo dnf install gcc    # Fedora
```

---

## 📚 学习路径

| 章节 | 常规关卡 | 章末挑战 | XP 范围 | 核心知识点 |
|------|---------|---------|---------|-----------|
| 第1章 · 初识C语言 | 2 | 🏆 | 30-60 | `main`、`printf`、`#include`、注释、缩进 |
| 第2章 · 数据与变量 | 3 | 🏆 | 40-75 | `int`/`float`/`char`、声明、赋值、`scanf`、格式化IO |
| 第3章 · 运算符与表达式 | 2 | 🏆 | 40-75 | 算术、复合赋值、自增自减、比较、逻辑、三目 |
| 第4章 · 控制流 | 4 | 🏆 | 45-90 | `if`/`else`、`switch`/`case`、`for`、`while`、嵌套 |
| 第5章 · 字符输入输出 | 3 | 🏆 | 45-85 | `getchar`/`putchar`、`ctype.h`、缓冲区清理、输入验证 |
| 第6章 · 数组 | 2 | 🏆 | 50-85 | 一维数组、遍历、排序（冒泡、插入）、查找 |
| 第7章 · 函数 | 4 | 🏆 | 45-90 | 定义调用、递归、`math.h`、作用域、`static`、gcd 算法 |
| 第8章 · 指针 | 4 | 🏆 | 60-100 | `&`/`*`、指针与数组、指针与函数、动态内存 `malloc` |
| 第9章 · 字符串 | 2 | 🏆 | 55-85 | `strlen`、`strcmp`、`ctype.h` 字符分类 |
| 第10章 · 结构体与联合 | 3 | 🏆 | 50-90 | `struct`、`typedef`、`union`、结构体数组、`enum` |
| 第11章 · 位操作 | 2 | 🏆 | 50-80 | `&` `\|` `^` `~`、`<<` `>>`、位掩码、权限标志 |
| 第12章 · 文件操作 | 1 | 🏆 | 60-90 | `fopen`、`fprintf`、`fscanf`、`fclose`、追加模式 |
| 第13章 · 预处理与标准库 | 3 | 🏆 | 45-75 | `#define`、`#undef`、预定义宏、条件编译、`qsort`、`rand` |
| 第14章 · 综合实战 | 10 | 🏆 | 75-120 | 猜数字、计算器、成绩统计、素数、回文、排序、RLE、进制转换、俄罗斯方块计分板 |

**总计：59 关 · 14 章末挑战 · 对齐《C Primer Plus》16/17 章**

> 📖 开始界面提供 **C Primer Plus 原书链接**和 **📋 附录速查**（运算符优先级表、ASCII 码表、C 关键字、格式说明符、转义序列）

---

## 🏗️ 技术架构

```
c-learning-adventure/
├── server.js                # Node.js 后端（Express）
├── c-simulator.js           # JavaScript C 语言模拟器
├── public/
│   └── index.html           # 前端界面（单文件 SPA）
├── levels/
│   └── levels.json          # 59 关完整教学数据
├── progress.example.json    # 用户进度模板
├── package.json
├── install-gcc.bat          # Windows GCC 自动安装脚本
└── compile-msvc.bat         # MSVC 编译包装器
```

| 层 | 技术 | 说明 |
|----|------|------|
| **后端** | Node.js + Express | API 服务器，编译器调度 |
| **前端** | 原生 HTML/CSS/JS | 零构建工具的单文件 SPA |
| **代码执行** | GCC / MSVC（主） + JS 模拟器（后备） | 自动检测编译器，模拟器兜底 |
| **数据** | JSON 文件存储 | 关卡数据和用户进度均本地存储 |
| **样式** | CSS Variables 暗色主题 | Inter 字体 · 响应式布局 |

---

## 🔒 安全

- 危险函数拦截：`system()`、`exec()`、`fork()`、`socket()` 等
- 5 秒运行超时自动终止
- 100KB 输出上限
- 服务器仅监听本地回环地址 `127.0.0.1`
- 不连接外部 API，无数据上传

---

## 📖 使用说明

### 基本操作

1. **开始界面** → 点击「开始学习」进入闯关页面
2. **选择关卡** → 左侧边栏按章节浏览，点击关卡名加载
3. **阅读教学** → 中间面板查看知识点和任务
4. **编写代码** → 右侧编辑器修改代码
5. **运行测试** → 点击「▶ 运行」查看输出
6. **提交挑战** → 输出正确后点击「✅ 提交挑战」
7. **下一关** → 通关后底部出现「下一关」按钮

### 按钮说明

| 按钮 | 功能 |
|------|------|
| 🏠 | 返回开始界面 |
| 💡 提示 | 打开三层提示弹窗 |
| ▶ 运行 | 编译并运行当前代码 |
| ✅ 提交挑战 | 验证输出、获得 XP、解锁成就 |
| ⭐ 额外挑战 | 切换到额外挑战模式（部分关卡有） |
| ＋ 新建学习会话 | 重置当前关卡选择 |

### Visual Studio 教程

开始界面点击「🛠️ VS 环境搭建教程」即可查看完整图文教程，涵盖：
- VS Community 2022 下载安装
- C++ 桌面开发工作负载配置
- 创建第一个 C 项目
- 常见问题排查
- 快捷键速查

---

## 🔧 配置说明

### 编译器自动检测

服务器启动时按以下优先级搜索编译器：

1. **GCC** — 检测 `PATH`、常见安装目录、winget 包
2. **MSVC** — 检测 VS 2022/2019 标准路径、环境变量

检测成功后编译 C 代码并返回真实输出；检测失败则使用内置 JS 模拟器。

### 端口修改

编辑 `server.js` 第 10 行：

```js
const PORT = 4567;  // 改为你需要的端口
```

---

## ⚠️ 常见问题

<details>
<summary><strong>网页打开后侧栏没有关卡？</strong></summary>
确认是通过 <code>http://127.0.0.1:4567</code> 访问（服务器运行中），而非直接打开 HTML 文件。
</details>

<details>
<summary><strong>提交代码时报「字符串字面量中的换行符」？</strong></summary>
MSVC 编译器的换行符兼容问题。已在最新版本修复，确保代码编辑器中不使用裸回车符。
</details>

<details>
<summary><strong>npm install 报错？</strong></summary>
确保 Node.js 版本 ≥ 18：<code>node --version</code>。如果使用 nvm，先切换版本。
</details>

<details>
<summary><strong>如何重置学习进度？</strong></summary>
删除项目根目录下的 <code>progress.json</code>，重启服务器会自动从模板重建。
</details>

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

- 关卡内容优化
- 新增教学关卡
- 前端 UI 改进
- 编译器兼容性增强

---

## 📄 许可证

MIT License — 详见 [LICENSE](LICENSE)

---

**⭐ 如果这个项目对你有帮助，请给一个 Star！**
