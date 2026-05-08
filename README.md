# UniVoid — Student Ecosystem Platform

A full-stack MVP that combines study materials, student communities, events, and opportunities into one unified platform.

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React (Vite), Tailwind CSS v4, Axios, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Auth** | JWT + bcrypt |

---

## 📁 Project Structure

```
univoid/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Navbar, Sidebar
│   │   ├── context/           # AuthContext (JWT state)
│   │   ├── pages/             # Home, Login, Register, Dashboard,
│   │   │                        Notes, Communities, Events, Profile
│   │   ├── services/          # API service (Axios)
│   │   ├── App.jsx            # Routes & layout
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Design system (Tailwind + custom)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/db.js           # MongoDB connection
│   ├── middleware/auth.js     # JWT + admin middleware
│   ├── models/                # User, Note, Community, Post, Event
│   ├── routes/                # auth, users, notes, communities, events
│   ├── seed.js                # Sample data seeder
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
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment

Edit `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/univoid
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### 3. Seed sample data

```bash
cd server
npm run seed
```

This creates:
- **Admin user**: `admin@univoid.com` / `admin123`
- **Student user**: `rahul@test.com` / `test123`
- 6 study notes, 4 communities, 4 posts, 4 events

### 4. Run the app

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔑 Features

### Authentication
- JWT-based signup/login
- Role-based access (Student, Admin)
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
- Admin-only event creation
- Student registration
- External link support

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
| POST | `/api/events` | 🔒 Admin | Create event |
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
