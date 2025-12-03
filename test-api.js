#!/usr/bin/env node

/**
 * API test script
 * Run: node test-api.js
 * Make sure the server is running before executing
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";
let token = "";

function makeRequest(method, path, data = null, useToken = false) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (useToken && token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  try {
    // 1. Healthcheck
    const health = await makeRequest("GET", "/health");
    if (health.status === 200) passed++; else failed++;

    // 2. Register user
    const register = await makeRequest("POST", "/register", {
      username: "testuser",
      password: "testpass123",
    });
    if (register.status === 201) passed++; else failed++;

    // 3. Login
    const login = await makeRequest("POST", "/login", {
      username: "testuser",
      password: "testpass123",
    });
    if (login.status === 200 && login.data.token) {
      token = login.data.token;
      passed++;
    } else {
      failed++;
    }

    // 4. List students (protected)
    const alunos = await makeRequest("GET", "/alunos", null, true);
    if (alunos.status === 200) passed++; else failed++;

    // 5. Create student (protected)
    const createAluno = await makeRequest(
      "POST",
      "/alunos",
      {
        nome: "João Silva",
        ra: "12345",
        nota1: 8.5,
        nota2: 7.0,
      },
      true
    );
    const alunoId = createAluno.data?.id;
    if (createAluno.status === 201) passed++; else failed++;

    // 6. Get specific student
    if (alunoId) {
      const aluno = await makeRequest(`GET`, `/alunos/${alunoId}`, null, true);
      if (aluno.status === 200) passed++; else failed++;
    }

    // 7. List averages
    const medias = await makeRequest("GET", "/alunos/medias", null, true);
    if (medias.status === 200) passed++; else failed++;

    // 8. List approved/rejected
    const aprovados = await makeRequest("GET", "/alunos/aprovados", null, true);
    if (aprovados.status === 200) passed++; else failed++;

    // 9. Update student
    if (alunoId) {
      const update = await makeRequest(
        "PUT",
        `/alunos/${alunoId}`,
        {
          nota1: 9.0,
          nota2: 8.5,
        },
        true
      );
      if (update.status === 200) passed++; else failed++;
    }

    // 10. Test without token (should fail)
    const noToken = await makeRequest("GET", "/alunos");
    if (noToken.status === 401) passed++; else failed++;

    // 11. Test with invalid token (should fail)
    const oldToken = token;
    token = "token_invalido_123";
    const invalidToken = await makeRequest("GET", "/alunos", null, true);
    token = oldToken;
    if (invalidToken.status === 401) passed++; else failed++;

    console.log(`Tests completed: ${passed} passed, ${failed} failed`);
  } catch (error) {
    console.error("Error during tests:", error.message);
    process.exit(1);
  }
}

runTests();

