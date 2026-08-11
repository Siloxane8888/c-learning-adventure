# 📘 C 语言闯关学习平台

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Levels](https://img.shields.io/badge/levels-59-orange)](https://github.com/Siloxane8888/c-learning-adventure)
[![Node](https://img.shields.io/badge/node-18%2B-brightgreen)](https://nodejs.org/)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)](https://github.com/Siloxane8888/c-learning-adventure)
[![Release](https://img.shields.io/badge/release-v2.3.0-blue)](https://github.com/Siloxane8888/c-learning-adventure/releases)

> 基于《C Primer Plus》第 6 版的交互式 C 语言学习平台 — 59 关闯关式教学 × 在线编码 × 成就系统

---

## 🚀 快速开始

### 方式一：即下即用（推荐）

从 [Releases](https://github.com/Siloxane8888/c-learning-adventure/releases) 下载 `portable-*.tar.gz`，解压后双击启动：

```bash
tar -xzf portable-v2.3.0.tar.gz
cd c-learning-adventure

# Windows — 双击 start.bat
# macOS / Linux — 终端运行 ./start.sh
```

浏览器访问 **http://127.0.0.1:4567**，无需安装任何依赖。

### 方式二：npm 安装

```bash
git clone https://github.com/Siloxane8888/c-learning-adventure.git
cd c-learning-adventure
npm install
npm start
```

> 需要 [Node.js](https://nodejs.org/) 18+

---

## ✨ 功能特性

### 🎮 59 关闯关式学习

- **14 个章节 × 45 个常规关卡** — 完整对齐《C Primer Plus》第 6 版 16/17 章
- **14 个章末挑战（🏆）** — 每章末尾从零编码，无初始代码
- **精简代码模板** — 第 2 章起仅提供 `#include` + `main` 骨架，自己写代码
- **第 1 章完整引导** — 初学者直接改代码看效果，降低入门门槛
- **关卡锁定机制** — 逐关解锁；章末挑战需完成本章全部关卡

### ✍️ 在线编码环境

- 浏览器内编写、编译、运行 C 代码
- **真实编译器**：GCC（MinGW-w64）或 MSVC（Visual Studio），自动检测
- **JS 模拟器后备**：无编译器时也能运行绝大多数代码
- 10 秒执行超时 · 100KB 输出上限 · 危险函数拦截

### 🏆 成就系统

| 图标 | 名称 | 条件 | | 图标 | 名称 | 条件 |
|------|------|------|------|------|------|------|
| 🌱 | 初出茅庐 | 完成 1 关 | | ⭐ | 编程学徒 | 100 XP |
| 🥉 | 小有所成 | 完成 5 关 | | 🌟 | C语言专家 | 500 XP |
| 🥈 | 炉火纯青 | 完成 10 关 | | 💎 | 编程大师 | 1000 XP |
| 🥇 | 登峰造极 | 完成 20 关 | | 🔥 | C语言传奇 | 2000 XP |
| 👑 | 大满贯 | 完成全部 45 关 | | | | |

### 🎨 界面体验

- **暗色主题** — 护眼设计 + Inter / JetBrains Mono 字体
- **Canvas 代码雨背景** — 黑客帝国风格，帧率无关动画
- **开始界面** — 按章节浏览、VS 教程、附录速查、原书链接
- **5 步新手引导** — 首次使用自动触发
- **三层提示系统** — 逐步揭示，防止卡关
- **📋 附录速查** — 运算符优先级表 · ASCII 码表 · C 关键字 · 格式说明符 · 转义序列

---

## 📚 学习路径

| 章节 | 关卡 | 章末 | 知识点 |
|------|:----:|:----:|--------|
| 第1章 · 初识C语言 | 2 | 🏆 | `main`、`printf`、`#include`、注释、缩进 |
| 第2章 · 数据与变量 | 3 | 🏆 | `int`/`float`/`char`、声明、赋值、`scanf`、格式化 I/O |
| 第3章 · 运算符与表达式 | 2 | 🏆 | 算术、复合赋值、自增自减、比较、逻辑、三目 |
| 第4章 · 控制流 | 4 | 🏆 | `if`/`else`、`switch`/`case`、`for`、`while`、嵌套 |
| 第5章 · 字符输入输出 | 3 | 🏆 | `getchar`/`putchar`、`ctype.h`、缓冲区清理 |
| 第6章 · 数组 | 2 | 🏆 | 一维数组、遍历、冒泡排序、插入排序 |
| 第7章 · 函数 | 4 | 🏆 | 定义调用、递归、`math.h`、作用域、`static` |
| 第8章 · 指针 | 4 | 🏆 | `&`/`*`、指针与数组、指针与函数、`malloc`/`free` |
| 第9章 · 字符串 | 2 | 🏆 | `strlen`、`strcmp`、`strcpy`、`ctype.h` 字符分类 |
| 第10章 · 结构体与联合 | 3 | 🏆 | `struct`、`typedef`、`union`、结构体数组、`enum` |
| 第11章 · 位操作 | 2 | 🏆 | `&` `\|` `^` `~`、`<<` `>>`、位掩码、权限标志 |
| 第12章 · 文件操作 | 1 | 🏆 | `fopen`、`fprintf`、`fscanf`、`fclose`、追加模式 |
| 第13章 · 预处理与标准库 | 3 | 🏆 | `#define`、`#undef`、预定义宏、`qsort`、`rand` |
| 第14章 · 综合实战 | 10 | 🏆 | 猜数字、计算器、回文、排序、RLE 压缩、进制转换等 |

**总计：59 关（45 常规 + 14 章末挑战）· 对齐《C Primer Plus》16/17 章**

---

## 🏗️ 项目结构

```
c-learning-adventure/
├── server.js                # Node.js 后端（Express）
├── c-simulator.js           # JavaScript C 语言模拟器
├── public/
│   └── index.html           # 前端 SPA（单文件）
├── levels/
│   └── levels.json          # 59 关教学数据
├── start.bat / start.sh     # 一键启动脚本
├── progress.example.json    # 用户进度模板
├── package.json
└── install-gcc.bat          # Windows GCC 安装脚本
```

---

## 🔒 安全

- 危险函数拦截：`system()`、`exec()`、`fork()`、`socket()` 等
- 10 秒运行超时自动终止
- 100KB 输出上限
- 仅监听本地 `127.0.0.1`，不连接外部 API

---

## ⚠️ 常见问题

<details>
<summary><strong>网页打开后侧栏没有关卡？</strong></summary>
确认通过 <code>http://127.0.0.1:4567</code> 访问，而非直接打开 HTML 文件。
</details>

<details>
<summary><strong>提交代码报编译错误？</strong></summary>
检查代码语法，确保没有全角符号和中文标点混入。MSVC 用户如遇换行符问题请更新到最新版。
</details>

<details>
<summary><strong>如何重置学习进度？</strong></summary>
删除项目根目录下的 <code>progress.json</code>，重启服务器自动重建。
</details>

<details>
<summary><strong>npm install 报错？</strong></summary>
确保 Node.js ≥ 18：<code>node --version</code>。或直接下载 portable 版跳过此步骤。
</details>

---

## 📄 许可证

MIT License — 详见 [LICENSE](LICENSE)

---

**⭐ 如果这个项目对你有帮助，请给一个 Star！**
