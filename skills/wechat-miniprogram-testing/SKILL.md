# 🧪 Skill: 微信小程序自动化测试专家

## 概述

本技能为 AI Agent 提供微信小程序自动化测试能力，包括代码编译检查、页面逻辑验证和 UI 元素检测。

## 触发条件

当用户要求以下操作时自动触发：
- "测试小程序"
- "自测"
- "自动化测试"
- "代码检查"
- "编译检查"

## 测试能力

### 1. 编译检查 (Compile Check)

```bash
# 微信开发者工具 CLI 编译检查
cd miniprogram-3
npm install miniprogram-ci -g
miniprogram-compile --project . --setting.es6 true --setting.minify true
```

### 2. 语法检查 (Lint Check)

使用 ESLint 检查 JavaScript 语法：
```bash
npm install eslint --save-dev
eslint pages/**/*.js --fix
```

### 3. JSON 配置校验

检查 app.json 和页面配置是否有效：
- pages 路径是否存在
- window 配置是否正确
- tabBar 配置是否完整

### 4. 关键逻辑自测清单

| 页面 | 测试点 | 验证方式 |
|------|--------|----------|
| onboarding | 返回按钮显示条件 | 检查 hasHistory 逻辑 |
| onboarding | 用户信息存储 | 检查 wx.setStorageSync |
| dashboard | 生成穿搭流程 | 检查 API 调用链 |
| dashboard | 场景选择器 | 检查 scenes 数组 |

### 5. 文件完整性检查

确保关键文件存在：
```
pages/
├── onboarding/
│   ├── onboarding.js      # 必有
│   ├── onboarding.wxml     # 必有
│   └── onboarding.wxss    # 必有
├── dashboard/
│   ├── dashboard.js       # 必有
│   ├── dashboard.wxml     # 必有
│   └── dashboard.wxss     # 必有
└── report/
    ├── report.js          # 必有
    └── report.wxml        # 必有
```

## 自测流程 (Self-Test)

当完成代码修改后，AI Agent 必须执行以下自测：

### Step 1: 编译测试
```bash
cd miniprogram-3
npm install miniprogram-ci
node preview.js
# 验证：无编译错误
```

### Step 2: 语法检查
```bash
# 检查关键 JS 文件语法
node -c pages/onboarding/onboarding.js
node -c pages/dashboard/dashboard.js
```

### Step 3: 逻辑验证
```bash
# 检查关键代码是否存在
grep -n "hasHistory" pages/onboarding/onboarding.js
grep -n "goBack" pages/onboarding/onboarding.js
grep -n "onReset" pages/dashboard/dashboard.js
```

### Step 4: 输出报告

```markdown
## 🧪 自测报告

| 测试项 | 状态 | 说明 |
|--------|------|------|
| 编译检查 | ✅ | 无错误 |
| 语法检查 | ✅ | 无错误 |
| 文件完整性 | ✅ | 所有文件存在 |
| 返回按钮逻辑 | ✅ | hasHistory + goBack 存在 |
| 设置按钮逻辑 | ✅ | onReset 存在 |

**结论**: 可以发布 ✅
```

## 常用命令速查

```bash
# 本地预览
node preview.js

# 上传发布
node deploy.js

# 语法检查
node -c <file.js>

# 查找关键代码
grep -n "关键词" <file>

# 检查文件是否存在
ls -la pages/<page>/
```

## 输出要求

每次完成代码修改后，必须：
1. 执行自测流程
2. 报告测试结果
3. 如有问题，先修复再提交给用户确认
