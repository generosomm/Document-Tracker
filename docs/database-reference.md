# Database Reference

Source of truth: database/schema.sql

## Core Tables

### documents
Purpose:
- Stores document metadata, routing state, and file linkage.

Key fields:
- doc_id (primary identifier used across API)
- title, description, category
- dept (origin department)
- status (pending/progress/completed/released/rejected)
- progress (numeric progress value)
- assignee (current department/user target)
- finalized_by (archive/finalization marker)
- custom_route (JSON route sequence override)
- file_path, original_file_path
- created_date

### doc_timeline
Purpose:
- Immutable-style event history used for tracking and progress display.

Key fields:
- doc_id
- user, role
- action
- timestamp
- icon, details
- meta, view_tag

Common actions include:
- Document Created
- In Progress
- Signed
- Transferred
- Viewed

### fixed_routes
Purpose:
- Category-based default route sequence.

Key fields:
- category
- route_sequence (JSON-encoded ordered list)

### users
Purpose:
- User identities and login context.

Key fields:
- id
- name, email, password
- role, dept
- account_type (local/google)
- otp_code, otp_expiry
- signature_file
- is_verified

### user_roles
Purpose:
- Dynamic role definitions used by admin UI and permission matrix.

### role_permissions
Purpose:
- Feature switches per role (for example upload_document, sign_document, view_analytics).

Typical columns:
- role_name
- feature_key
- is_enabled

### departments
Purpose:
- Master list of department names used in assignee and routing flows.

### memos
Purpose:
- Internal memo content and lifecycle state.

Key fields:
- title, message, type, ref_no
- created_by
- target_audience
- duration_days
- archive_status
- attachment
- created_at

### memo_views
Purpose:
- Memo readership telemetry.

Key fields:
- memo_id
- viewer_name, viewer_role
- total_duration
- has_downloaded
- first_viewed, last_viewed

## Relationship Notes (Logical)
- documents.doc_id -> doc_timeline.doc_id
- memos.id -> memo_views.memo_id
- users.role -> user_roles.role_name
- role_permissions.role_name -> user_roles.role_name
- documents.category -> fixed_routes.category (application-level mapping)

## Data Integrity Notes
- Some relationships are enforced by application logic rather than strict foreign keys.
- Route and status correctness depends on API behavior in transfer_document.php.
- Timeline is the operational audit trail and is critical to troubleshooting.
