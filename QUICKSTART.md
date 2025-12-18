# ⚡ Quick Start Guide

This guide covers both rapid deployment and local development setup.

## 📋 Prerequisites
- **Docker Desktop** installed and running.
- **Node.js 18+** & **Java 17+** (only for manual build).
- **Docker Compose v2.0+**.

---

## 🚀 Deployment (Docker Compose)

The recommended way to run the entire OSINT platform:

1. **Spin up the environment:**
   ```bash
   docker-compose up --build -d
   ```

2. **Access Points:**
   - **Main Dashboard**: [http://localhost](http://localhost)
   - **API Health**: [http://localhost:8080/api/scans](http://localhost:8080/api/scans)

---

## 🛠️ Local Development (Manual Build)

### 1. Backend (Kotlin/Spring Boot)
```bash
cd backend
./gradlew bootRun
```
*Port: 8080*

### 2. Frontend (React/TypeScript)
```bash
cd frontend
npm install
npm start
```
*Port: 3000*

---

## 🔍 Management & Debugging

```bash
# View live logs for all services
docker-compose logs -f

# Specific Service Logs
docker-compose logs -f backend  # For scan orchestration logs
docker-compose logs -f frontend # For web server logs

# Reset SQLite Database (Warning: Destructive)
rm -rf backend/data/*.db
```

---

## 🧪 Verification & Testing

Verify system integrity by running the full test suite:

**Backend Tests:**
```bash
cd backend
./gradlew test
```

**Frontend Coverage:**
```bash
cd frontend
npm run test:coverage
```

---

## ❓ Troubleshooting
- **Port Conflict**: Ensure ports `80` and `8080` are available.
- **Docker Access**: On Linux/macOS, ensure the user has permissions to `/var/run/docker.sock`.
- **Image Pulls**: If tools fail, manually pull images: `docker pull laramies/theharvester:latest`.

