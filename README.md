# 🗳️ Polling App

A secure polling application built with a **NestJS backend** and **Next.js frontend**. It supports public/private polls, voting, and result display, all secured with JWT-based authentication and role-based access control.

🔗 **[Live Demo](https://polling-app-two-rho.vercel.app)**

---

## ✨ Features

- **Authentication**: Register, login, logout with JWT stored in cookies
- **Role-Based Access**: Admins manage polls; users can vote and view results
- **Polls**:
  - Create (Admins only)
  - Public/private visibility
  - Time-limited voting
  - Result charts
- **Voting Restrictions**:
  - One vote per user
  - Expired polls are read-only
- **Filters & Search**: Status, visibility, and voting status
- **Responsive UI**: Mobile-first, dark mode supported

---

## 🧰 Prerequisites

- **Node.js** v18+  
- **MongoDB** (local or Atlas)  
- **Git**

---

## ⚙️ Setup

### 1. Clone Repositories

```bash
git clone https://github.com/akhil1234A/polling-app
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

---

## 🚀 How to Run Locally

### Backend

```bash
cd polling-app/backend
npm run start:dev
```

Runs at: [http://localhost:3001](http://localhost:3001)

### Frontend

```bash
cd polling-app/frontend
npm run dev
```

Runs at: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment

### Backend (Railway)

1. Push to GitHub  
2. On [Railway.app](https://railway.app):

- **Runtime**: Node.js
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/main`
- **Env Vars**:  
  ```env
  MONGO_URI=your_mongodb_connection_string
  PORT=3000
  NODE_ENV=production
  FRONTEND_URL=https://polling-app-two-rho.vercel.app
  JWT_ACCESS_SECRET=your_access_secret
  JWT_REFRESH_SECRET=your_refresh_secret
  JWT_ACCESS_EXPIRES=15m
  JWT_REFRESH_EXPIRES=7d
  ```

### Frontend (Vercel)

1. Push to GitHub  
2. On [Vercel.com](https://vercel.com):

- **Framework**: Next.js
- **Env Var**:  
  ```env
  NEXT_PUBLIC_API_URL=https://<your-railway-backend-url>
  ```

✅ Test the deployed version end-to-end.

---

## 🤖 AI Usage Disclosure

This project used **ChatGPT** and **Grok 3 by xAI** for:

- UI components and styling
- NestJS service/controller logic
- Zod validation suggestions

All AI-generated content was reviewed and manually tested.

---

## ⚠️ Limitations

- Refresh token rotation is structured but lacks full auto-refresh logic
- Minimal test coverage due to time constraints (interview-focused)

---