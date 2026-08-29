# Tracklytics 🚀

Tracklytics is a full-stack personal analytics, expense tracker, study logger, and schedule manager featuring a continuous conversational voice assistant.

---

## 📁 Repository Structure

```
Tracklytics/
├── backend/                  # Spring Boot 3 Java Backend
│   ├── src/                  # Controllers, Services, Models, Repositories
│   ├── pom.xml               # Maven dependencies
│   ├── schema.sql            # MySQL Database schema
│   └── run-backend.bat       # Local backend runner
├── frontend/                 # Vite + React + Tailwind CSS Frontend
│   ├── src/                  # Components, Pages, Hooks, Context, Services
│   ├── public/               # Static assets & icons
│   ├── index.html            # Main HTML entry
│   ├── package.json          # Frontend npm dependencies & scripts
│   └── vite.config.js        # Vite configuration
├── run-frontend.bat          # 1-Click launcher for Frontend Dev Server
├── run-backend.bat           # 1-Click launcher for Spring Boot Backend
├── schema.sql                # Root database schema copy
└── README.md
```

---

## ⚡ Quick Start

### 1. Launching Frontend (React + Vite)
Double-click `run-frontend.bat` from the root directory or run:
```bash
cd frontend
npm install
npm run dev
```
Access the frontend at: **http://localhost:5173/**

### 2. Launching Backend (Spring Boot)
Double-click `run-backend.bat` from the root directory or run:
```bash
cd backend
mvn spring-boot:run
```
API endpoints and Swagger UI available at: **http://localhost:8080/api/v1**
