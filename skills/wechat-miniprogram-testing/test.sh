#!/bin/bash

# 微信小程序自动化测试脚本
# 用法: ./test.sh miniprogram-3

PROJECT_DIR=${1:-miniprogram-3}

echo "========================================"
echo "🧪 微信小程序自动化测试"
echo "========================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $1"
        ((PASS++))
    else
        echo -e "${RED}❌ FAIL${NC}: $1"
        ((FAIL++))
    fi
}

# 1. 检查目录是否存在
echo -e "\n${YELLOW}1. 检查项目目录...${NC}"
[ -d "$PROJECT_DIR" ]
check "项目目录存在"

# 2. 检查关键文件
echo -e "\n${YELLOW}2. 检查关键文件...${NC}"
[ -f "$PROJECT_DIR/pages/onboarding/onboarding.js" ]
check "onboarding.js 存在"

[ -f "$PROJECT_DIR/pages/onboarding/onboarding.wxml" ]
check "onboarding.wxml 存在"

[ -f "$PROJECT_DIR/pages/dashboard/dashboard.js" ]
check "dashboard.js 存在"

[ -f "$PROJECT_DIR/pages/dashboard/dashboard.wxml" ]
check "dashboard.wxml 存在"

# 3. 检查关键代码逻辑
echo -e "\n${YELLOW}3. 检查关键代码逻辑...${NC}"

grep -q "hasHistory" "$PROJECT_DIR/pages/onboarding/onboarding.js"
check "onboarding 有 hasHistory 逻辑"

grep -q "goBack" "$PROJECT_DIR/pages/onboarding/onboarding.js"
check "onboarding 有 goBack 函数"

grep -q "onReset" "$PROJECT_DIR/pages/dashboard/dashboard.js"
check "dashboard 有 onReset 函数"

# 4. 检查 removeStorageSync (确保不会删除用户数据)
# 排除注释行，只检查活跃代码
if grep -v "^[[:space:]]*//" "$PROJECT_DIR/pages/dashboard/dashboard.js" | grep -q "removeStorageSync.*user_info"; then
    echo -e "${RED}⚠️  WARN${NC}: dashboard.js 中存在 removeStorageSync('user_info')，可能导致返回按钮不显示"
    ((FAIL++))
else
    echo -e "${GREEN}✅ PASS${NC}: user_info 不会被清除"
    ((PASS++))
fi

# 5. 语法检查
echo -e "\n${YELLOW}4. JavaScript 语法检查...${NC}"
for file in "$PROJECT_DIR/pages/onboarding/onboarding.js" "$PROJECT_DIR/pages/dashboard/dashboard.js"; do
    node -c "$file" 2>/dev/null
    check "语法检查: $(basename $file)"
done

# 输出总结
echo -e "\n========================================"
echo -e "📊 测试结果汇总"
echo -e "========================================"
echo -e "✅ 通过: $PASS"
echo -e "❌ 失败: $FAIL"

if [ $FAIL -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有测试通过！可以发布。${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️ 存在失败项，请修复后再发布。${NC}"
    exit 1
fi
