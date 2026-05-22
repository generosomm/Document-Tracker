# Document Tracker System (DTS)

Document Tracker System (DTS) is a web application for managing, routing, and tracking documents and memos across organizational units. DTS is used to submit, route, approve, sign, archive, and view document timelines with role-based access control.

This README is intended for all audiences (developers, deployers, and project collaborators). Technical setup and deep architecture details live in `/docs` — follow that order when onboarding.

## Who is this for
- Project contributors who need a quick orientation
- Developers who will run and modify the code locally
- IT/DevOps preparing local or production deployments

## What the app does (high level)
- Submit and route documents between departments
- Track document history and timeline with events
- Transfer and archive documents
- Generate and manipulate PDFs (FPDF/FPDI)
- Send email notifications and memo blasts
- Optional Google OAuth login integration

## Tech stack
- Backend: PHP (plain PHP scripts), Composer for package management
- Database: MySQL / MariaDB
- Frontend: HTML, CSS, Vanilla JavaScript
- Key libraries: PHPMailer, Google API Client, FPDI/FPDF
- Local runtime: Apache (XAMPP) recommended for PHP endpoints

## Project layout
Top-level folders and purpose:

- `pages/` — entry HTML pages (login.html, dashboard.html, records.html, etc.)
- `assets/js/` — frontend JavaScript code
- `assets/css/` — stylesheets
- `assets/api/` — backend PHP endpoints (login, document API, admin API)
- `components/` — reusable HTML partials & modals
- `assets/libs/` — bundled third-party library code (consider using Composer instead)
- `vendor/` — Composer-managed dependencies (should be ignored in git)
- `database/` — schema and SQL migration files
- `docs/` — full onboarding, API reference, and architecture docs

## Quick start (overview)
For full instructions see `docs/setup-and-deployment.md`. Short walkthrough:

1. Install XAMPP (Apache + MySQL) and Composer.
2. Place the repo under XAMPP's `htdocs/` (e.g. `C:\xampp\htdocs\Document-Tracker`).
3. From project root run:

```bash
composer install
```

4. Copy `.env.example` to `.env` and fill in database and OAuth values.
5. Import schema:

```bash
mysql -u root -p dts_db < database/schema.sql
```

6. Start Apache and open: `http://localhost/Document-Tracker/pages/login.html`.

## Important operational notes
- Do not open the frontend via Live Server (:5500) — it cannot reach PHP API endpoints. Use Apache/localhost.
- Keep secrets out of git: never commit `.env` or client secrets. Use `.env.example` as a template.
- `vendor/`, `uploads/` and runtime-generated files are git-ignored by default.

## Docs & references (read this order)
- [1 - Setup & Deployment](docs/setup-and-deployment.md)
- [2 - Project Overview](docs/project-overview.md)
- [3 - Architecture & Flows](docs/architecture-and-flows.md)
- [4 - API Reference](docs/api-reference.md)
- [5 - Database Reference](docs/database-reference.md)
- [6 - Known Issues & Notes](docs/known-issues-and-notes.md)

## Contributing
- Create a branch per feature/fix, open a PR with a clear description.
- Avoid committing large binaries or secrets; use `uploads/` for local files and keep it ignored.

## Need help?
- Reach out to repository owner or open an issue in the remote repo. Follow the docs in `/docs` for troubleshooting and deployment guidance.

---
This README provides orientation — see `/docs` for step-by-step developer and deployment instructions.
