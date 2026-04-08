# Dokploy Deployment — rpnmore.com

## Setup

- `.dokploy/dokploy.json` — Dokploy deployment config
- `Dockerfile.dokploy` — Docker build for production

## Build Process

1. Git push → Dokploy detects commit
2. Reads `.dokploy/dokploy.json`
3. Builds Docker image using `Dockerfile.dokploy`
4. Runs container on port 3000
5. Site accessible at rpnmore.com

## Required Env Vars (set in Dokploy UI)

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Gemini AI for blog generation |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase admin JSON |
| `DATABASE_URL` | Optional PostgreSQL |

## Local Dev

```bash
npm run dev    # Dev server
npm run build  # Production build
```

## Notes

- Built and tested in `/srv/websandbox/rpnmore/` (sandbox)
- Production deployment via git push → Dokploy auto-build
- Do NOT touch Dokploy UI directly
