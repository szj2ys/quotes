#!/bin/sh

# 构建 React 应用程序
npm run build
npm run export
# 部署github pages
npm run deploy
# 清理 build 文件夹
rm -rf build

