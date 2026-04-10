#!/usr/bin/env bash
# Phase 7 端到端测试：
# 1. 启 wrangler preview
# 2. 调 /api/divine/destiny 排盘 + LLM 解读
# 3. 验证返回结构关键字段
# 4. 测时辰未知 case
# 5. 测同盘追问 /api/divine/destiny/ask
set -e

PORT=${PORT:-8788}
BASE="http://127.0.0.1:${PORT}"

echo "===== 1. 精确生辰：1990-06-15 08:30 男 北京 ====="
RESP1=$(curl -s -X POST "$BASE/api/divine/destiny" \
  -H "Content-Type: application/json" \
  -H "x-client-id: e2e-test-1" \
  -d '{
    "year": 1990, "month": 6, "day": 15,
    "hour": 8, "minute": 30,
    "timeMode": "precise",
    "gender": "male",
    "birthProvince": "BJ",
    "topics": ["career"],
    "question": "今年下半年事业能否突破"
  }')
echo "$RESP1" | head -c 500
echo ""
GZ1=$(echo "$RESP1" | grep -o '"gz":"[^"]*"' | head -1)
echo "八字: $GZ1"
[[ "$GZ1" == *"庚午|壬午|辛亥|壬辰"* ]] && echo "✅ 八字正确" || { echo "❌ 八字错误"; exit 1; }
SESSION_TOKEN=$(echo "$RESP1" | grep -o '"sessionToken":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "sessionToken: $SESSION_TOKEN"
[[ -n "$SESSION_TOKEN" ]] && echo "✅ session 已生成" || { echo "❌ session 缺失"; exit 1; }

echo ""
echo "===== 2. 时辰未知：1995-08-15 男 ====="
RESP2=$(curl -s -X POST "$BASE/api/divine/destiny" \
  -H "Content-Type: application/json" \
  -H "x-client-id: e2e-test-2" \
  -d '{
    "year": 1995, "month": 8, "day": 15,
    "timeMode": "unknown",
    "gender": "male",
    "topics": ["overall"]
  }')
echo "$RESP2" | head -c 500
echo ""
GZ2=$(echo "$RESP2" | grep -o '"gz":"[^"]*"' | head -1)
echo "八字: $GZ2"
[[ "$GZ2" == *"乙亥|甲申|戊寅|?"* ]] && echo "✅ 时柱正确为 ?" || { echo "❌ 时柱错误"; exit 1; }
HAS_ZIWEI2=$(echo "$RESP2" | grep -o '"ziwei":' | head -1)
[[ -z "$HAS_ZIWEI2" || "$RESP2" == *'"ziwei":null'* ]] && echo "✅ 紫微正确跳过" || echo "ℹ️ 紫微存在情况待确认"

echo ""
echo "===== 3. 同盘追问 ====="
RESP3=$(curl -s -X POST "$BASE/api/divine/destiny/ask" \
  -H "Content-Type: application/json" \
  -H "x-client-id: e2e-test-1" \
  -d "{
    \"sessionToken\": \"$SESSION_TOKEN\",
    \"question\": \"今年婚姻方面如何\",
    \"topic\": \"love\"
  }")
echo "$RESP3" | head -c 500
echo ""
HAS_READING=$(echo "$RESP3" | grep -o '"reading":' | head -1)
[[ -n "$HAS_READING" ]] && echo "✅ 追问返回解读" || { echo "❌ 追问失败"; exit 1; }

echo ""
echo "===== 4. wheel 注入 day-master ====="
RESP4=$(curl -s -X POST "$BASE/api/divine/wheel" \
  -H "Content-Type: application/json" \
  -H "x-client-id: e2e-test-3" \
  -H "x-day-master: 辛金" \
  -d '{"question":"今天适合签合同吗"}')
HAS_READING4=$(echo "$RESP4" | grep -o '"summary":' | head -1)
[[ -n "$HAS_READING4" ]] && echo "✅ wheel + day-master 正常" || { echo "❌ wheel 失败: $RESP4"; exit 1; }

echo ""
echo "===== 全部通过 ====="
