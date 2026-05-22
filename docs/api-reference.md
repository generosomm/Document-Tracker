# API Reference (Developer Map)

This is a practical endpoint map for maintenance and onboarding.

## Authentication and Session
- assets/api/login.php
  - Local login or OTP trigger based on account_type.
- assets/api/verify_otp.php
  - Completes OTP-based login session.
- assets/api/check_session.php
  - Session status checks for frontend guards.
- assets/api/google_login_init.php
  - Starts Google OAuth flow.
- assets/api/google_callback.php
  - Handles OAuth callback and account linking/session.
- assets/api/google_config.php
  - OAuth client setup and DB include helper.

## User, Role, Department, and Route Admin
- assets/api/admin_api.php
  - action-driven endpoint for:
    - users: get_user, add_user, update_user, delete_user
    - roles: add_role, update_role, delete_role
    - permissions: get_permissions, update_permission
    - departments: add_dept, update_dept, delete_dept
    - routes and dashboard data: get_all_data and related actions
- assets/api/admin_add_user.php
  - Adds user and attempts invitation email (soft-fail if email fails).
- assets/api/get_users.php
- assets/api/get_departments.php
- assets/api/get_routes.php
- assets/api/check_permission.php

## Documents and Timeline
- assets/api/save_document.php
  - Creates documents row and initial timeline entry.
- assets/api/get_documents.php
  - List retrieval by mode:
    - default active list
    - type=archive
    - type=analytics or type=all
- assets/api/get_timeline.php
  - Fetches timeline details for a document.
- assets/api/transfer_document.php
  - Handles transfer, signing flow hooks, status/progress updates, and timeline inserts.
- assets/api/delete_document.php
- assets/api/get_archived_documents.php

## Signing and File Handling
- assets/api/pnpki_sign.php
  - Digital signing integration path.
- assets/api/upload_signature.php
  - Signature image upload helper endpoint.
- assets/api/serve-file.php
  - File serving endpoint for stored documents.

## Memo and Notifications
- assets/api/memo_api.php
  - action-driven endpoint:
    - get_memos, get_archived_memos, get_memo_details
    - add_memo, update_memo, delete_memo
    - track_view, get_memo_viewers
- assets/api/trigger_memo_blast.php
- assets/api/trigger_notification.php
- assets/api/mailer.php

## Infrastructure and Utility
- assets/api/db_connect.php
  - DB bootstrap, .env support, UTF-8 charset, connection error response.
- assets/api/test_connect.php
  - Connection test utility.

## API Notes
- Most endpoints return JSON with success and message/data fields.
- Several endpoints support action-based multiplexing instead of REST-style URI segmentation.
- Input formats vary by endpoint (FormData, POST fields, and JSON body in some routes).
