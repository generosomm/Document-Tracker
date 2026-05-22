# Architecture and Flows

## Runtime Architecture
- Presentation layer: static HTML pages under pages/ plus reusable component HTML under components/.
- Client behavior layer: page and modal scripts under assets/js/.
- API layer: procedural PHP endpoints under assets/api/.
- Data layer: MySQL/MariaDB with schema in database/schema.sql.
- File storage layer: uploads folders for documents and signatures.

## Request Pattern
1. Browser opens page from pages/.
2. Page script loads and fetches data from assets/api/*.php.
3. PHP endpoint starts session, validates role/permissions when implemented, and reads/writes DB.
4. Endpoint returns JSON consumed by frontend rendering logic.

## Document Lifecycle Flow
1. Create:
   - Endpoint: assets/api/save_document.php
   - Persists documents row and inserts Document Created event into doc_timeline.
2. Track:
   - Endpoint: assets/api/get_documents.php
   - Returns document list plus timeline entries per document.
3. Transfer:
   - Endpoint: assets/api/transfer_document.php
   - Resolves next assignee and updates progress/status.
4. Sign:
   - Endpoint: assets/api/transfer_document.php with sign action and/or assets/api/pnpki_sign.php.
   - Updates PDF/signature-related state and timeline.
5. Archive visibility:
   - Endpoint: assets/api/get_documents.php?type=archive
   - Includes released/rejected/finalized results.

## Routing Model
- Preferred order source:
  1. documents.custom_route (document-specific)
  2. fixed_routes.route_sequence (category-based fallback)
- Repeated department handling uses enhanced index detection logic (findNextIdx) in transfer flow.

## Permission Model
- role_permissions table stores feature toggles by role.
- Endpoints such as save_document.php and transfer_document.php call permission checks for sensitive actions.
- Not all endpoints are equally hardened; enforce consistent checks before production deployment.

## Memo Subsystem Flow
1. Create memo via memo_api.php action add_memo.
2. Read active memos via action get_memos.
3. Auto-archive expires based on duration_days.
4. Track user viewing/downloading behavior in memo_views.

## Auth Flow Summary
- Local account: login.php validates email/password and initializes session directly.
- Google account type: login.php sends OTP, verify_otp.php completes session after OTP validation.
- OAuth path exists through google_login_init.php and google_callback.php.

## Where To Modify Common Behaviors
- Change routing behavior: assets/api/transfer_document.php
- Change submission defaults: assets/api/save_document.php
- Change archive criteria: assets/api/get_documents.php
- Change feature access matrix: assets/api/admin_api.php + role_permissions table
- Change memo expiration logic: assets/api/memo_api.php
