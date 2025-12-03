"use strict";

const store = {
  users: [],
  alunos: [],
  nextAlunoId: 1,
  nextUserId: 1
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


