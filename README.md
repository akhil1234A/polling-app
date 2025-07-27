
# 🗳️ Polling App

A secure polling application built with a **NestJS backend** and **Next.js frontend**. It supports public/private polls, voting, and result display, all secured with JWT-based authentication and role-based access control.

---

## ✨ Features

- **Authentication**: Register, login, logout with JWT stored in cookies.
- **Role-Based Access**: Admins can manage polls; users can vote and view results.
- **Polls**:
  - Create polls (Admins only)
  - Public/private visibility
  - Time-limited voting
  - Vote result charts
- **Voting Restrictions**:
  - Users can vote only once
  - Expired polls are view-only
- **Filters & Search**: Filter by status, visibility, and voting status.
- **Responsive UI**: Supports mobile, tablet, desktop with dark mode.

---

## 🧰 Prerequisites

- **Node.js** v18+  
- **MongoDB** (local or Atlas)  
- **Git**

---

## ⚙️ Setup

### 1. Clone Repositories

```bash
git clone <https://github.com/akhil1234A/polling-app>

```

### 2. Backend Setup

```bash
cd polling-app/backend
npm install
```

Create `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/polling-app
JWT_ACCESS_SECRET=akhilanwarm
JWT_REFRESH_SECRET=akhilanwerm
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_EXPIRES=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

```bash
cd polling-app/frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. MongoDB Setup

- **Local**: 

---

## 🚀 How to Run

### Backend

```bash
cd polling-app-backend
npm run start:dev
```

Runs at: http://localhost:3001

### Frontend

```bash
cd polling-app-frontend
npm run dev
```

Runs at: http://localhost:3000

---


## 🚀 Deployment

### Backend (Render)

**Build**:

```bash
npm run build
```

Push to GitHub. On Render.com:

- Runtime: Node.js
- Build Command: `npm install && npm run build`
- Start Command: `node dist/main`
- Env Vars: `PORT`, `MONGODB_URI`, `JWT_ACCESS_SECRET`, etc.

✅ Update frontend `.env.local` with the Render backend URL.

### Frontend (Vercel)

Push frontend to GitHub. On Vercel.com:

- Framework: Next.js
- Add Env Var: `NEXT_PUBLIC_API_URL=https://<your-render-backend-url>`

✅ Test the deployed version end-to-end.

---

## 🤖 AI Usage Disclosure

This project used **Grok 3 by xAI** and **ChatGPT** for:

- Generating UI components and styling
- Writing & refactoring NestJS endpoints and React logic
- Suggesting validation


All AI-generated code was reviewed, integrated, and manually tested.

---

## ⚠️ Limitations

- Refresh token flow is implemented structurally but not fully integrated (e.g., no auto-refresh logic).
- Limited test coverage due to interview preparation time constraints.

---


