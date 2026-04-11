# Social Media Microservices

A distributed backend built to understand how large systems split functionality across independent services - and what that actually costs in terms of complexity.

This is not a feature-complete social network. The focus was on getting the architecture right: clean service boundaries, independent data ownership, async communication, and a single entry point for clients.

---

## Architecture

![Architecture Diagram](./architecture.png)

---

## Services

```
SOCIAL-MEDIA-MICROSERVICES
├── api-gateway          — single entry point, routing + rate limiting + auth checks
├── identity-service     — registration, login, JWT issuance, user profiles
├── post-service         — post creation, timelines, feeds
├── media-service        — image and video upload, storage, retrieval
├── search-service       — search across users, posts, and media
└── notification-service — consumes async events, sends notifications
```

Each service runs independently, owns its own database, and exposes no internal endpoints to clients.

---

## How Requests Flow

```
Client
  → API Gateway       (auth check + rate limiting)
  → Internal service  (Identity / Post / Media / Search)
  → Own database or Cloudinary
  → Response back through gateway
```

Services communicate synchronously over REST. Async events via RabbitMQ handle cases where tight coupling would be a problem - like fan-out operations after a post is created.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Node.js, Express.js |
| Databases | MongoDB (one per service) |
| Auth | JWT |
| Async messaging | RabbitMQ |
| Caching | Redis |
| Media storage | Cloudinary |
| Containerization | Docker, Docker Compose |

---

## Design Decisions

**One database per service** - services share nothing at the data layer. This keeps them independently deployable and prevents tight coupling through shared schema.

**API Gateway as the only public surface** - clients never talk to internal services directly. Auth is checked at the gateway before any request reaches a service.

**RabbitMQ for async events** - used where a synchronous call would create unnecessary coupling. For example, the post service publishes an event after creation; the notification service consumes it independently.

**Redis caching** - sits in front of frequently read data to reduce database load on hot paths.

---

## Running Locally

### Prerequisites

- Docker and Docker Compose
- MongoDB running locally (or a MongoDB Atlas URI)
- Cloudinary account (for media service)

### Setup

```bash
git clone https://github.com/Ardent-7322/SOCIAL-MEDIA-MICROSERVICES
cd SOCIAL-MEDIA-MICROSERVICES

# copy env files
cp api-gateway/.env.example           api-gateway/.env
cp identity-service/.env.example      identity-service/.env
cp post-service/.env.example          post-service/.env
cp media-service/.env.example         media-service/.env
cp search-service/.env.example        search-service/.env
cp notification-service/.env.example  notification-service/.env
```

### Environment Variables

Fill in the `.env` files before starting. Key values:

| Service | Variable | Notes |
|---|---|---|
| api-gateway | `JWT_SECRET` | Must match identity-service |
| identity-service | `MONGO_URI` | Separate DB per service |
| identity-service | `JWT_SECRET` | Same as gateway |
| identity-service | `RABBITMQ_URL` | `amqp://guest:guest@rabbitmq:5672` |
| media-service | `CLOUDINARY_CLOUD_NAME` | From Cloudinary dashboard |
| media-service | `CLOUDINARY_API_KEY` | From Cloudinary dashboard |
| media-service | `CLOUDINARY_API_SECRET` | From Cloudinary dashboard |
| all services | `REDIS_URL` | `redis://redis:6379` |

### Start

```bash
docker-compose up --build
```

API Gateway will be available at `http://localhost:3000`

> First build takes a few minutes. RabbitMQ takes ~20-30 seconds to become healthy - services will retry automatically.

---

## Known Limitations

- Search is basic — no relevance ranking or fuzzy matching
- No distributed tracing or centralized logging across services
- Error handling and retry logic is minimal
- Feed generation is simple - no ranking or personalization

These were intentional trade-offs to keep the focus on architecture rather than feature completeness.
