# DTS Developer Docs

This docs set is the technical source of truth for the Document Tracker System.

## Read First
1. project-overview.md
2. setup-and-deployment.md
3. architecture-and-flows.md
4. feature-map.md
5. api-reference.md
6. database-reference.md
7. known-issues-and-notes.md

## Scope
- Project purpose and workflow
- Local setup and runtime expectations
- Frontend and backend architecture map
- API endpoint catalog by domain
- Database table reference and relationships
- Known caveats and operational notes

## Quick System Map
- Frontend pages: pages/*.html
- Frontend logic: assets/js/*.js
- Reusable modals/components: components/*.html
- Backend endpoints: assets/api/*.php
- Database schema: database/schema.sql

## Conventions Used in Docs
- Endpoint examples assume local path under assets/api.
- Status values are written as they appear in the codebase and database (for example: pending, progress, completed, released, rejected).
- Role and permission checks are based on role_permissions entries.

## Historical Notes
These files exist in the repository and are still useful for context:
- ../ROUTING_FIX_NOTES.md
- ../TIMELINE_EDITOR_GUIDE.md

Use the docs in this folder for current developer onboarding, and treat historical notes as supplemental context.
