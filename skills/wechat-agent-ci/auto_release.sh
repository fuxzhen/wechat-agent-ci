#!/bin/bash
set -e

echo "🌟 启动 V3.0 全栈部署..."

echo "🛡️ 环节 1: 运行 Jest 单元测试 (CI)"
cd frontend && npm test && cd ..

echo "🚀 环节 2: 微信公众平台上传 (CD)"
cd frontend && node deploy.js && cd ..

echo "👉 环节 3: 后端云端同步"
cd backend && git add . && git commit -m "OpenClaw V3.0 发版" && git push origin main && cd ..

echo "✅ 部署完美收官！"
