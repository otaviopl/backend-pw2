"use strict";

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authenticateToken = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const alunosRoutes = require("./routes/alunos");

const app = express();

app.use(cors());
app.use(express.json());

// Auth endpoints at root: /register, /login
app.use("/", authRoutes);

// Protected alunos endpoints
app.use("/alunos", authenticateToken, alunosRoutes);

// Healthcheck
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});


