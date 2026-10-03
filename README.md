# UniVoid — Student Ecosystem Platform

A full-stack MVP that combines study materials, student communities, events, and opportunities into one unified platform.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite), Tailwind CSS v4, Axios, React Router |
| **Backend** | Node.js, Express.js, Prisma ORM |
| **Database** | PostgreSQL / MySQL (via Prisma) |
| **Auth** | Supabase Auth / JWT |

---

## 📁 Project Structure

```
univoid/
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar
│   │   ├── context/           # AuthContext (JWT state)
│   │   ├── pages/             # Home, Login, Register, Dashboard, HR pages
│   │   ├── services/          # API service (Axios)
│   │   ├── App.jsx            # Routes & layout
│   │   └── main.jsx           # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                   # Express Backend
│   ├── prisma/                # Prisma schema & migrations
│   ├── middleware/auth.js     # JWT middleware
│   ├── routes/                # auth, users, notes, communities, events
│   ├── prismaClient.js        # Prisma client instance
│   ├── server.js              # Express entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── .gitignore
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas connection string)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit `backend/.env` with your database URL and Supabase keys:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/univoid"
JWT_SECRET=your_secret_key_here
```

### 3. Run migrations

```bash
cd backend
npx prisma migrate dev
```

### 4. Run the app

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔑 Features

### Authentication
- JWT-based signup/login
- Role-based access (Student, HR)
- Protected routes

### Study Notes
- Upload notes (PDF links)
- Search by title, subject, college
- Download tracking

### Communities
- Create/join/leave communities
- Post inside communities
- Like & comment on posts

### Events
- Community event creation (any user can add events)
- Student registration
- External link support

### HR & Recruitment (New!)
- Dedicated HR Dashboard for managing jobs and applications
- Multi-tab Job Details & Candidate Details views
- Role-switching: HR users can instantly toggle to the normal Student view
- Responsive Offers management interface

### Dashboard
- Personalized feed
- Latest notes, community posts, upcoming events

### Profile
- Editable user profile
- College, branch, year, bio

---

## 🔐 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/users/profile` | ✅ | Get profile |
| PUT | `/api/users/profile` | ✅ | Update profile |
| GET | `/api/notes` | — | List notes |
| POST | `/api/notes` | ✅ | Create note |
| DELETE | `/api/notes/:id` | ✅ | Delete note |
| GET | `/api/communities` | — | List communities |
| POST | `/api/communities` | ✅ | Create community |
| POST | `/api/communities/:id/join` | ✅ | Join |
| POST | `/api/communities/:id/leave` | ✅ | Leave |
| GET | `/api/communities/:id/posts` | — | Get posts |
| POST | `/api/communities/:id/posts` | ✅ | Create post |
| POST | `/api/communities/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/communities/posts/:id/comment` | ✅ | Add comment |
| GET | `/api/events` | — | List events |
| POST | `/api/events` | ✅ | Create event |
| POST | `/api/events/:id/register` | ✅ | Register |
| GET | `/api/dashboard` | — | Feed data |

---

## 🎨 Design

- Dark mode with glassmorphism
- Inter font from Google Fonts
- Custom gradient color palette
- Smooth micro-animations
- Fully responsive (mobile-first)

---

Built with ❤️ for students.
