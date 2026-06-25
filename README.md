---
# Document Tracker System (DTS)

Document Tracker System (DTS) is a PHP web application for submitting, routing, tracking, and archiving documents and memos. It provides role-based access, timeline/history views, PDF generation, email notifications, and optional Google OAuth authentication.

This README is a professional project entrypoint for contributors, maintainers, and deployers. For full developer onboarding and architecture, see the `docs/` folder linked below.

Table of contents
- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Quick start (summary)](#quick-start-summary)
- [Docs and references](#docs-and-references)
- [Security & sharing](#security--sharing)
- [Contributing](#contributing)

## Features
- Document submission, routing, transfer, and archival
- Document timeline and activity history with notes and actors
- Role-based user and permission management
- PDF generation and manipulation (FPDF/FPDI)
- Email notifications and memo blasts (PHPMailer)
- Optional Google OAuth authentication for login

## Tech stack
- Backend: PHP (vanilla scripts), Composer for dependency management
- Database: MySQL / MariaDB
- Frontend: HTML, CSS, Vanilla JavaScript
- Libraries: PHPMailer, Google API Client, FPDI/FPDF
- Local runtime: Apache (recommended via XAMPP for Windows)

## Project structure
Top-level layout (important files and directories):

```
Document-Tracker/
├─ assets/
│  ├─ api/                 # PHP endpoints (login, document APIs, admin)
│  ├─ css/                 # stylesheets
│  ├─ js/                  # frontend JavaScript
│  ├─ libs/                # bundled third-party libraries (FPDI, FPDF)
│  └─ composer.json        # (duplicate manifest - prefer root composer.json)
├─ components/             # HTML partials & modals
├─ database/
│  └─ schema.sql           # DB schema and migrations
├─ docs/                   # detailed docs: setup, API, architecture
├─ pages/                  # app entry pages (login, dashboard, records...)
├─ uploads/                # runtime uploads (git-ignored)
├─ vendor/                 # composer packages (git-ignored)
├─ composer.json           # project's Composer manifest (root)
├─ .env.example            # configuration template (do not commit secrets)
└─ README.md               # this file
```

Notes:
- `assets/api/` contains all server-side endpoints used by the frontend.
- `assets/libs/` contains bundled libraries included directly; consider using Composer (`vendor/`) instead to avoid duplicate code.

## Quick start (summary)
For step-by-step setup see `docs/setup-and-deployment.md`. Minimal summary:

1. Install XAMPP (Apache + MySQL) and Composer.
2. Place the project in XAMPP `htdocs` (e.g. `C:\xampp\htdocs\Document-Tracker`).
3. Run `composer install` from the project root.
4. Copy `.env.example` to `.env` and fill DB and OAuth values.
5. Import DB schema: `mysql -u root -p dts_db < database/schema.sql`.
6. Start Apache and open `http://localhost/Document-Tracker/pages/login.html`.

## Docs and references
- [Setup & Deployment](docs/setup-and-deployment.md)
- [Project Overview](docs/project-overview.md)
- [Architecture & Flows](docs/architecture-and-flows.md)
- [API Reference](docs/api-reference.md)
- [Database Reference](docs/database-reference.md)
- [Known Issues & Notes](docs/known-issues-and-notes.md)

## Security & sharing
- Never commit `.env` or secrets. Use `.env.example` for templates.
- `vendor/`, `uploads/`, and other generated files are ignored via `.gitignore`.
- If secrets were committed, remove them from history with `git filter-repo` or BFG and rotate credentials.

## Contributing
- Use feature branches and open pull requests with clear descriptions.
- Keep large binary files out of the repository; use external storage if needed.

