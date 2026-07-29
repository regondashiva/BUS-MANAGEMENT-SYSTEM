# 🚀 Project Dev Commands — Travels App

> **Stack:** Django REST Framework (Backend) + React + Vite + TailwindCSS (Frontend)

---

## 📁 Project Structure

```
djangoproject/
├── backend/
│   ├── .venv/              ← Python virtual environment
│   ├── travels/            ← Django project root (manage.py lives here)
│   └── requirements.txt
└── frontend/
    └── travels/            ← React + Vite app root (package.json lives here)
```

---

## 🐍 Backend — Django REST Framework

All backend commands are run from:
`c:\Users\shiva\OneDrive\Desktop\project\djangoproject\backend\travels`

### 1. Activate Virtual Environment

```powershell
# From the backend folder
cd c:\Users\shiva\OneDrive\Desktop\project\djangoproject\backend
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Run Migrations

```powershell
# Navigate into the Django project
cd travels

# Create migration files
python manage.py makemigrations

# Apply migrations to the database
python manage.py migrate
```

### 4. Create Superuser (Admin)

```powershell
python manage.py createsuperuser
```

### 5. Start Development Server

```powershell
python manage.py runserver
```

> 🌐 Backend runs at: **http://127.0.0.1:8000/**
> 🔑 Admin panel at: **http://127.0.0.1:8000/admin/**

### 6. Other Useful Backend Commands

```powershell
# Collect static files (for production)
python manage.py collectstatic

# Open Django shell
python manage.py shell

# Check for any project issues
python manage.py check

# Run tests
python manage.py test
```

---

## ⚛️ Frontend — React + Vite + TailwindCSS

All frontend commands are run from:
`c:\Users\shiva\OneDrive\Desktop\project\djangoproject\frontend\travels`

### 1. Navigate to Frontend

```powershell
cd c:\Users\shiva\OneDrive\Desktop\project\djangoproject\frontend\travels
```

### 2. Install Node Dependencies

```powershell
npm install
```

### 3. Start Development Server

```powershell
npm run dev
```

> 🌐 Frontend runs at: **http://localhost:5173/**

### 4. Build for Production

```powershell
npm run build
```

> Output goes to the `dist/` folder.

### 5. Preview Production Build

```powershell
npm run preview
```

### 6. Run Linter

```powershell
npm run lint
```

---

## 🔁 Running Both Servers Simultaneously

Open **two separate PowerShell terminals** and run:

**Terminal 1 — Backend:**
```powershell
cd c:\Users\shiva\OneDrive\Desktop\project\djangoproject\backend
.\.venv\Scripts\Activate.ps1
cd travels
python manage.py runserver
```

**Terminal 2 — Frontend:**
```powershell
cd c:\Users\shiva\OneDrive\Desktop\project\djangoproject\frontend\travels
npm run dev
```

---

## 🌐 Running URLs at a Glance

| Service         | URL                          |
|-----------------|------------------------------|
| Django Backend  | http://127.0.0.1:8000/       |
| Django Admin    | http://127.0.0.1:8000/admin/ |
| DRF API Browser | http://127.0.0.1:8000/api/   |
| React Frontend  | http://localhost:5173/       |

---

## ⚠️ Notes

- Always activate the **virtual environment** before running any `python` or `pip` commands.
- Make sure **Redis** is running if you use Django Channels (`channels-redis`).
- CORS is configured via `django-cors-headers` — ensure `CORS_ALLOWED_ORIGINS` includes `http://localhost:5173` in your Django settings.
