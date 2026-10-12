# HexoBlog

个人博客，基于 Hexo + [even](https://github.com/ahonn/hexo-theme-even) 主题，托管于 GitHub Pages。

线上地址：<https://homleening.github.io/>

## 环境准备

```bash
npm install        # 安装依赖
```

## 写文章

新建文章：在 `source/_posts/` 下创建 Markdown 文件，命名格式：

```
YYYYMMDD-分类-标题.md
例：20261002-技术-AI不会让你失业，但"只会用AI"的人会被淘汰.md
```

文件头部 front-matter 示例：

```yaml
---
title: 文章标题
date: 2026-10-02 08:06:00
tags: [随笔, AI]
categories: 技术
---
```

说明：

- 文章图片放在同名资源文件夹中（`post_asset_folder: true`），引用方式 `![](图片名.png)`
- 首页摘要：默认自动提取正文前两段（见 `scripts/auto-excerpt.js`）
  - 想自定义摘要：front-matter 中加 `description: 摘要内容`
  - 想手动控制截断位置：正文中插入 `<!-- more -->`

## 本地预览

```bash
npm run clean      # 清理缓存
npm run dev        # 启动本地服务 http://localhost:4000
```

## 发布与更新

写完文章后推送到 main 分支，GitHub Actions 会自动构建并部署到 GitHub Pages：

```bash
git add .
git commit -m "feat: 新增文章 xxx"
git push
```

流水线配置见 `.github/workflows/deploy.yml`，流程为：`npm install` → `hexo clean` → `npm run build`（编译 SCSS + 生成静态文件）→ 发布 `public/` 到 `gh-pages` 分支。

也可本地手动部署（`deploy.type: git`）：

```bash
npm run build
npx hexo deploy
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 本地预览 |
| `npm run build` | 编译 SCSS 并生成静态文件到 `public/` |
| `npm run clean` | 清理缓存和 `public/` |
| `npx hexo deploy` | 本地部署（git 方式） |
