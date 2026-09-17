# Development Guide — Normalization Lab

## 1. Prerequisites

- **Node.js**: >= 18.0.0 (Node.js 20+ recommended)
- **npm**: >= 9.0.0
- **Python**: >= 3.10 (Python 3.12 or 3.14 recommended)

---

## 2. Quick Start Setup

### Step 1: Clone and Environment Setup
```bash
git clone <repository_url>
cd dbmsProject

# Copy environment variables
cp .env.example .env
```

### Step 2: Backend Setup
```bash
# Create Python virtual environment
python3 -m venv backend/.venv

# Activate virtual environment
# On macOS / Linux:
source backend/.venv/bin/activate
# On Windows:
# backend\.venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## 3. Running Locally

### Starting the Backend Server
From the project root:
```bash
# Activate virtual environment
source backend/.venv/bin/activate

# Run FastAPI server with auto-reload
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
- API Endpoint: `http://localhost:8000/api/v1`
- Interactive OpenAPI Docs: `http://localhost:8000/api/v1/docs`
- Health Check: `http://localhost:8000/api/v1/health`

### Starting the Frontend Development Server
In a separate terminal:
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 4. Running Tests

### Backend Tests (pytest)
```bash
./backend/.venv/bin/pytest backend/tests/ -v
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```

### Frontend Production Build & Type Check
```bash
cd frontend
npm run build
```

---

## 5. Troubleshooting

- **CORS Errors**: Check `BACKEND_CORS_ORIGINS` in `.env`. Ensure your Vite dev server port (`http://localhost:5173`) is listed.
- **Backend Disconnected in Frontend**: Ensure the FastAPI server is running on port 8000 and `/api/v1/health` returns `{"status": "ok"}`.
- **Database Lock**: SQLite database file `normalization_lab.db` is stored locally in the project root. Remove the file if you wish to reset application state.
