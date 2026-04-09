#!/bin/bash
set -e

echo "🌟 全栈一键部署 V3.0..."

# 前端目录
FRONTEND="/Users/xzfu/WeChatProjects/miniprogram-3"
# 后端目录  
BACKEND="/Users/xzfu/Documents/小程序-PRD/Style"

echo "🚢 前端部署..."
cd "$FRONTEND"
node deploy.js

echo "📦 后端部署..."
cd "$BACKEND"
git add .
git commit -m "deploy: $(date '+%Y-%m-%d %H:%M')" 
git push origin main

echo "✅ 全部完成！"