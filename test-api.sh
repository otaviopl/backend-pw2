#!/bin/bash

# API test script
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000"
TOKEN=""
PASSED=0
FAILED=0

# 1. Healthcheck
curl -s -X GET "$BASE_URL/health" > /dev/null && ((PASSED++)) || ((FAILED++))

# 2. Register user
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}')
[ "$(echo "$REGISTER_RESPONSE" | jq -r '.id')" != "null" ] && ((PASSED++)) || ((FAILED++))

# 3. Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}')
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
[ "$TOKEN" != "null" ] && [ -n "$TOKEN" ] && ((PASSED++)) || ((FAILED++))

# 4. List students (protected)
curl -s -X GET "$BASE_URL/alunos" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && ((PASSED++)) || ((FAILED++))

# 5. Create student (protected)
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/alunos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","ra":"12345","nota1":8.5,"nota2":7.0}')
ALUNO_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
[ "$ALUNO_ID" != "null" ] && ((PASSED++)) || ((FAILED++))

# 6. Get specific student
[ -n "$ALUNO_ID" ] && curl -s -X GET "$BASE_URL/alunos/$ALUNO_ID" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && ((PASSED++)) || ((FAILED++))

# 7. List averages
curl -s -X GET "$BASE_URL/alunos/medias" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && ((PASSED++)) || ((FAILED++))

# 8. List approved/rejected
curl -s -X GET "$BASE_URL/alunos/aprovados" \
  -H "Authorization: Bearer $TOKEN" > /dev/null && ((PASSED++)) || ((FAILED++))

# 9. Update student
[ -n "$ALUNO_ID" ] && curl -s -X PUT "$BASE_URL/alunos/$ALUNO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nota1":9.0,"nota2":8.5}' > /dev/null && ((PASSED++)) || ((FAILED++))

# 10. Test without token (should fail)
[ "$(curl -s -X GET "$BASE_URL/alunos" | jq -r '.message')" != "null" ] && ((PASSED++)) || ((FAILED++))

# 11. Test with invalid token (should fail)
[ "$(curl -s -X GET "$BASE_URL/alunos" \
  -H "Authorization: Bearer token_invalido_123" | jq -r '.message')" != "null" ] && ((PASSED++)) || ((FAILED++))

echo "Tests completed: $PASSED passed, $FAILED failed"

