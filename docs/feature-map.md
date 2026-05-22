# Feature Map

This file maps each major page to its frontend scripts, backend endpoints, and related components.

## Login
- Page: pages/login.html
- Scripts: assets/js/login.js, assets/js/header.js
- APIs:
  - assets/api/login.php
  - assets/api/verify_otp.php
  - assets/api/google_login_init.php
  - assets/api/google_callback.php

## Dashboard
- Page: pages/dashboard.html
- Scripts: assets/js/dashboard.js, assets/js/memo-modal.js, assets/js/document-preview-modal.js
- APIs (typical):
  - assets/api/get_documents.php
  - assets/api/get_timeline.php
  - assets/api/memo_api.php

## Tracking
- Page: pages/tracking.html
- Scripts: assets/js/tracking.js, assets/js/document-timeline-modal.js, assets/js/transfer-modal.js, assets/js/sign-modal.js
- APIs:
  - assets/api/get_documents.php
  - assets/api/transfer_document.php
  - assets/api/get_timeline.php
  - assets/api/pnpki_sign.php
  - assets/api/upload_signature.php

## Records
- Page: pages/records.html
- Scripts: assets/js/records.js
- APIs:
  - assets/api/get_documents.php?type=archive
  - assets/api/get_archived_documents.php
  - assets/api/serve-file.php

## Analytics
- Page: pages/analytics.html
- Scripts: assets/js/analytics.js
- APIs:
  - assets/api/get_documents.php?type=analytics
  - assets/api/admin_api.php (for selected aggregate views depending on implementation)

## Admin
- Page: pages/admin.html
- Scripts: assets/js/admin.js, assets/js/admin-modals.js, assets/js/permission-manager.js
- APIs:
  - assets/api/admin_api.php
  - assets/api/admin_add_user.php
  - assets/api/get_users.php
  - assets/api/get_departments.php
  - assets/api/get_routes.php
  - assets/api/check_permission.php

## Shared Components
- HTML fragments in components/:
  - header.html
  - submit-document-modal.html
  - transfer-modal.html
  - sign-document-modal.html
  - memo-modal.html
  - document-preview-modal.html
  - document-timeline-modal.html
  - admin-modals.html

## Maintenance Tip
When debugging a page feature:
1. Check page HTML in pages/.
2. Follow script imports in assets/js/.
3. Trace network calls to assets/api/ endpoint.
4. Confirm the corresponding schema fields exist in database/schema.sql.
