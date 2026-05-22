# Known Issues and Notes

## Repeated Departments in Route Sequences
Summary:
- Routing sequences that contain the same department multiple times can break if only first-match indexing is used.

Current status:
- transfer_document.php includes findNextIdx logic to account for repeated department visits.

Reference:
- ../ROUTING_FIX_NOTES.md

Validation checklist:
1. Build a route with repeated department acronym or full name.
2. Transfer through all steps.
3. Confirm progress and assignee move to the correct repeated step.

## Timeline Editor Temporary Feature (Documentation Mismatch Risk)
Summary:
- TIMELINE_EDITOR_GUIDE.md documents a temporary admin timeline editing feature.
- The guide references files that are not currently present in this workspace:
  - assets/api/edit_timeline.php
  - components/edit-timeline-modal.html

Impact:
- The guide is useful historical context, but not fully aligned with current files.

Reference:
- ../TIMELINE_EDITOR_GUIDE.md

## Security and Production Hardening Notes
- Some authentication flows use plaintext password matching in login and admin user creation flows.
- OAuth client credentials appear hardcoded in source config.
- Permission checks are present in key endpoints but not uniformly applied everywhere.

## Operational Notes
- Upload paths are used for documents and signatures; ensure writable directories and backups.
- Memos auto-expire based on duration_days and are moved to archive status by application logic.
- Archive visibility in get_documents.php is based on released/rejected/finalized criteria.

## Suggested Follow-up Cleanup
1. Move secrets to environment variables.
2. Standardize password hashing and verification.
3. Audit all endpoints for consistent permission checks.
4. Update or retire historical docs that no longer match active code.
