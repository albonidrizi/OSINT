# OSINT Web Application

A full-stack web application for performing OSINT (Open Source Intelligence) scans on domains using theHarvester and Amass tools. The application provides a modern, responsive interface for initiating scans, viewing results, and managing scan history.

## Architecture

- **Backend**: Kotlin with Spring Boot REST API
- **Frontend**: React with TypeScript
- **Database**: SQLite for scan persistence
- **Deployment**: Docker containers for both services
- **OSINT Tools**: theHarvester and Amass (executed via Docker containers)

## Features

- **Dual Tool Support**: Toggle between theHarvester and Amass for domain scanning
- **Real-time Updates**: Automatic polling for scan status updates
- **Drag-and-Drop Reordering**: Reorder scan cards with persistent storage
- **Direct URL Access**: Access individual scan details via shareable URLs
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UX**: Animations, transitions, tooltips, and toast notifications

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/albonidrizi/OSINT.git
cd OSINT
```

2. Build and start all services:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:8080/api

### Manual Build (Development)

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
./gradlew build
```

3. Run the application:
```bash
./gradlew bootRun
```

The backend will be available at http://localhost:8080

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at http://localhost:3000

## API Endpoints

### POST /api/scans
Initiate a new scan.

**Request Body:**
```json
{
  "domain": "example.com",
  "tool": "THEHARVESTER",
  "limit": 500,
  "sources": "google,bing,linkedin"
}
```

**Response:**
```json
{
  "id": 1,
  "domain": "example.com",
  "tool": "THEHARVESTER",
  "startTime": "2024-01-01T12:00:00",
  "endTime": null,
  "status": "RUNNING",
  "results": null,
  "errorMessage": null
}
```

### GET /api/scans
Get all scans, ordered by start time (descending).

**Response:**
```json
[
  {
    "id": 1,
    "domain": "example.com",
    "tool": "THEHARVESTER",
    "startTime": "2024-01-01T12:00:00",
    "endTime": "2024-01-01T12:05:00",
    "status": "COMPLETED",
    "results": "{...}",
    "errorMessage": null
  }
]
```

### GET /api/scans/{id}
Get a specific scan by ID.

**Response:**
```json
{
  "id": 1,
  "domain": "example.com",
  "tool": "THEHARVESTER",
  "startTime": "2024-01-01T12:00:00",
  "endTime": "2024-01-01T12:05:00",
  "status": "COMPLETED",
  "results": "{...}",
  "errorMessage": null
}
```

## Tool Configuration

### theHarvester

The application uses the `laramies/theharvester:latest` Docker image. Supported parameters:
- `domain`: Target domain (required)
- `limit`: Limit number of results (optional)
- `sources`: Comma-separated list of sources (optional)

### Amass

The application uses the `caffix/amass:latest` Docker image. The tool performs subdomain enumeration on the specified domain.

## Project Structure

```
OSINT/
├── backend/              # Kotlin/Spring Boot server
│   ├── src/main/kotlin/
│   │   └── com/osint/
│   │       ├── Application.kt
│   │       ├── controller/
│   │       ├── service/
│   │       ├── model/
│   │       ├── repository/
│   │       ├── dto/
│   │       └── config/
│   ├── build.gradle.kts
│   └── Dockerfile
├── frontend/            # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── App.tsx
│   ├── package.json
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## Troubleshooting

### Docker Issues

**Problem**: Docker containers fail to start
- **Solution**: Ensure Docker daemon is running and you have sufficient permissions
- **Solution**: Check if ports 80 and 8080 are already in use

**Problem**: Backend cannot connect to Docker daemon
- **Solution**: Ensure Docker socket is properly mounted: `/var/run/docker.sock:/var/run/docker.sock`

### Database Issues

**Problem**: Scans not persisting after restart
- **Solution**: Check that the `backend/data` directory exists and is writable
- **Solution**: Verify volume mounts in docker-compose.yml

### Tool Execution Issues

**Problem**: Scans fail with Docker errors
- **Solution**: Ensure Docker images are pulled: `docker pull laramies/theharvester:latest` and `docker pull caffix/amass:latest`
- **Solution**: Check Docker logs: `docker-compose logs backend`

### Frontend Issues

**Problem**: Cannot connect to backend API
- **Solution**: Verify backend is running on port 8080
- **Solution**: Check CORS configuration in backend application.properties
- **Solution**: Verify nginx proxy configuration in frontend/nginx.conf

## Development Notes

- The backend uses async execution for scans to prevent blocking
- Scan results are stored as JSON in the SQLite database
- Frontend polls for scan updates every 5 seconds
- Drag-and-drop order is persisted in browser localStorage
- Docker containers for OSINT tools are automatically pulled if not present

## License

This project is provided as-is for evaluation purposes.