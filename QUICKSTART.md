# Quick Start Guide

## Prerequisites
- Docker Desktop installed and running
- Docker Compose v2.0+

## Start the Application

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/api

## First Scan

1. Open http://localhost in your browser
2. Click "New Scan" button
3. Enter a domain (e.g., `example.com`)
4. Select a tool (theHarvester or Amass)
5. Click "Start Scan"
6. Wait for the scan to complete (status will update automatically)
7. Click "View Results" to see the findings

## Stop the Application

Press `Ctrl+C` in the terminal, then run:
```bash
docker-compose down
```

## View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

## Troubleshooting

### Ports already in use
If ports 80 or 8080 are in use, modify `docker-compose.yml` to use different ports.

### Docker daemon not running
Make sure Docker Desktop is running before starting the application.

### Database issues
The SQLite database is stored in `backend/data/osint.db`. If you need to reset:
```bash
docker-compose down
rm -rf backend/data/*.db
docker-compose up --build
```

