# Setup and Deployment

## Tech Stack
- PHP (XAMPP-style local hosting)
- MySQL or MariaDB
- JavaScript frontend (vanilla scripts)
- Composer-managed PHP libraries

## Dependencies
From composer.json:
- google/apiclient ^2.18
- phpmailer/phpmailer ^7.0

## Prerequisites
- XAMPP installed and running (Apache + MySQL)
- Composer installed
- Access to phpMyAdmin or MySQL CLI

## For Team Members
If you are setting this up on another PC, follow these steps:
1. Clone the repository or download the ZIP.
2. Place the project folder inside XAMPP `htdocs`.
3. Run `composer install` in the project root.
4. Create the database and import the schema.
5. Update `.env` if your local database credentials are different.
6. Open the app through Apache, not Live Server.

## Local Setup (Windows + XAMPP)
1. Place the project folder under `htdocs`.
2. Open a terminal in the project root.
3. Install dependencies with Composer.
4. Create the database named `dts_db`.
5. Import `database/schema.sql` into MySQL or MariaDB.
6. Create or update `.env` in the project root.

Example .env:
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=dts_db

7. Start Apache and MySQL in XAMPP.
8. Open the app through Apache:
   - `http://localhost/Document-Tracker/pages/login.html`
   - If the folder name differs, adjust the URL accordingly.
9. Do not use VS Code Live Server for login or API calls.

## Database Connection Behavior
`assets/api/db_connect.php` loads database settings from:
1. `.env` file in the project root, if present
2. fallback defaults: `localhost`, `root`, empty password, `dts_db`

## Composer Install Location
Run `composer install` from the project root, not from `assets/`.

Reason:
- The PHP code loads dependencies from `vendor/autoload.php` in the root folder.
- The root `composer.json` is the active dependency manifest for this project.
- `assets/composer.json` is a duplicate and should not be used for setup.

## Session and Cookie Notes
- Most endpoints initialize session with path=/ and SameSite=Lax.
- Behavior depends on the local protocol/domain setup.

## Google OAuth Notes
- Google OAuth is configured in assets/api/google_config.php.
- Client ID, secret, and redirect URI are hardcoded there.
- The current redirect URI is set for an ngrok HTTPS URL, so Google login will not work on plain Live Server.
- For local Apache testing, the Google redirect URI must be changed to your local host URL, or you should use the ngrok URL configured in the file.
- For deployment, move secrets to environment variables and set environment-specific redirect URIs.

## Deployment Checklist (Basic)
1. Set production DB credentials in environment.
2. Disable error display in production PHP config.
3. Move OAuth secrets out of source files.
4. Enforce HTTPS and verify secure cookie settings.
5. Restrict write permissions to uploads paths only.
6. Verify mailer settings for invitation and OTP emails.
7. Back up database before schema or route changes.

## Smoke Test After Setup
1. Login with a known local account.
2. Submit a document and verify timeline entry creation.
3. Transfer document to next department.
4. Open tracking and records pages and confirm expected visibility.
5. Create a memo and verify retrieval and view tracking.
