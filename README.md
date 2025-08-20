![Header](https://github.com/TheDevLucas/starbucks-design-responsive/blob/main/77070f74-ea26-41ae-a154-b881c51bb2cf.jpeg?raw=true)
<a name="readme-top"></a>

<div align="center">

![GitHub followers](https://img.shields.io/github/followers/TheDevLucas?style=for-the-badge)
![GitHub Stars](https://img.shields.io/github/stars/TheDevLucas/lia-admin-ai?style=for-the-badge)
![GitHub Forks](https://img.shields.io/github/forks/TheDevLucas/lia-admin-ai?style=for-the-badge)

## Lia — Admin AI Agent (Gemini‑powered)
An admin-focused AI agent with a strict command protocol and a deferential persona. Built with **React**, **Express.js**, and **MySQL**. The language model is **powered by Gemini**.

</div>

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## ✨ Features

- **Gemini-powered reasoning** with a persona called **Lia** (admin assistant).
- **Automatic language detection** and responses in the user’s language.
- **Two-phase command protocol** (JSON-only request → human-readable result).
- **Emotional state tag** appended to every normal response (e.g., `{"emotion":"focused"}`).
- **Security & conduct rules** embedded in the system prompt.
- **Full-stack implementation** using **React (frontend)** + **Express.js (backend)** + **MySQL (database)**.

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## 🛠️ Stack

- ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) – Frontend UI
- ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) – Backend API
- ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) – Persistent storage
- ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) – Runtime
- ![Gemini](https://img.shields.io/badge/Gemini%20API-0B57D0?style=for-the-badge&logo=google&logoColor=white) – LLM provider (model powering the agent)

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## 🧠 System Prompt (persona)

Lia’s system instructions (summary): the assistant treats the administrator as **mr admin**, follows a **formal and respectful** tone, detects the user’s language, **never mentions providers during conversation**, and always appends a JSON **emotion label** at the end of normal replies. For **admin commands**, Lia replies with **only a clean JSON object**.

> **Note:** Although the persona hides the provider in chat, the project itself is **powered by Gemini**.

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## 🔧 Command Protocol

### Phase 1 — JSON-only request (no extra text, no markdown)
```json
{"command": "commandName", "args": ["param1", "param2"]}
```

**Available commands:**
- `searchUser ["username"]`
- `getUserStats []`
- `listUsers []`
- `banUser ["username"]`
- `unbanUser ["username"]`

**Examples:**
```json
{"command": "searchUser", "args": ["john"]}
```
```json
{"command": "banUser", "args": ["john"]}
```
```json
{"command": "getUserStats", "args": []}
```

### Phase 2 — Result explanation
After the server executes the command, Lia responds with a **professional explanation** of the outcome.

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- A **Gemini** API key

### Environment Variables
Create a `.env` file in the project root:

```bash
# LLM
GEMINI_API_KEY=your_gemini_api_key

# App
AGENT_NAME=Lia
DEFAULT_USER_RANK=owner
PORT=3000

# Database (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=secret
DB_NAME=lia_ai
```

### Installation

```bash
# 1) Install deps
pnpm i   # or: npm i / yarn

# 2) Run database migrations / seed (example; adapt to your tooling)
# npx prisma migrate dev
# npx prisma db seed

# 3) Start dev servers
pnpm dev   # backend + frontend (configure scripts as needed)
# pnpm build && pnpm start  # for production
```

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## 📦 Project Structure (suggested)

```
.
├─ client/                # React app
│  └─ src/
├─ server/                # Express.js API
│  ├─ commands/           # searchUser, listUsers, banUser, unbanUser, getUserStats
│  ├─ llm/                # Gemini client
│  ├─ middleware/         # auth, rate limits
│  ├─ routes/
│  └─ db/                 # MySQL access (ORM/queries)
├─ scripts/               # tooling and maintenance
├─ tests/                 # protocol & integration tests
├─ .env.example
└─ README.md
```

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## 🔒 Security Notes

- **RBAC in the server** (do not rely on prompts for real permissions).
- **Rate limiting & audit logs** for all admin commands.
- **Sensitive data** should be masked in logs and secured via secrets management.
- **Validation**: enforce JSON-only format for Phase 1 at the API boundary.

<p align="right">(<a href="#readme-top">Go up</a>)</p>

## 📝 License

MIT — see `LICENSE`.

<p align="right">(<a href="#readme-top">Go up</a>)</p>
