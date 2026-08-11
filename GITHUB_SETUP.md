# 🚀 推送到 GitHub 指南

## 仓库已就绪

代码已提交到本地 Git 仓库（commit `180b3b3`），只需推送到 GitHub。

## 方式一：使用 GitHub CLI（推荐）

```bash
# 1. 登录 GitHub
gh auth login

# 2. 创建仓库并推送
gh repo create c-learning-adventure --public --source=. --remote=origin --push
```

## 方式二：手动推送

1. 在 https://github.com/new 创建一个新仓库（名称: `c-learning-adventure`）
2. 运行以下命令：

```bash
cd D:/c-learning-adventure
git remote add origin https://github.com/YOUR_USERNAME/c-learning-adventure.git
git branch -M main
git push -u origin main
```

## 方式三：通过 VS Code

1. 用 VS Code 打开 `D:\c-learning-adventure`
2. 左侧 Source Control → 点击 `...` → `Remote` → `Add Remote`
3. 粘贴 GitHub 仓库 URL
4. 点击 `Publish Branch`

---

💡 推送完成后，其他人就可以 `git clone` 并使用了！
