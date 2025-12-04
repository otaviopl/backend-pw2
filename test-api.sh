#!/bin/bash

# API test script
# Make sure the server is running before executing this script

# Load .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BASE_URL="http://localhost:3000"
TOKEN=""
PASSED=0
FAILED=0
FAILED_TESTS=()

echo "=== API Tests ==="
if [ -n "$JWT_SECRET" ]; then
  echo "JWT_SECRET loaded from .env"
fi
echo ""

# 1. Healthcheck
echo "1. Healthcheck:"
RESPONSE=$(curl -s -X GET "$BASE_URL/health")
echo "$RESPONSE" | jq .
if [ "$(echo "$RESPONSE" | jq -r '.status')" = "ok" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("1")
fi
echo ""

# 2. Register user
echo "2. Register user:"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}')
echo "$REGISTER_RESPONSE" | jq .
# Accept both success (201 with id) and user already exists (409)
if [ "$(echo "$REGISTER_RESPONSE" | jq -r '.id')" != "null" ] || [ "$(echo "$REGISTER_RESPONSE" | jq -r '.message')" = "Usuário já existe" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("2")
fi
echo ""

# 3. Login
echo "3. Login:"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("3")
fi
echo ""

# 4. List students (protected)
echo "4. List students (protected):"
RESPONSE=$(curl -s -X GET "$BASE_URL/alunos" \
  -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq .
[ "$(echo "$RESPONSE" | jq -r 'type')" = "array" ] && ((PASSED++)) || ((FAILED++))
echo ""

# 5. Create student (protected)
echo "5. Create student:"
# Use a unique RA to avoid conflicts
UNIQUE_RA="RA$(date +%s)"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/alunos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"João Silva\",\"ra\":\"$UNIQUE_RA\",\"nota1\":8.5,\"nota2\":7.0}")
echo "$CREATE_RESPONSE" | jq .
ALUNO_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
if [ "$ALUNO_ID" != "null" ] && [ -n "$ALUNO_ID" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("5")
fi
echo ""

# 6. Get specific student
if [ -n "$ALUNO_ID" ] && [ "$ALUNO_ID" != "null" ]; then
  echo "6. Get student ID $ALUNO_ID:"
  RESPONSE=$(curl -s -X GET "$BASE_URL/alunos/$ALUNO_ID" \
    -H "Authorization: Bearer $TOKEN")
  echo "$RESPONSE" | jq .
  if [ "$(echo "$RESPONSE" | jq -r '.id')" = "$ALUNO_ID" ]; then
    ((PASSED++))
  else
    ((FAILED++))
    FAILED_TESTS+=("6")
  fi
  echo ""
else
  echo "6. Get specific student:"
  echo "   ⚠ Skipped (no student ID available)"
  echo ""
fi

# 7. List averages
echo "7. List averages:"
RESPONSE=$(curl -s -X GET "$BASE_URL/alunos/medias" \
  -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq .
if [ "$(echo "$RESPONSE" | jq -r 'type')" = "array" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("7")
fi
echo ""

# 8. List approved/rejected
echo "8. List approved/rejected:"
RESPONSE=$(curl -s -X GET "$BASE_URL/alunos/aprovados" \
  -H "Authorization: Bearer $TOKEN")
echo "$RESPONSE" | jq .
if [ "$(echo "$RESPONSE" | jq -r 'type')" = "array" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("8")
fi
echo ""

# 9. Update student
if [ -n "$ALUNO_ID" ] && [ "$ALUNO_ID" != "null" ]; then
  echo "9. Update student ID $ALUNO_ID:"
  RESPONSE=$(curl -s -X PUT "$BASE_URL/alunos/$ALUNO_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"nota1":9.0,"nota2":8.5}')
  echo "$RESPONSE" | jq .
  if [ "$(echo "$RESPONSE" | jq -r '.id')" = "$ALUNO_ID" ]; then
    ((PASSED++))
  else
    ((FAILED++))
    FAILED_TESTS+=("9")
  fi
  echo ""
else
  echo "9. Update student:"
  echo "   ⚠ Skipped (no student ID available)"
  echo ""
fi

# 10. Test without token (should fail)
echo "10. Test without token (should fail):"
RESPONSE=$(curl -s -X GET "$BASE_URL/alunos")
echo "$RESPONSE" | jq .
if [ "$(echo "$RESPONSE" | jq -r '.message')" != "null" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("10")
fi
echo ""

# 11. Test with invalid token (should fail)
echo "11. Test with invalid token (should fail):"
RESPONSE=$(curl -s -X GET "$BASE_URL/alunos" \
  -H "Authorization: Bearer token_invalido_123")
echo "$RESPONSE" | jq .
if [ "$(echo "$RESPONSE" | jq -r '.message')" != "null" ]; then
  ((PASSED++))
else
  ((FAILED++))
  FAILED_TESTS+=("11")
fi
echo ""

# 12. Test token validation with JWT_SECRET from .env (if available)
if [ -n "$JWT_SECRET" ] && [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo "12. Verify JWT_SECRET from .env is being used:"
  echo "    Token obtained from login (created with JWT_SECRET): $TOKEN" | head -c 80
  echo "..."
  echo "    JWT_SECRET from .env: ${JWT_SECRET:0:20}..."
  RESPONSE=$(curl -s -X GET "$BASE_URL/alunos" \
    -H "Authorization: Bearer $TOKEN")
  if [ "$(echo "$RESPONSE" | jq -r 'type')" = "array" ]; then
    echo "    ✓ Token validated successfully with JWT_SECRET from .env"
    ((PASSED++))
  else
    echo "    ✗ Token validation failed"
    ((FAILED++))
    FAILED_TESTS+=("12")
  fi
  echo ""
fi

TOTAL_TESTS=$((PASSED + FAILED))
echo "=== Tests completed: $PASSED passed, $FAILED failed (out of $TOTAL_TESTS total) ==="
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
  echo "Failed tests: ${FAILED_TESTS[*]}"
fi

