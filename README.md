# 🛡️ OSINT Web Application

[![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
![Test Coverage](https://img.shields.io/badge/Coverage-92%25-brightgreen?style=for-the-badge)

A professional, full-stack OSINT (Open Source Intelligence) orchestration platform. It enables security researchers to perform domain intelligence gathering using industry-standard tools like `theHarvester` and `Amass` through a highly polished, responsive web interface.

---

## 🏗️ Architecture & Technical Stack

The system leverages a modern asynchronous architecture to handle long-running OSINT scans without blocking the user interface.

```mermaid
graph TD
    User((User)) -->|React Frontend| WebApp[Web Dashboard]
    WebApp -->|REST API| Backend[Spring Boot Backend]
    Backend -->|Async Task| Orchestrator[OSINT Orchestrator]
    Orchestrator -->|Docker-in-Docker| Tools[theHarvester / Amass Container]
    Tools -->|JSON Output| Orchestrator
    Orchestrator -->|Persist| DB[(SQLite Database)]
    Backend -->|Poll/Subscribe| DB
    DB -->|Real-time UI| WebApp
```

### 🛠️ Core Technology Rationale
- **Backend (Kotlin/Spring Boot)**: Chosen for its robust type safety and excellent asynchronous support (Coroutines/Async).
- **Frontend (React/TypeScript)**: Leverages a component-based architecture for rich interactivity (Framer Motion) and strict typing for maintainability.
- **Persistence (SQLite)**: Provides local-first, portable, and reliable storage for scan history without the overhead of a full RDBMS.
- **Containerization (Docker)**: Scans are executed in transient, isolated containers to ensure environment consistency and host-level security (sandboxing).

---

## ✨ Premium Features

- **Rich Aesthetics**: A "Dark Mode" first interface featuring glassmorphism, smooth animations, and a responsive CSS grid.
- **Real-time Intelligence**: Automatic status polling and live result parsing for immediate feedback.
- **Persistent Reordering**: Implements a persistent drag-and-drop system for scan history management.
- **Shareable Insights**: Unique URL persistence for every scan, enabling direct access to historical findings.

---

## 🧪 Proven Quality (Testing)

This project prioritizes robustness with a comprehensive CI/CD-ready testing suite.

| Module | Coverage | Technologies |
| :--- | :--- | :--- |
| **Core Logic (Hooks/Services)** | **100%** | Jest, RTL, MSW |
| **API Layer** | **100%** | JUnit 5, MockK, MockMvc |
| **UI Components** | **~90%** | React Testing Library |
| **Overall Project** | **>92%** | Jacoco, Jest-Coverage |

### 🎥 Visual Proof of Quality

| Project Demo | Frontend Coverage | Backend Test Suites |
| :---: | :---: | :---: |
| [![Project Demo](https://img.youtube.com/vi/RyXWD9HhyBc/0.jpg)](https://www.youtube.com/watch?v=RyXWD9HhyBc) | ![Frontend Coverage](docs/images/frontend_coverage.png) | ![Backend Tests](docs/images/backend_tests.png) |

---

## 🛰️ API Specification (Brief)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/scans` | Initiate a new OSINT scan. |
| `GET` | `/api/scans` | Retrieve all historical scans. |
| `GET` | `/api/scans/{id}` | Fetch detailed results for a specific scan. |
| `DELETE` | `/api/scans` | Clear all scan history. |

---

## 🚀 Getting Started

Quickly orchestrate and start all services using Docker:

```bash
# Clone the repository
git clone https://github.com/albonidrizi/OSINT.git
cd OSINT

# Start production-ready services
docker-compose up --build -d
```

Access the dashboard at **[http://localhost](http://localhost)**. For deeper customization, refer to the [QUICKSTART.md](QUICKSTART.md).

---

## 🛡️ Security Note
All tools are executed in sandboxed containers. No external dependencies are executed directly on the host machine, mitigating risk from third-party scan scripts.

## 📜 License
This project is built for professional evaluation and portfolio purposes.
