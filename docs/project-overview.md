# Project Overview

## What This System Does
Document Tracker System (DTS) is a PHP and JavaScript web application for routing internal government documents across departments, tracking progress, recording timeline events, and archiving completed records.

## Primary User Roles
- Super Administrator: full control, admin management, system configuration.
- Admin: user/department/route management and general administration.
- Department Head or Staff: submit documents, view assigned items, transfer, sign, and track status.

## Core Business Flow
1. A user submits a document with metadata and optional PDF file.
2. The document is saved to documents table with an initial status.
3. A timeline event is inserted into doc_timeline.
4. Assigned department opens, reviews, signs (if applicable), and transfers.
5. Routing follows custom_route (if set per document) or fixed_routes by category.
6. Progress updates until completion, then records appear in archive views.

## Main Application Surfaces
- pages/login.html: manual and Google-based login flow.
- pages/dashboard.html: summary cards, active list, memo visibility.
- pages/tracking.html: active tracking and timeline visualization.
- pages/records.html: archive/released/rejected/finalized records.
- pages/analytics.html: metrics and chart-based reporting.
- pages/admin.html: user, role, department, route, and permission management.

## Repository Structure (Important Areas)
- assets/api: backend PHP endpoints and business logic.
- assets/js: page scripts and modal behavior.
- components: shared modal HTML fragments.
- database/schema.sql: schema and seed data snapshot.
- uploads: user-uploaded documents and signatures.
- vendor: Composer dependencies.

## Security and Permission Model (Current)
- Sessions are used for authenticated context.
- Feature-level access checks rely on role_permissions in key endpoints.
- Some endpoints still contain optional or partial role checks and should be reviewed before production hardening.

## Current Implementation Notes
- Passwords are handled in plaintext in several flows (no password_hash/password_verify).
- Google OAuth client settings are present in source config.
- Timeline and routing logic are heavily coupled to transfer behavior in transfer_document.php.
