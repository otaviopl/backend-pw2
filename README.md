# Backend PW2 - API de Gerenciamento de Alunos

API REST desenvolvida em Node.js/Express para gerenciamento de alunos com autenticação JWT.

## Início Rápido

```bash
# 1. Inicializar fnm (se usar fnm) ou usar nvm (se usar nvm)
# Para fnm:
eval "$(fnm env --use-on-cd)"
fnm use

# Para nvm:
# nvm use

# 2. Instalar dependências
pnpm install

# 3. Executar o servidor
pnpm start

# Ou em modo desenvolvimento (com auto-reload):
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

**Nota:** O arquivo `.env` já está configurado e incluído no repositório, então não é necessário criar ou modificar nada.

## Características

- Autenticação JWT (JSON Web Tokens)
- CRUD completo de alunos
- Cálculo de médias e status de aprovação
- Armazenamento em memória (dados resetam ao reiniciar o servidor)
- Middleware de autenticação para proteção de rotas

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd backend-pw2
```

2. Use a versão correta do Node.js:
```bash
# Se usar fnm:
eval "$(fnm env --use-on-cd)"
fnm use

# Se usar nvm:
# nvm use
```

3. Instale as dependências:
```bash
pnpm install
```

4. O arquivo `.env` já está incluído no repositório e configurado com as variáveis necessárias. Não é necessário criar ou modificar nada - o projeto está pronto para uso:
```
JWT_SECRET=minha_chave_secreta_super_segura_123456789
PORT=3000
```

**Nota:** O arquivo `.env` já vem configurado no repositório, então após clonar e instalar as dependências, você pode executar o servidor diretamente.

## Executando

### Modo produção:
```bash
pnpm start
```

O servidor iniciará e você verá a mensagem:
```
Server started at http://localhost:3000
```

### Modo desenvolvimento (com nodemon - auto-reload):
```bash
pnpm dev
```

O servidor reiniciará automaticamente quando você modificar arquivos.

### Testar a API:

Após iniciar o servidor, você pode testar usando os scripts incluídos:

```bash
# Script Node.js
node test-api.js

# Script Bash (requer jq)
./test-api.sh
```

## Endpoints

### Autenticação

#### POST `/register`
Registra um novo usuário.

**Request:**
```json
{
  "username": "usuario",
  "password": "senha123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "username": "usuario"
}
```

#### POST `/login`
Autentica um usuário e retorna um token JWT.

**Request:**
```json
{
  "username": "usuario",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Alunos (Protegido - requer token JWT)

Todos os endpoints de alunos requerem autenticação. Inclua o token no header:
```
Authorization: Bearer <seu_token>
```

#### GET `/alunos`
Lista todos os alunos.

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "Ana",
    "ra": "RA001",
    "nota1": 8.0,
    "nota2": 7.5
  }
]
```

#### GET `/alunos/:id`
Busca um aluno específico por ID.

**Response (200):**
```json
{
  "id": 1,
  "nome": "Ana",
  "ra": "RA001",
  "nota1": 8.0,
  "nota2": 7.5
}
```

#### POST `/alunos`
Cria um novo aluno.

**Request:**
```json
{
  "nome": "João Silva",
  "ra": "RA004",
  "nota1": 8.5,
  "nota2": 7.0
}
```

**Response (201):**
```json
{
  "id": 4,
  "nome": "João Silva",
  "ra": "RA004",
  "nota1": 8.5,
  "nota2": 7.0
}
```

#### PUT `/alunos/:id`
Atualiza um aluno existente.

**Request:**
```json
{
  "nome": "João Silva Santos",
  "nota1": 9.0
}
```

**Response (200):**
```json
{
  "id": 4,
  "nome": "João Silva Santos",
  "ra": "RA004",
  "nota1": 9.0,
  "nota2": 7.0
}
```

#### DELETE `/alunos/:id`
Remove um aluno.

**Response (200):**
```json
{
  "id": 4,
  "nome": "João Silva",
  "ra": "RA004",
  "nota1": 9.0,
  "nota2": 7.0
}
```

#### GET `/alunos/medias`
Lista todos os alunos com suas médias calculadas.

**Response (200):**
```json
[
  {
    "nome": "Ana",
    "media": 7.75
  }
]
```

#### GET `/alunos/aprovados`
Lista todos os alunos com status de aprovação (média >= 6.0 = aprovado).

**Response (200):**
```json
[
  {
    "nome": "Ana",
    "status": "aprovado"
  }
]
```

### Healthcheck

#### GET `/health`
Verifica se o servidor está funcionando.

**Response (200):**
```json
{
  "status": "ok"
}
```

## Testando a API

O projeto inclui scripts de teste para facilitar o desenvolvimento:

### Script Node.js:
```bash
node test-api.js
```

### Script Bash (requer `jq`):
```bash
./test-api.sh
```

Os scripts testam:
- Healthcheck
- Registro de usuário
- Login e obtenção de token
- Todos os endpoints de alunos
- Validação de autenticação

## Autenticação

A autenticação utiliza JWT (JSON Web Tokens). O token expira em 1 hora.

**Como usar:**
1. Faça login em `/login` para obter o token
2. Inclua o token no header de todas as requisições protegidas:
   ```
   Authorization: Bearer <seu_token>
   ```

**Usuário padrão:**
- Username: `prof`
- Password: `123`

## Dependências

- **express**: Framework web
- **jsonwebtoken**: Geração e validação de tokens JWT
- **bcryptjs**: Hash de senhas
- **cors**: Habilitar CORS
- **dotenv**: Gerenciamento de variáveis de ambiente

## Estrutura do Projeto

```
backend-pw2/
├── src/
│   ├── data/
│   │   └── store.js          # In-memory storage
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   └── alunos.js         # Student routes
│   └── index.js              # Entry point
├── .env                      # Environment variables
├── package.json
├── test-api.js               # Node.js test script
├── test-api.sh               # Bash test script
└── README.md
```

## Notas Importantes

- Os dados são armazenados em memória e serão perdidos ao reiniciar o servidor
- O token JWT expira em 1 hora
- O arquivo `.env` já está incluído no repositório com a chave secreta JWT configurada - não é necessário criar ou modificar
- O servidor requer Node.js 18+ (especificado no `.nvmrc`)
- O projeto usa `pnpm` como gerenciador de pacotes

## Licença

MIT

