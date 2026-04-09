# 微信小程序全栈开发助手

> 一句话需求，自动完成微信小程序开发

## ✨ 能力

- **一句话开发**：任意微信小程序功能需求，说出来就能做
- **全流程自动**：需求分析 → 代码生成 → 预览测试 → 部署发布
- **4 阶段 SOP**：需求评审 → TDD → 编码自测 → 预览发版

## 🚀 快速开始

### 1. 配置项目
```bash
# 复制配置模板
cp .env.example .env

# 填入真实 AppID 和密钥
# APP_ID=wxxxxxxxxxxxxxx
# PRIVATE_KEY_PATH=./private.key

# 安装依赖
npm install
```

### 2. 开始开发
直接告诉 AI 你的需求，例如：
- "帮我在首页加个签到按钮"
- "帮我做个衣橱管理功能"
- "加个智能推荐算法"

AI 会按 4 阶段 SOP 执行：
1. 输出【方案确认书】→ 等待你确认
2. 编写测试用例
3. 编写代码 + 自测
4. 生成预览二维码

### 3. 发布
确认后自动上传到微信后台

## 📁 项目结构

```
miniprogram-3/
├── preview.js      # 生成预览二维码
├── deploy.js      # 上传发布
├── pages/         # 页面
├── components/    # 组件
└── cloudfunctions/ # 云函数
```

## 📖 使用示例

```
> 用户：帮我做个打卡功能

🤖 AI：请评审方案...
[输出方案确认书]

> 用户：确认

🤖 AI：开始开发...
[自动编码、自测]

🤖 AI：完成！请扫码预览
[发送预览二维码]

> 用户：确认发版

🤖 AI：已发布！
```

## 📦 安装到本地

```bash
git clone https://github.com/fuxzhen/wechat-agent-ci.git
cd wechat-agent-ci
```

---

Star ⭐ 本项目支持！