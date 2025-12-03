"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { store, getNextUserId } = require("../data/store");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username e password são obrigatórios" });
    }
    const existing = store.users.find((u) => u.username === username);
    if (existing) {
      return res.status(409).json({ message: "Usuário já existe" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: getNextUserId(),
      username,
      passwordHash
    };
    store.users.push(user);
    return res.status(201).json({ id: user.id, username: user.username });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao registrar usuário" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "username e password são obrigatórios" });
    }
    const user = store.users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res
        .status(500)
        .json({ message: "Configuração do servidor ausente (JWT_SECRET)" });
    }
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: "1h" }
    );
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Erro ao efetuar login" });
  }
});

module.exports = router;


