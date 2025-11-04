#  Social Media Microservices

This project implements a **Social Media Platform** using a **Microservices Architecture**.  
Each core feature of the application is developed as an independent service that can be deployed, scaled, and maintained separately.

---

##  Project Structure

```text
SOCIAL-MEDIA-MICROSERVICES
│
├── api-gateway/        → Central entry point for routing all client requests
├── identity-service/   → User authentication, authorization, profile management
├── media-service/      → Media upload & retrieval (images/videos)
├── post-service/       → Create posts, manage feed & user timelines
└── search-service/     → Search functionality for users/posts/media
```



## Features

| Service | Responsibility |
|--------|----------------|
| **Identity Service** | Sign up, login, JWT auth, user profiles |
| **Post Service** | Create posts, fetch feeds, manage user timelines |
| **Media Service** | Upload, fetch and store images/videos |
| **Search Service** | Search users, posts, and media data |
| **API Gateway** | Central entry point for routing requests to services |

**Key Benefits:**
- Loose coupling between services
- Independent scaling & deployment
- Maintainable and extensible system structure

---

##  Architecture Overview


```text
Client (Web / Mobile / React Frontend)
            │
            ▼
       API Gateway
            │
 ┌──────────┼──────────┐
 │          │          │
 ▼          ▼          ▼
Identity   Post      Media
Service    Service   Service
            │
            ▼
       Search Service
```




- **API Gateway** controls routing and security layers.
- **Each service has its own database** (Database-per-Service pattern).
- Communication is typically **REST-based**, can be upgraded to **message queue (Kafka/RabbitMQ)** later for feed events.

---

##  Tech Stack

| Layer | Technologies Used |
|------|--------------------------------------|
| Language | JavaScript / Node.js |
| Media Storage | Cloudinary |
| Databases | MongoDB |
| Authentication | JWT  |
| Containerization  | Docker, Docker Compose |

---

##  Running the Project

```bash
# Clone repository
git clone https://github.com/Ardent-7322/SOCIAL-MEDIA-MICROSERVICES
cd SOCIAL-MEDIA-MICROSERVICES

docker-compose up --build

http://localhost:3080/




