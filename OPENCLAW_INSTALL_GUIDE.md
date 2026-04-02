# OpenClaw 完整安装配置指南

> 最后更新: 2026-02-20
> 目标: 一键完成所有配置

---

## 一、系统要求

- **Node.js 22+** (必需)
- **操作系统**: macOS / Linux / Windows (推荐 WSL2)
- **可选**: Docker (用于沙箱隔离)

---

## 二、快速安装 (推荐)

### 2.1 使用安装脚本 (一行命令)

**macOS / Linux / WSL2:**
```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

**Windows PowerShell:**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

> 安装脚本会自动: ✅ 检测 Node 版本 ✅ 安装 OpenClaw ✅ 运行配置向导

---

### 2.2 手动 npm/pnpm 安装

```bash
# npm 安装
npm install -g openclaw@latest
openclaw onboard --install-daemon

# 或 pnpm 安装
pnpm add -g openclaw@latest
pnpm approve-builds -g        # 批准构建脚本
openclaw onboard --install-daemon
```

---

### 2.3 源码安装 (开发者)

```bash
# 克隆并构建
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build
pnpm build

# 链接 CLI
pnpm link --global

# 配置向导
openclaw onboard --install-daemon
```

---

## 三、配置向导详解

运行 `openclaw onboard --install-daemon` 后，向导会引导你完成:

1. **认证设置** - 生成访问令牌
2. **Gateway 设置** - 端口、绑定地址
3. **通道选择** - WhatsApp、Telegram、Discord 等
4. **AI 模型** - 选择并配置模型提供商

---

## 四、核心配置结构

配置文件位置: `~/.openclaw/openclaw.json`

### 4.1 最小配置示例

```json5
{
  // 基础设置
  gateway: {
    port: 18789,
    reload: { mode: "hybrid" }
  },
  
  // AI 代理配置
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      model: {
        primary: "anthropic/claude-sonnet-4-5",
        fallbacks: ["openai/gpt-5.2"]
      }
    }
  },
  
  // 通道配置
  channels: {
    whatsapp: {
      enabled: true,
      dmPolicy: "pairing",  // pairing | allowlist | open | disabled
      allowFrom: ["+15555550123"]
    },
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing"
    },
    discord: {
      enabled: true,
      botToken: "your-bot-token",
      dmPolicy: "pairing"
    }
  }
}
```

---

### 4.2 常用配置场景

#### 🔐 DM 访问控制 (dmPolicy)

```json5
{
  channels: {
    telegram: {
      dmPolicy: "pairing",    // 默认: 未知发送者需配对码
      // dmPolicy: "allowlist", // 仅允许名单
      // dmPolicy: "open",      // 开放所有
      // dmPolicy: "disabled",  // 禁用
      allowFrom: ["tg:123456789"]  // allowlist 模式使用
    }
  }
}
```

#### 👥 群组聊天配置

```json5
{
  agents: {
    list: [
      {
        id: "main",
        groupChat: {
          mentionPatterns: ["@openclaw", "openclaw"]  // 触发词
        }
      }
    ]
  },
  channels: {
    whatsapp: {
      groups: {
        "*": { requireMention: true }  // 默认需要 @
      }
    }
  }
}
```

#### 🤖 多代理路由

```json5
{
  agents: {
    list: [
      { id: "home", default: true, workspace: "~/.openclaw/workspace-home" },
      { id: "work", workspace: "~/.openclaw/workspace-work" }
    ]
  },
  bindings: [
    { agentId: "home", match: { channel: "whatsapp", accountId: "personal" } },
    { agentId: "work", match: { channel: "whatsapp", accountId: "biz" } }
  ]
}
```

#### 🏠 工作区配置

```json5
{
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      heartbeat: {
        every: "30m",     // 检查间隔
        target: "last"    // 发送到上次对话渠道
      }
    }
  },
  session: {
    dmScope: "per-channel-peer",
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 120
    }
  }
}
```

#### 🔒 安全配置

```json5
{
  gateway: {
    auth: {
      token: "${OPENCLAW_GATEWAY_TOKEN}",  // 使用环境变量
      requireToken: true
    }
  },
  cron: {
    enabled: true,
    maxConcurrentRuns: 2
  }
}
```

#### 🌐 Webhooks

```json5
{
  hooks: {
    enabled: true,
    token: "shared-secret",
    path: "/hooks",
    defaultSessionKey: "hook:ingress",
    mappings: [
      {
        match: { path: "gmail" },
        action: "agent",
        agentId: "main",
        deliver: true
      }
    ]
  }
}
```

---

## 五、常用 CLI 命令

### Gateway 管理

```bash
# 启动 Gateway
openclaw gateway --port 18789

# 查看状态
openclaw gateway status

# 后台运行
openclaw gateway start

# 重启
openclaw gateway restart

# 停止
openclaw gateway stop
```

### 通道管理

```bash
# 登录通道
openclaw channels login

# 查看已配置通道
openclaw channels list

# 配置特定通道
openclaw channels configure telegram
```

### 配置管理

```bash
# 交互式配置向导
openclaw onboard
openclaw configure

# 查看配置
openclaw config get agents.defaults.workspace

# 设置配置
openclaw config set agents.defaults.heartbeat.every "2h"

# 重新加载配置
openclaw gateway call config.reload
```

### 健康检查

```bash
# 系统诊断
openclaw doctor

# 查看状态
openclaw status

# 查看日志
openclaw logs

