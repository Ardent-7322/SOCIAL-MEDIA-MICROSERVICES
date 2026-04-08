# Social Media Microservices

A distributed backend built to understand how large systems split functionality across independent services - and what that actually costs in terms of complexity.

This is not a feature-complete social network. The focus was on getting the architecture right: clean service boundaries, independent data ownership, async communication, and a single entry point for clients.


## Services

```
SOCIAL-MEDIA-MICROSERVICES
├── api-gateway        - single entry point, routing + rate limiting + auth checks
├── identity-service   - registration, login, JWT issuance, user profiles
├── post-service       - post creation, timelines, feeds
├── media-service      - image and video upload, storage, retrieval
└── search-service     - search across users, posts, and media
```

Each service runs independently, owns its own database, and exposes no internal endpoints to clients.


## How requests flow

```
Client
  → API Gateway (auth check + rate limiting)
  → Internal service (Identity / Post / Media / Search)
  → Own database or Cloudinary
  → Response back through gateway
```

Services communicate synchronously over REST for simplicity. Async events via RabbitMQ handle cases where tight coupling would be a problem - like fan-out operations after a post is created.


## Tech stack

| Layer | Technology |
|---|---|
| Language | Node.js, Express.js |
| Databases | MongoDB (one per service) |
| Auth | JWT |
| Async messaging | RabbitMQ |
| Caching | Redis |
| Media storage | Cloudinary |
| Containerization | Docker, Docker Compose |


## Design decisions

**One database per service** - services share nothing at the data layer. This keeps them independently deployable and prevents tight coupling through shared schema.

**API Gateway as the only public surface** - clients never talk to internal services directly. Auth is checked at the gateway before any request reaches a service.

**RabbitMQ for async events** - used where a synchronous call would create unnecessary coupling. For example, the post service publishes an event after creation; other services consume it independently.

**Redis caching** - sits in front of frequently read data to reduce database load on hot paths.


## Running locally

```bash
git clone https://github.com/Ardent-7322/SOCIAL-MEDIA-MICROSERVICES
cd SOCIAL-MEDIA-MICROSERVICES
cp api-gateway/.env.example api-gateway/.env
cp identity-service/.env.example identity-service/.env
cp post-service/.env.example post-service/.env
cp media-service/.env.example media-service/.env
cp search-service/.env.example search-service/.env
docker-compose up --build
```

API Gateway available at `http://localhost:3000`

### Pre-run checklist

- Ensure MongoDB is reachable from containers (default examples use `host.docker.internal`).
- Set a strong `JWT_SECRET` in `api-gateway/.env` and `identity-service/.env`.
- Set real Cloudinary credentials in `media-service/.env`.

### Smoke checks after startup

```bash
# gateway boot check
curl -i http://localhost:3000/

# register a user through gateway -> identity-service
curl -X POST http://localhost:3000/v1/auth/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo-user","email":"demo@example.com","password":"Password@123"}'
```



## Known limitations

- Search is basic  no relevance ranking or fuzzy matching
- No distributed tracing or centralized logging across services
- Error handling and retry logic is minimal
- Feed generation is simple; no ranking or personalization

These were intentional trade-offs to keep the focus on architecture rather than feature completeness.
