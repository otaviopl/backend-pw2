"use strict";

const express = require("express");
const { store, getNextAlunoId } = require("../data/store");

const router = express.Router();

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

// GET /alunos -> todos os alunos
router.get("/", (_req, res) => {
  return res.json(store.alunos);
});

// GET /alunos/:id -> aluno específico
router.get("/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id inválido" });
  }
  const aluno = store.alunos.find((a) => a.id === id);
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  return res.json(aluno);
});

// GET /alunos/medias -> nome e média
router.get("/medias", (_req, res) => {
  const dados = store.alunos.map((a) => {
    const media = (toNumber(a.nota1) + toNumber(a.nota2)) / 2;
    return { nome: a.nome, media };
  });
  return res.json(dados);
});

// GET /alunos/aprovados -> nome e status
router.get("/aprovados", (_req, res) => {
  const dados = store.alunos.map((a) => {
    const media = (toNumber(a.nota1) + toNumber(a.nota2)) / 2;
    const status = media >= 6 ? "aprovado" : "reprovado";
    return { nome: a.nome, status };
  });
  return res.json(dados);
});

// POST /alunos -> cria aluno
router.post("/", (req, res) => {
  const { nome, ra, nota1, nota2 } = req.body || {};
  if (!nome || !ra) {
    return res.status(400).json({ error: "nome e ra são obrigatórios" });
  }
  const n1 = toNumber(nota1);
  const n2 = toNumber(nota2);
  if (!Number.isFinite(n1) || !Number.isFinite(n2)) {
    return res.status(400).json({ error: "nota1 e nota2 devem ser números" });
  }
  const aluno = {
    id: getNextAlunoId(),
    nome: String(nome),
    ra: String(ra),
    nota1: n1,
    nota2: n2
  };
  store.alunos.push(aluno);
  return res.status(201).json(aluno);
});

// PUT /alunos/:id -> altera aluno
router.put("/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id inválido" });
  }
  const aluno = store.alunos.find((a) => a.id === id);
  if (!aluno) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  const { nome, ra, nota1, nota2 } = req.body || {};
  if (nome !== undefined) aluno.nome = String(nome);
  if (ra !== undefined) aluno.ra = String(ra);
  if (nota1 !== undefined) {
    const n1 = toNumber(nota1);
    if (!Number.isFinite(n1)) {
      return res.status(400).json({ error: "nota1 deve ser número" });
    }
    aluno.nota1 = n1;
  }
  if (nota2 !== undefined) {
    const n2 = toNumber(nota2);
    if (!Number.isFinite(n2)) {
      return res.status(400).json({ error: "nota2 deve ser número" });
    }
    aluno.nota2 = n2;
  }
  return res.json(aluno);
});

// DELETE /alunos/:id -> remove aluno
router.delete("/:id", (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "id inválido" });
  }
  const idx = store.alunos.findIndex((a) => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Aluno não encontrado" });
  }
  const [removed] = store.alunos.splice(idx, 1);
  return res.json(removed);
});

module.exports = router;


