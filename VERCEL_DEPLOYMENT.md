# Vercel 部署指南

本项目现在支持同时部署到 GitHub Pages 和 Vercel。

## Vercel 部署配置

### 1. 在 Vercel 中创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 选择 Next.js 框架
5. 部署项目

### 2. 获取必要的环境变量

在 Vercel 项目设置中获取以下信息：

- **VERCEL_TOKEN**: 在 Vercel Account Settings > Tokens 中创建
- **ORG_ID**: 在项目设置的 General 标签页中找到
- **PROJECT_ID**: 在项目设置的 General 标签页中找到

### 3. 在 GitHub 中配置 Secrets

在你的 GitHub 仓库中：

1. 进入 Settings > Secrets and variables > Actions
2. 添加以下 Repository secrets：
   - `VERCEL_TOKEN`: 你的 Vercel token
   - `ORG_ID`: 你的 Vercel 组织 ID
   - `PROJECT_ID`: 你的 Vercel 项目 ID

### 4. 部署方式

#### 自动部署
- 推送到 `main` 或 `master` 分支时自动触发部署
- GitHub Actions 会同时部署到 GitHub Pages 和 Vercel

#### 手动部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到 Vercel
npm run deploy:vercel
```

## 项目配置说明

### next.config.ts
- 移除了 `output: 'export'` 配置以支持 Vercel 的服务端渲染
- 保留了 `trailingSlash: true` 以保持 URL 一致性

### vercel.json
- 配置了 Vercel 的构建和输出设置
- 指定了 Next.js 框架

### package.json
- 修改了 `start` 脚本使用 `next start`
- 添加了 `deploy:vercel` 脚本用于手动部署

## 注意事项

1. Vercel 部署支持服务端渲染，而 GitHub Pages 只支持静态文件
2. 如果你的应用使用了服务端功能，建议主要使用 Vercel 部署
3. GitHub Pages 部署仍然保留，可以作为备用或静态版本