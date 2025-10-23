# Spazaafy Backend — Province-scoped RBAC

Django + DRF API with province-scoped **Company Admins**.
- Global Admin (ADMIN, province=NULL) → all provinces
- Province Admin (ADMIN, province set) → only that province
- Municipalities do **not** log in; use reports export.

Includes:
- JWT auth, dev email+role login
- Users (roles), Shops (with province), Compliance Documents, Tickets
- Site Visits + Inspection Forms
- Province Reports endpoint
- Docker (Postgres+PostGIS-ready), CORS, OpenAPI

## Quick start (Docker)
```bash
cp .env.example .env
docker compose up --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```
