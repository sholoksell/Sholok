SHOLOK CONTROL CENTER — SUPER ADMIN FRONTEND
============================================
Version: Updated Master Specification v2.0
Prepared: 2 November 2026

PROJECT PURPOSE
---------------
A centralized Super Admin frontend for managing the Sholok ecosystem and its 20 planned services. The full product requirements and architecture decisions are documented in:
../SHOLOK-CONTROL-CENTER-UPDATED-MASTER-SPECIFICATION.md

FILES
-----
index.html   Application shell and navigation
style.css    Design system, layouts, tables, forms, dialogs and responsive breakpoints
script.js    Module rendering, interactions and local prototype data
../SHOLOK-CONTROL-CENTER-UPDATED-MASTER-SPECIFICATION.md  Full product specification
../TEST-REPORT.txt  Static validation results and limitations

RUN LOCALLY
-----------
1. Extract the ZIP archive.
2. Open Sholok-Super-Admin/index.html in a modern browser.
3. For local development, use a static server such as VS Code Live Server.

18 CONTROL CENTER MODULES
-------------------------
1. Overview
2. Service Management
3. Users & Accounts
4. Service Admins
5. Roles & Permissions
6. Content & Moderation
7. Commerce & Marketplace
8. Pay & Finance
9. Approval Workflows
10. Analytics & Reports
11. Security Center
12. Audit Logs
13. System Health
14. Integrations & APIs
15. Notification Center
16. Backup & Recovery
17. Global Settings
18. Support Center

KEY UPDATES IN THIS VERSION
---------------------------
- Canonical service directory aligned to the 20 services in the Master Specification.
- Service administrative status uses Active / Deactive; technical health is a separate concept.
- Recommended HTTPS public URL is shown as a clickable link on each service card.
- Manage opens the selected service's proposed /admin route in a new tab.
- Global account types no longer include Buyer; Buyer is explained as a Shopping-specific role/capability.
- Content review cards use Review and open a service-filtered content queue.
- Content review records show creator and last-modified attribution; Super Admin decisions update last-modified attribution while retaining original creator.
- Legacy prototype records are normalized to the current service names and account-type model.
- Added service URL affordance styling.

FRONTEND PROTOTYPE CAPABILITIES
-------------------------------
- Central navigation, responsive sidebar, mobile drawer, global search, quick actions and notifications.
- All 20 registered services are listed irrespective of Active / Deactive state.
- Service search, category/status filters, service detail/configuration and CSV export.
- User and Service Admin directories with mobile number fields, validation, search, filters and local CRUD actions.
- Role permission matrix and service assignment model.
- Content review queue with service-specific review entry points and local moderation decisions.
- Commerce/finance, approvals, analytics, security, audit, system health, integrations, notifications, backup, settings and support views.
- Browser localStorage is used only for prototype persistence.

IMPORTANT PRODUCTION BOUNDARY
----------------------------
This deliverable is a FRONTEND PROTOTYPE. It does not contain a production backend, secure authentication/SSO, MySQL connection, payment gateway, real notification delivery, server-enforced permissions, real-time monitoring or actual backup/restore execution.

The separate backend phase must implement:
- Secure authentication, MFA, password reset, session lifecycle and cross-subdomain SSO.
- MySQL schema, migrations, API endpoints, validation and multi-user data synchronization.
- Server-side RBAC, service scoping and resource/content ownership checks on every protected endpoint.
- Immutable server-side audit logs and revision history.
- Payment gateway integration, webhook verification, idempotency, reconciliation, refund and payout execution.
- Real email/SMS/push delivery and webhook processing.
- VPS, database, service uptime and API health monitoring.
- Encrypted MySQL/file backups, off-site storage and tested restore/disaster recovery.

Browser localStorage and frontend permission checks are not security boundaries. Recommended URLs are planned hostnames; DNS, SSL, hosting and service admin routes must be configured before they are live. Demo metrics and seed records are illustrative.

USERS & ACCOUNTS UPDATE
-----------------------
- Added Service as an Account Type option.
- Added a multi-select Service assignment field with all 20 requested services, Select all and Clear controls.
- Account service assignments are stored with the local prototype account record and included in CSV export.
- Added Blocked to account status options and filters, a blocked-account summary metric, and Block / Unblock row actions.
- Existing account status options and the other Control Center modules remain available.
