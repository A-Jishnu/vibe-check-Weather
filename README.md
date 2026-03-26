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

-  Search any city worldwide
- Save favorite locations (requires login)
-  JWT authentication
-  5-day forecast
-  SQLite database (auto-created)



## Database

SQLite database `server/weather.db` auto-creates on first run with tables:
- `users` — id, username, password, created_at
- `saved_locations` — id, user_id, city, lat, lon, country
