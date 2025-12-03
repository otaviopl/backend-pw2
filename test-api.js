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
  console.log("=== Testando API ===\n");

  try {
    // 1. Healthcheck
    console.log("1. Testing Healthcheck...");
    const health = await makeRequest("GET", "/health");
    console.log(`Status: ${health.status}`);
    console.log("Resposta:", JSON.stringify(health.data, null, 2));
    console.log("---\n");

    // 2. Register user
    console.log("2. Registering new user...");
    const register = await makeRequest("POST", "/register", {
      username: "testuser",
      password: "testpass123",
    });
    console.log(`Status: ${register.status}`);
    console.log("Resposta:", JSON.stringify(register.data, null, 2));
    console.log("---\n");

    // 3. Login
    console.log("3. Logging in...");
    const login = await makeRequest("POST", "/login", {
      username: "testuser",
      password: "testpass123",
    });
    console.log(`Status: ${login.status}`);
    console.log("Resposta:", JSON.stringify(login.data, null, 2));
    if (login.data.token) {
      token = login.data.token;
      console.log(`Token obtained: ${token.substring(0, 20)}...`);
    }
    console.log("---\n");

    // 4. List students (protected)
    console.log("4. Listing students (protected endpoint)...");
    const alunos = await makeRequest("GET", "/alunos", null, true);
    console.log(`Status: ${alunos.status}`);
    console.log("Resposta:", JSON.stringify(alunos.data, null, 2));
    console.log("---\n");

    // 5. Create student (protected)
    console.log("5. Creating new student...");
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
    console.log(`Status: ${createAluno.status}`);
    console.log("Resposta:", JSON.stringify(createAluno.data, null, 2));
    const alunoId = createAluno.data?.id;
    console.log("---\n");

    // 6. Get specific student
    if (alunoId) {
      console.log(`6. Getting student ID ${alunoId}...`);
      const aluno = await makeRequest(`GET`, `/alunos/${alunoId}`, null, true);
      console.log(`Status: ${aluno.status}`);
      console.log("Resposta:", JSON.stringify(aluno.data, null, 2));
      console.log("---\n");
    }

    // 7. List averages
    console.log("7. Listing student averages...");
    const medias = await makeRequest("GET", "/alunos/medias", null, true);
    console.log(`Status: ${medias.status}`);
    console.log("Resposta:", JSON.stringify(medias.data, null, 2));
    console.log("---\n");

    // 8. List approved/rejected
    console.log("8. Listing approved/rejected students...");
    const aprovados = await makeRequest("GET", "/alunos/aprovados", null, true);
    console.log(`Status: ${aprovados.status}`);
    console.log("Resposta:", JSON.stringify(aprovados.data, null, 2));
    console.log("---\n");

    // 9. Update student
    if (alunoId) {
      console.log(`9. Updating student ID ${alunoId}...`);
      const update = await makeRequest(
        "PUT",
        `/alunos/${alunoId}`,
        {
          nota1: 9.0,
          nota2: 8.5,
        },
        true
      );
      console.log(`Status: ${update.status}`);
      console.log("Resposta:", JSON.stringify(update.data, null, 2));
      console.log("---\n");
    }

    // 10. Test without token (should fail)
    console.log("10. Testing protected endpoint without token (should fail)...");
    const noToken = await makeRequest("GET", "/alunos");
    console.log(`Status: ${noToken.status}`);
    console.log("Resposta:", JSON.stringify(noToken.data, null, 2));
    console.log("---\n");

    // 11. Test with invalid token (should fail)
    console.log("11. Testing protected endpoint with invalid token (should fail)...");
    const oldToken = token;
    token = "token_invalido_123";
    const invalidToken = await makeRequest("GET", "/alunos", null, true);
    token = oldToken;
    console.log(`Status: ${invalidToken.status}`);
    console.log("Resposta:", JSON.stringify(invalidToken.data, null, 2));
    console.log("---\n");

    console.log("=== Tests completed ===");
  } catch (error) {
    console.error("Error during tests:", error.message);
    process.exit(1);
  }
}

runTests();

