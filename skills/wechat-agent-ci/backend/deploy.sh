#!/bin/bash
# 后端云托管部署脚本

set -e

# 检查环境变量
if [ -z "$DASHSCOPE_API_KEY" ]; then
    echo "⚠️ 未设置 DASHSCOPE_API_KEY，将使用备用模式"
fi

echo "🚀 开始部署后端到云托管..."

# 导出 CloudBase CLI
export PATH=$PATH:/usr/local/lib/node_modules/@cloudbase/cli/bin

# 检查登录状态
echo "🔐 检查登录状态..."
tcb login check --quiet || { echo "❌ 请先登录: tcb login"; exit 1; }

# 获取环境ID
ENV_ID=$(tcb env list 2>/dev/null | grep -o "prod-[a-z0-9]*" | head -1)
if [ -z "$ENV_ID" ]; then
    echo "❌ 无法获取环境ID"
    exit 1
fi

echo "📦 环境: $ENV_ID"

# 部署云托管服务
cd /Users/xzfu/Documents/小程序-PRD/Style

echo "🐳 构建 Docker 镜像..."
docker build -t style-backend:latest . || echo "⚠️ Docker 构建失败，使用云端构建"

echo "☁️ 部署到云托管..."
tcb cloudrun deploy style-backend -e $ENV_ID --force || {
    echo "❌ 云托管部署失败"
    exit 1
}

echo "✅ 后端部署完成！"
echo "🌐 访问地址: https://$ENV_ID.service.tcbns.com"