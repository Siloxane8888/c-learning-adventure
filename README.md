# 📘 C 语言闯关学习平台

> 基于《C Primer Plus》的交互式 C 语言学习网站 — 闯关式教学 × 在线编码 × AI 辅助

![License](https://img.shields.io/badge/license-MIT-blue)
![Levels](https://img.shields.io/badge/levels-10-orange)
![Platform](https://img.shields.io/badge/platform-web%20%7C%20windows-lightgrey)

## ✨ 特性

- 🎮 **10 关闯关式学习** — 从 Hello World 到指针，系统覆盖 C 语言核心知识
- ✍️ **在线代码编辑器** — 浏览器内编写、运行、验证 C 代码
- 🤖 **AI 驱动的关卡设计** — 基于《C Primer Plus》的渐进式教学体系
- 💡 **三层提示系统** — 逐步揭示，防止卡关
- ⭐ **额外挑战** — 每关附带进阶题目
- 🏆 **XP 进度追踪** — 通关得分，激励持续学习
- 🎨 **精致暗色主题** — 护眼设计，适合长时间编码学习

## 🚀 快速开始

### 前提条件

- [Node.js](https://nodejs.org/) 18+
- （可选）GCC 编译器 — 用于完整编译运行 C 代码

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/c-learning-adventure.git
cd c-learning-adventure

# 安装依赖
npm install

# 启动服务器
npm start
```

浏览器访问 `http://127.0.0.1:4567`

### 安装 C 编译器（可选）

```bash
# Windows — 双击运行
install-gcc.bat

# 或手动安装 MinGW-w64 并加入 PATH
```

> 💡 **即使没有编译器**，内置的 JavaScript C 模拟器也能运行 9/10 关卡的代码！

## 📚 学习路径

| 关卡 | 主题 | XP | 核心知识点 |
|------|------|-----|-----------|
| 1 | 你好，世界！ | 50 | `main`、`printf`、`#include` |
| 2 | 变量与数据类型 | 70 | `int`/`float`/`char`、声明、格式化输出 |
| 3 | 输入输出 | 70 | `scanf`、地址符 `&`、格式说明符 |
| 4 | 条件判断 | 80 | `if`/`else if`/`else`、比较运算符、逻辑运算符 |
| 5 | 循环 | 80 | `for`/`while`、`break`/`continue` |
| 6 | 数组 | 90 | 声明、遍历、求和、找最大值 |
| 7 | 函数 | 100 | 定义、声明、参数、返回值、`void` |
| 8 | 指针 | 120 | `&` 取地址、`*` 解引用、`swap` 示例 |
| 9 | 字符串 | 90 | `strlen`、`strcpy`、`ctype.h` 函数 |
| 10 | 结构体 | 100 | `struct` 定义、`typedef`、数组成员 |

## 🏗️ 技术架构

```
c-learning-adventure/
├── server.js              # Node.js 后端（Express）
├── c-simulator.js         # JavaScript C 代码模拟器
├── public/
│   └── index.html         # 前端界面（单文件 SPA）
├── levels/
│   └── levels.json        # 10 关完整教学数据
├── package.json
└── install-gcc.bat        # Windows GCC 安装脚本
```

- **后端**: Node.js + Express
- **前端**: 原生 HTML/CSS/JS（零构建工具）
- **代码执行**: GCC 编译器（主） + JS 模拟器（后备）
- **样式**: 暗色主题 · Inter 字体 · 响应式布局

## 🔒 安全

- 危险函数拦截（`system()`、`fork()` 等）
- 5 秒运行超时
- 100KB 输出上限
- 仅监听本地回环地址 `127.0.0.1`

## 📄 许可证

MIT License — 详见 [LICENSE](LICENSE)

---

**⭐ 如果这个项目对你有帮助，请给一个 Star！**
