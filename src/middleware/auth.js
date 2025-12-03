"use strict";

const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Formato de token inválido" });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res
      .status(500)
      .json({ message: "Configuração do servidor ausente (JWT_SECRET)" });
  }
  jwt.verify(token, secret, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: "Token inválido ou expirado" });
    }
    req.user = payload;
    next();
  });
}

module.exports = authenticateToken;


