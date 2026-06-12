---
title: Hexo GitHub Pages 踩坑笔记
date: 2026-06-11 20:06:00
tags: [Hexo, GitHub Pages, CI/CD, GitHub Actions, 踩坑]
categories: 踩坑笔记
---


本文记录我搭建 Hexo 博客过程中遇到的各种坑和解决方案，希望能帮到遇到同样问题的朋友。

## 坑 1：Hexo 7 的破坏性更新

Hexo 7 移除了许多默认依赖，导致构建失败：

**问题表现：**
- SCSS 文件无法编译
- EJS 模板显示原始代码
- `hexo server` 命令不存在

**解决方案：**

```bash
# 安装 SCSS 编译器
npm install sass

# 安装 EJS 渲染器
npm install hexo-renderer-ejs

# 安装开发服务器
npm install hexo-server
```

## 坑 2：GitHub Actions 部署权限错误

**问题表现：**
```
remote: Permission to xxx/xxx.github.io.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/xxx/xxx.github.io.git/': The requested URL returned error: 403
```

**原因：** GitHub Actions 默认的 `GITHUB_TOKEN` 没有写权限

**解决方案：** 在 workflow 中添加权限配置：

```yaml
permissions:
  contents: write
```

## 坑 3：CSS 文件 404 错误

**问题表现：** 网站打开后样式丢失，浏览器控制台报 `main.css: 404`

**原因：** NexT 主题使用 Stylus 编写样式，需要 Stylus 渲染器

**解决方案：**

```bash
npm install hexo-renderer-stylus
```

## 坑 4：主题切换的坑

最初我尝试使用 `npm install hexo-theme-next` 安装主题，但生成的内容没有样式。

**根本原因：** 主题文件没有被正确加载，导致 `main.styl` 不会被编译。

**最终方案：** 使用 Git Submodule 管理主题

```bash
# 初始化主题子模块
git submodule add https://github.com/ahonn/hexo-theme-even.git themes/even

# 更新主题
cd themes/even
git pull origin master
```

**优势：**
- 主题独立管理，不污染主仓库
- 版本可锁定，避免破坏性更新
- 方便后期维护和升级

## 坑 5：CI/CD 中 SCSS 编译失败

**问题表现：** 本地构建正常，GitHub Actions 构建失败

**原因：** 工作流中没有调用 SCSS 编译脚本

**解决方案：**

1. 创建编译脚本 `scripts/compile-scss.js`：

```javascript
const sass = require('sass');
const fs = require('fs');
const path = require('path');

function compileScss() {
  const scssPath = 'themes/even/source/css/style.scss';
  const cssPath = 'themes/even/source/css/style.css';
  
  const result = sass.compile(scssPath);
  fs.writeFileSync(cssPath, result.css);
  console.log('SCSS compiled successfully!');
}

compileScss();
```

2. 修改 `package.json`：

```json
{
  "scripts": {
    "build": "node scripts/compile-scss.js && hexo generate"
  }
}
```

## 坑 6：子模块提交找不到

**问题表现：**
```
Fetched in submodule path 'themes/even', but it did not contain xxx. Direct fetching of that commit failed.
```

**原因：** 在子模块中做了修改但没有推送到远程

**教训：** 不要修改第三方主题仓库的代码！

## 坑 7：双仓库部署的权限噩梦（血的教训！）

在采用**同一个仓库、不同分支**的方案之前，我踩过更大的坑——**分两个 GitHub 仓库**部署：

- 一个 **private 私有仓库** 存放 Hexo 源码
- 一个 **public 公开仓库**（即 `homleening.github.io`）存放生成的静态文件

### 方案设想

```
private 仓库 (源码)                    public 仓库 (静态文件)
  main 分支                                main 分支
    ├── source/                              ├── index.html
    ├── themes/                              ├── css/
    └── _config.yml                          └── js/
         │                                          ▲
         │     GitHub Actions 自动部署              │
         └──────────────────────────────────────────┘
              编译生成 → 推送到 public 仓库
```

### 遇到的问题

**1. 默认 `GITHUB_TOKEN` 权限不足**

GitHub Actions 默认的 `GITHUB_TOKEN` **只能作用于当前仓库**，无法推送到其他仓库（无论是 public 还是 private）。

**2. 403 权限错误**

```
remote: Permission to homleening/homleening.github.io.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/homleening/homleening.github.io.git/': The requested URL returned error: 403
```

**3. Fork 工作流也行不通**

即使是 Fork 关系，跨仓库的自动部署依然受 Token 权限限制。

### 尝试过的方案

**方案一：使用 Deploy Key**
- 为 public 仓库配置 SSH Deploy Key
- 在 private 仓库的 Secrets 中添加私钥
- **问题**：需要精细管理密钥对，每次更换密钥都麻烦
- **问题**：没有 fine-grained 权限控制

**方案二：使用 `GITHUB_TOKEN` + 手动触发**
- 不行！`GITHUB_TOKEN` 跨仓库天然受限

**方案三：创建 Personal Access Token (PAT)**
- 在 GitHub Settings → Developer settings → Personal access tokens
- 勾选 `repo` 全权限或 `public_repo` 权限
- 将 Token 添加到 private 仓库的 Secrets 中
- **最终能工作，但有隐患！**

### 使用高权限 PAT 的痛点

1. **Token 泄露风险**
   - 一旦 PAT 泄露，攻击者拥有你所有仓库的完全控制权
   - 日志中如果不小心打印 Token，会永久泄露

2. **权限过度授予**
   - 经典 PAT 只能选 `repo` 全权限
   - 无法只授予"推送代码到指定仓库"的最小权限
   - 违背最小权限原则

3. **Token 管理复杂**
   - 多个项目需要多个 Token
   - 定期轮换 Token 很麻烦
   - Token 失效后所有部署都会失败

4. **审计困难**
   - 不知道是哪个 workflow 在用这个 Token
   - 出问题难以追踪

### 顿悟：同仓库不同分支才是最佳实践

**核心思想：** 既然 `GITHUB_TOKEN` 默认有当前仓库的所有权限，那就**把源代码和静态文件放在同一个仓库**！

```
同一个仓库 (homleening.github.io)
  ├── main 分支（默认分支，存放 Hexo 源码）
  │     ├── source/
  │     ├── themes/
  │     └── _config.yml
  │
  └── gh-pages 分支（自动生成，存放静态文件）
        ├── index.html
        ├── css/
        └── js/
```

**优势：**

1. **零额外配置**：`GITHUB_TOKEN` 默认就能推送
2. **零安全风险**：不需要管理 PAT
3. **零成本**：GitHub Pages 本身免费
4. **权限最小化**：只需要 `contents: write` 即可
5. **审计清晰**：所有操作都在一个仓库内

### 经验总结

| 方案 | 安全性 | 复杂度 | 推荐度 |
|------|--------|--------|--------|
| 双仓库 + PAT | ❌ 低（Token 泄露风险） | ❌ 高 | ⭐ |
| 双仓库 + Deploy Key | ⚠️ 中 | ⚠️ 中 | ⭐⭐ |
| **同仓库不同分支** | ✅ 高 | ✅ 低 | ⭐⭐⭐⭐⭐ |

> **教训**：能用 GitHub 原生机制解决的，就不要引入额外的安全风险。**同仓库 + 不同分支** 是 GitHub Pages 自动部署的最佳实践！

## 总结

搭建博客的过程虽然充满挑战，但每解决一个问题都是一次成长。希望这篇踩坑笔记能帮到你！
