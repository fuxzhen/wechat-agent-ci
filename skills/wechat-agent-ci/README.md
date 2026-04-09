# 🚀 WeChat-Agent-CI: 懂产品的微信小程序 AI 全自动发版引擎

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#)
[![AI Agent Ready](https://img.shields.io/badge/AI_Agent-OpenClaw_Ready-blue.svg)](#)
[![Miniprogram CI](https://img.shields.io/badge/WeChat-miniprogram--ci-success.svg)](#)

> **“不要让 AI 像黑盒一样盲目写代码，让它先交出交互方案与 PRD。”**
>
> 这是一个专为大模型时代（如配合 OpenClaw、Cursor 等 Agent）打造的微信小程序全栈自动化脚手架。它彻底重塑了 AI 编程的工作流：**将枯燥的 CI/CD 部署，升级为包含「可视化交互评审 -> TDD 测试驱动 -> 扫码预览 -> 云端发布」的完美闭环。**

## ✨ 为什么你需要它？(Core Philosophy)

在 AI 辅助开发的浪潮中，我们发现最痛苦的往往不是“写代码”，而是“失控的体验”和“繁琐的部署”。传统的微信开发者工具强依赖人工点击，且 AI 经常会产生逻辑幻觉。

**WeChat-Agent-CI (V3.0) 带来了全新的产品级工作流：**

* 🎨 **设计与逻辑先行 (Mini-PRD 评审)：** 强制 AI 在修改代码前，先用自然语言和 ASCII 字符画输出**界面改动对比图 (Before vs After)**。老板点头确认，AI 才准动键盘。完美契合产品体验设计的严苛要求。
* 🛡️ **测试驱动的质量守门员 (TDD 闭环)：** 告别“跑通就算赢”。内置 Jest + Miniprogram-simulate，强制 AI 先写测试用例，自测跑通 100% 绿灯后，才能进入发布环节。
* ⚡️ **0 GUI 极速终端体验：** 彻底告别微信开发者工具的图形界面。一条指令，Agent 自动在终端生成预览二维码，拿起手机直接扫码体验最新交互。
* 🔒 **极致的安全隔离：** 标准化 `.env` 环境变量注入，配合严密的 `.gitignore`，确保你的 `AppID` 和 `private.key` 永远不会侧漏到开源社区。

---

## 🛠️ 快速上手 (Quick Start)

### 1. 环境准备 (Prerequisites)
* 前往 [微信公众平台](https://mp.weixin.qq.com/) -> 开发 -> 开发管理 -> 开发设置 -> **小程序代码上传**。
* 生成并下载**上传密钥**，重命名为 `private.{{YOUR_APP_ID}}.key`。
* 关闭 IP 白名单限制（或配置你当前的 IP）。

### 2. 安装与配置 (Installation)
你可以点击右上角的 **Use this template** 直接使用本脚手架，或者执行：

```bash
git clone [https://github.com/fuxzhen/wechat-agent-ci.git](https://github.com/fuxzhen/wechat-agent-ci.git)
cd wechat-agent-ci/frontend
npm install

配置环境变量：

在项目根目录下，复制 .env.example 并重命名为 .env。

在 .env 中填入你的真实 WX_APP_ID。

将下载的密钥文件（private.*.key）放入 frontend/ 目录中。

🧙‍♂️ AI Agent 食用指南 (The Magic Workflow)
本项目天生自带“机器可读”的灵魂说明书。如果你使用 OpenClaw 或其他本地 Agent，只需让 Agent 读取根目录下的 SKILL.md。

随后，你可以直接对 Agent 下达极其模糊的业务指令，例如：

"帮我在首页加个大按钮，点击能根据《易经》的逻辑，随机推荐一套今日穿搭。"

Agent 将自动触发以下 V3.0 终极工作流：

📝 方案输出阶段： Agent 会向你展示新增状态的逻辑，并画出 UI 按钮前后的排版变化图，等待你的“确认”。

🧪 测试生成阶段： 得到确认后，Agent 默默在后台生成 Jest 测试用例。

💻 编码与自测阶段： 修改业务代码，自动执行 npm test，若报错则自我修正。

📱 扫码预览阶段： Agent 自动拉起微信 CI 引擎，在屏幕上为你打印出绿色的预览二维码。

🚀 一键全栈发版： 测试满意后，执行根目录的 ./auto_release.sh，完成微信提审与后端 Git 推送。

📂 工程目录树
Plaintext
wechat-agent-ci/
├── frontend/                   # 微信小程序代码 & 测试沙箱
│   ├── __tests__/              # 自动化测试用例存放区
│   ├── preview.js              # 自动生成预览二维码脚本
│   ├── deploy.js               # 自动上传微信提审脚本
│   ├── babel.config.js         # 测试环境转译配置
│   ├── jest.config.js          # 测试框架配置
│   └── private.key             # ⚠️ 微信上传密钥（受 .gitignore 保护）
├── backend/                    # 后端服务代码（可选）
├── SKILL.md           # 🤖 核心：喂给 AI 的 SOP 行为准则
├── auto_release.sh             # 全自动发版 & 测试关卡 Shell 脚本
├── .env.example                # 环境变量模板
└── README.md                   # 本文件
🤝 参与共建
无论你是热爱折腾 AI 自动化的极客，还是关注用户界面与交互逻辑的产品设计者，我们都欢迎你提交 PR 或 Issue。一起探索 Generative UI 与 Agent 时代的开发新范式！

如果你觉得这个工具帮你省下了与机器沟通的心智负担，欢迎点个 Star ⭐️ 鼓励一下！
