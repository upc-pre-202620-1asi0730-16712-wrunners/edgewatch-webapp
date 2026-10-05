#!/usr/bin/env bash
# Usa el json-server local del proyecto (0.17.x), que soporta --routes.
# El json-server global v1 beta NO soporta --routes ni el prefijo /api/v1.
cd "$(dirname "$0")"
npx --no-install json-server --watch db.json --routes routes.json --port 3000