# 打开控制台
openclaw dashboard
```

---

## 六、安装 Skills (功能扩展)

### 6.1 使用 ClawHub 安装

```bash
# 搜索 Skills
clawhub search "browser"
clawhub search "search"
clawhub search "agent"

# 安装 Skills
clawhub install find-skills
clawhub install tavily-search
clawhub install agent-browser
clawhub install proactive-agent --version 3.1.0

# 更新 Skills
clawhub update find-skills
clawhub update --all

# 列出已安装
clawhub list
```

### 6.2 已验证可安装的 Skills

| Skill | 用途 | 命令 |
|-------|------|------|
| find-skills | 查找和安装其他 Skills | `clawhub install find-skills` |
| tavily-search | 深度网络搜索 | `clawhub install tavily-search` |
| agent-browser | 浏览器自动化 | `clawhub install agent-browser --force` |
| proactive-agent | 主动式代理 | `clawhub install proactive-agent --version 3.1.0 --force` |
| weather | 天气查询 | `clawhub install weather` |
| github | GitHub 操作 | `clawhub install github` |
| 1password | 密码管理 | `clawhub install 1password` |
| apple-notes | Apple 备忘录 | `clawhub install apple-notes` |
| apple-reminders | Apple 提醒事项 | `clawhub install apple-reminders` |

> ⚠️ 部分 Skills 可能被 VirusTotal 标记为"可疑"，使用 `--force` 参数强制安装

---

## 七、浏览器自动化 (agent-browser)

### 安装 CLI

```bash
npm install -g agent-browser
agent-browser install
```

### 常用命令

```bash
# 打开网页
agent-browser open https://www.baidu.com --headed

# 截图
agent-browser screenshot baidu.png --full

# 获取页面元素
agent-browser snapshot -i

# 点击元素
agent-browser click @e1

# 输入文本
agent-browser fill @e2 "hello"

# 滚动页面
agent-browser scroll down 500

# 关闭浏览器
agent-browser close
```

---

## 八、文件结构说明

```
~/.openclaw/
├── openclaw.json          # 主配置文件
├── credentials/           # 认证凭据
│   ├── whatsapp/         # WhatsApp 凭据
│   ├── telegram/         # Telegram 凭据
│   └── ...
├── workspace/             # 工作区 (Skills, 记忆, 项目)
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── USER.md
│   ├── MEMORY.md
│   ├── TOOLS.md
│   ├── HEARTBEAT.md
│   ├── SKILLS/           # 安装的 Skills
│   └── memory/           # 每日笔记
└── agents/               # 代理配置
    └── <agentId>/sessions/
```

---

## 九、环境变量

```bash
# 自定义路径
export OPENCLAW_HOME=~/.openclaw
export OPENCLAW_STATE_DIR=~/.openclaw
export OPENCLAW_CONFIG_PATH=~/.openclaw/openclaw.json

# 令牌认证
export OPENCLAW_GATEWAY_TOKEN="your-token"

# API Keys (在配置中引用)
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

在配置中引用:
```json5
{
  gateway: { auth: { token: "${OPENCLAW_GATEWAY_TOKEN}" } }
}
```

---

## 十、常见问题排查

### 🔧 命令未找到

```bash
# 检查 Node 和 npm
node -v
npm -v

# 修复 PATH (添加到 ~/.zshrc 或 ~/.bashrc)
export PATH="$(npm prefix -g)/bin:$PATH"
```

### 🔄 Gateway 无法启动

```bash
# 检查配置错误
openclaw doctor

# 查看详细日志
openclaw logs --verbose

# 检查端口占用
lsof -i :18789
```

### 📦 npm 安装失败

```bash
# 清理缓存
npm cache clean --force

# 使用预构建二进制
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw
```

### 🐳 Docker 沙箱问题

```bash
# 重新构建沙箱镜像
./scripts/sandbox-setup.sh

# 测试沙箱
openclaw sandbox test
```

---

## 十一、更新与卸载

### 更新 OpenClaw

```bash
# 方法1: npm 更新
npm update -g openclaw@latest

# 方法2: 重新运行安装脚本
curl -fsSL https://openclaw.ai/install.sh | bash

# 方法3: 源码更新
git pull
pnpm install
pnpm build
```

### 迁移到新机器

```bash
# 备份配置
cp ~/.openclaw/openclaw.json openclaw-backup.json
cp -r ~/.openclaw/workspace ~/openclaw-workspace-backup

# 在新机器安装
curl -fsSL https://openclaw.ai/install.sh | bash

# 恢复配置
cp openclaw-backup.json ~/.openclaw/openclaw.json
cp -r ~/openclaw-workspace-backup ~/.openclaw/workspace
```

### 完全卸载

```bash
# macOS (Homebrew)
brew uninstall openclaw

# npm 全局卸载
npm uninstall -g openclaw

# 清理配置 (谨慎!)
rm -rf ~/.openclaw
```

---

## 十二、官方资源

- **官网**: https://openclaw.ai
- **文档**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw
- **社区**: https://discord.com/invite/clawd
- **Skills 市场**: https://clawhub.com

---

## 十三、配置检查清单

安装完成后，确认以下项目:

- [ ] `openclaw doctor` 通过
- [ ] `openclaw gateway status` 显示运行中
- [ ] `openclaw dashboard` 能打开 Web UI
- [ ] 至少配置了一个消息通道 (WhatsApp/Telegram/Discord)
- [ ] 能发送和接收消息
- [ ] 安装了常用 Skills (browser, search 等)
- [ ] 工作区文件正确 (`AGENTS.md`, `SOUL.md` 等)

---

_本指南由 OpenClaw 自动生成_
