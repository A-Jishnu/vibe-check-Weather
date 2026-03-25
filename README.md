# Vibe Check Weather — Full Stack

A modern weather app with user accounts and saved locations.

## Stack

- **Frontend:** React + Vite
- **Backend:** Express + better-sqlite3
- **Auth:** JWT + bcrypt
- **Weather API:** Open-Meteo (proxied through backend)

## Quick Start

### 1. Install Dependencies

```bash
# Frontend dependencies (already installed)
npm install

# Backend dependencies
cd server
npm install
cd ..
```

### 2. Run Both Servers

```bash
# Option 1: Run separately
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

Or use concurrently (install first):
```bash
npm install -g concurrently
npm run dev:full
```

### 3. Open the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Features

- 🔍 Search any city worldwide
- 📍 Save favorite locations (requires login)
- 🔐 JWT authentication
- 🌤️ 5-day forecast
- 💾 SQLite database (auto-created)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/weather?lat=&lon=` | Get weather |
| GET | `/api/geocode?q=` | Search cities |
| GET | `/api/locations` | Get saved locations (auth) |
| POST | `/api/locations` | Save location (auth) |
| DELETE | `/api/locations/:id` | Delete location (auth) |

## Project Structure

```
weather-app/
├── src/                  # React frontend
│   ├── App.jsx
│   ├── services/
│   │   └── api.js       # API calls
│   └── ...
├── server/              # Express backend
│   ├── server.js        # Main server
│   ├── package.json
│   └── .env
├── package.json
└── README.md
```

## Database

SQLite database `server/weather.db` auto-creates on first run with tables:
- `users` — id, username, password, created_at
- `saved_locations` — id, user_id, city, lat, lon, country

## Production

```bash
# Build frontend
npm run build

# Copy dist to server/public (optional)
# Or serve frontend separately

# Start production server
cd server
npm start
```

---

Made with 💜 by Jarvis
