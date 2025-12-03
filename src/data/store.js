"use strict";

const bcrypt = require("bcryptjs");

const initialUsers = [
  {
    id: 1,
    username: "prof",
    passwordHash: bcrypt.hashSync("123", 10)
  }
];

const initialAlunos = [
  { id: 1, nome: "Ana", ra: "RA001", nota1: 8.0, nota2: 7.5 },
  { id: 2, nome: "Bruno", ra: "RA002", nota1: 5.0, nota2: 6.0 },
  { id: 3, nome: "Carla", ra: "RA003", nota1: 9.0, nota2: 8.5 }
];

const store = {
  users: [...initialUsers],
  alunos: [...initialAlunos],
  nextAlunoId: initialAlunos.length + 1,
  nextUserId: initialUsers.length + 1
};

function getNextAlunoId() {
  const id = store.nextAlunoId;
  store.nextAlunoId += 1;
  return id;
}

function getNextUserId() {
  const id = store.nextUserId;
  store.nextUserId += 1;
  return id;
}

module.exports = {
  store,
  getNextAlunoId,
  getNextUserId
};


