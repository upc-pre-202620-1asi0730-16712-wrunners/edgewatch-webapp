# EdgeWatch Web Application

Frontend Web Application of **EdgeWatch**, the platform by **WebRunners** for the traceability and monitoring of HVOF coating processes. It is built with Vue 3, Vite, PrimeVue (Material theme), Pinia, Vue Router and Vue I18n, organized by bounded context (`iam`, `billing`, `traceability`, `equipment`, `process-monitoring`, `shared`) with `domain`, `application`, `infrastructure` and `presentation` layers.

## Features

- **IAM:** organization sign-up, sign-in, session, role assignment and role-based access.
- **Billing:** plan selection and subscription status.
- **Traceability:** customers, components (with PCR target) and recuperation orders (WO/OF).
- **Equipment:** HVOF systems, controllers, subsystems, parts and recipes with nominal ranges.
- **Process Monitoring:** start spray sessions, live readings classified by band, complete/abort and session history.
- **Shared:** navigation shell, language switcher (English by default, Spanish), footer with Terms & Conditions.

## Requirements

- Node.js 20 LTS and npm

## Getting started

```bash
npm install
npm run api   # Fake API (json-server) on http://localhost:3000/api/v1
npm run dev   # Vite development server on http://localhost:5173
```

Sample users are available in `server/db.json` (collection `users`).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts the Vite development server |
| `npm run api` | Starts the Fake API with json-server, exposing the resources under `/api/v1` |
| `npm run build` | Builds the production bundle in `dist` |
| `npm run preview` | Serves the production bundle locally |

## Environment variables

The environment files define `VITE_EDGEWATCH_API_URL` and the path of each endpoint (`VITE_*_ENDPOINT_PATH`).

## Contributing

GitFlow (`feature/*` → `develop` through Pull Requests, `release/*` → `main` tagged with Semantic Versioning) and Conventional Commits (`feat(traceability): ...`).
