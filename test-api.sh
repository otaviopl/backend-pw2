#!/bin/bash

# API test script
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000"
TOKEN=""

echo "=== Testando API ==="
echo ""

# 1. Healthcheck
echo "1. Testing Healthcheck..."
curl -s -X GET "$BASE_URL/health" | jq .
echo ""
echo "---"
echo ""

# 2. Register user
echo "2. Registering new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}')
echo "$REGISTER_RESPONSE" | jq .
echo ""
echo "---"
echo ""

# 3. Login
echo "3. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}')
echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo ""
echo "Token obtained: $TOKEN"
echo "---"
echo ""

# 4. List students (protected)
echo "4. Listing students (protected endpoint)..."
curl -s -X GET "$BASE_URL/alunos" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# 5. Create student (protected)
echo "5. Creating new student..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/alunos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","ra":"12345","nota1":8.5,"nota2":7.0}')
echo "$CREATE_RESPONSE" | jq .
ALUNO_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')
echo ""
echo "---"
echo ""

# 6. Get specific student
echo "6. Getting student ID $ALUNO_ID..."
curl -s -X GET "$BASE_URL/alunos/$ALUNO_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# 7. List averages
echo "7. Listing student averages..."
curl -s -X GET "$BASE_URL/alunos/medias" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# 8. List approved/rejected
echo "8. Listing approved/rejected students..."
curl -s -X GET "$BASE_URL/alunos/aprovados" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo "---"
echo ""

# 9. Update student
echo "9. Updating student ID $ALUNO_ID..."
curl -s -X PUT "$BASE_URL/alunos/$ALUNO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nota1":9.0,"nota2":8.5}' | jq .
echo ""
echo "---"
echo ""

# 10. Test without token (should fail)
echo "10. Testing protected endpoint without token (should fail)..."
curl -s -X GET "$BASE_URL/alunos" | jq .
echo ""
echo "---"
echo ""

# 11. Test with invalid token (should fail)
echo "11. Testing protected endpoint with invalid token (should fail)..."
curl -s -X GET "$BASE_URL/alunos" \
  -H "Authorization: Bearer token_invalido_123" | jq .
echo ""
echo "=== Tests completed ==="

