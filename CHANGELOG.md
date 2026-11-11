# Changelog

All notable changes to the EdgeWatch Web Application are documented in this file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-11-11
### Added
- Connection to the EdgeWatch Platform REST API (JWT session, localized problem details, nested resources); the fake API remains only for Billing.
- Brand theme: EdgeWatch PrimeVue preset (industrial orange and navy), sidebar shell with grouped navigation, session box and top bar.
- Quick start: checklist of session prerequisites and one-click provisioning of a demo plant (HVOF system, subsystems, recipe, customer, component, order) that starts the first spray session; empty-plant call to action on the dashboard.
- Process Monitoring: parameter trend charts with recipe bands, band distribution, Live/Trends tabs, burst simulation and session analysis (KPIs, statistics, normalized deviations, CSV exports).
- Fault Diagnosis: fault cases list with acknowledge/resolve and fault rules administration.
- Operations dashboard with KPIs, sessions per day and fault cases by parameter.
- Reporting: report template builder with live preview, PDF generation of session reports and quality certificates (jsPDF) and the registry of generated reports.

### Changed
- Equipment and Process Monitoring stores load collections per HVOF system and delegate band classification and recipe publishing to the platform.
- Traceability store resolves to `null` on failed requests.
- Dependencies upgraded (jsPDF 4, Vite, Vue I18n) with no known vulnerabilities.

### Fixed
- Sidebar links navigate again (the prevented click blocked the router).
- Platform errors are shown in the quick start instead of being swallowed.

## [1.0.0] - 2026-10-05
### Added
- Navigation shell, language switcher (English by default, Spanish), footer and Terms & Conditions view.
- IAM: organization sign-up, sign-in, session, role assignment and role-based access.
- Billing: plan selection and subscription status.
- Traceability: customers, components (with PCR target) and recuperation orders.
- Equipment: HVOF systems, controllers, subsystems, parts and recipes with threshold bands.
- Process Monitoring: spray session start, live readings by band, complete/abort and session history with filters.
- Fake API (json-server) with sample data under `/api/v1`.
