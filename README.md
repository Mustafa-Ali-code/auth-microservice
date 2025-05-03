# Authentication & Authorization Microservice

A lightweight Node.js microservice providing JWT-based authentication and role-based authorization. Designed for scalability and observability, it supports horizontal scaling, Prometheus/Grafana monitoring, and structured logging. Originally deployed to Azure, it was later pivoted to a local Kubernetes setup.

---

## 🛠️ Features
- Register and login endpoints with hashed passwords
- JWT-based access and refresh tokens
- Role-based access control (`user`, `admin`)
- Middleware for authentication and authorization
- SQLite (for local dev) and Azure SQL support
- Morgan for request logging
- Prometheus metrics exposed on `/metrics`
- Grafana dashboards for monitoring CPU, memory, heap, event loop, etc.
- Artillery load testing simulation

---

## 📦 Tech Stack
- **Node.js** + **Express**
- **SQLite** (local) / **Azure SQL** (cloud)
- **JWT** for authentication
- **Prometheus** + **Grafana** for monitoring
- **Docker** + **Kubernetes** for containerization and orchestration

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/auth-microservice.git
cd auth-microservice
```

### 2. Setup `.env` file
```env
# DB (SQLite or Azure SQL)
USE_SQLITE=true
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_SERVER=your-db-server
DB_NAME=your-db-name

# Auth
JWT_SECRET=your-secret-key
```

### 3. Dockerize & Run Locally
```bash
docker build -t auth-microservice .
docker run -p 4000:3000 --env-file .env auth-microservice
```
Access the service at `http://localhost:4000`

---

## 🧪 API Endpoints

### `POST /register`
Register a new user.
```json
{
  "email": "user@example.com",
  "password": "secure123",
  "role": "admin" // optional
}
```

### `POST /login`
Login and receive JWT access and refresh tokens.

### `GET /protected`
Protected route requiring a valid token.

### `GET /admin`
Admin-only route.

### `POST /logout`
Clears refresh token cookie.

---

## 📊 Monitoring
### Metrics exposed on `/metrics`
Prometheus scrapes metrics from both running pods.

### Grafana Setup
- Port-forward Grafana: `kubectl port-forward svc/prometheus-grafana -n monitoring 3000:80`
- Access: `http://localhost:3000`
- Import dashboard ID `315` or create custom panels using Prometheus queries like:
  - `rate(process_cpu_seconds_total[1m])`
  - `nodejs_eventloop_lag_seconds`
  - `nodejs_heap_size_used_bytes`

---

## 📈 Load Testing
Use Artillery to simulate high traffic:
```bash
artillery run load-test.yaml
```
Example `load-test.yaml`:
```yaml
config:
  target: "http://localhost:4000"
  phases:
    - duration: 30
      arrivalRate: 5
scenarios:
  - flow:
      - post:
          url: "/login"
          json:
            email: "user@example.com"
            password: "secure123"
```

---

## 🐛 Known Issues / Improvements
- Currently no Redis support for token invalidation
- Rate limiting not yet implemented
- Alerts in Grafana are not configured

---

## 🧾 License
MIT License

---

## 🙌 Acknowledgements
Built as part of an Independent Study project at Sewanee (Spring 2025), under the guidance of Prof. X.
