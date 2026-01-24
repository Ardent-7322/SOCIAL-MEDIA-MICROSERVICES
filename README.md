# Social Media Microservices

## Overview

This is a learning-focused backend project where I built a simplified social media platform using a microservices architecture. The intent was to understand how real-world systems split functionality into independent services and how those services interact through well-defined boundaries.

The project is not meant to be a full-featured social network. Instead, it focuses on clarity around service responsibilities, data ownership, and the trade-offs involved when choosing microservices over simpler architectures.

## What This System Does

- Handles user registration, login, and profile management
- Allows users to create and fetch posts
- Supports media uploads and retrieval for images and videos
- Provides basic search across users, posts, and media
- Routes all client requests through a centralized API Gateway
- Runs all services locally using Docker Compose

## Project Structure
```
SOCIAL-MEDIA-MICROSERVICES
├── api-gateway        # Central entry point for all client requests
├── identity-service   # Authentication, authorization, user profiles
├── post-service       # Post creation, feeds, and timelines
├── media-service      # Media upload and retrieval
└── search-service     # Search functionality
```

Each service is developed and deployed independently and owns its own data.

## How the System Works

Client requests are sent to the API Gateway, which forwards them to the appropriate service based on the route. Each service processes the request, interacts with its own database or external storage if needed, and returns a response back through the gateway.

**Important aspects of this flow:**

- Clients never communicate directly with internal services
- Services do not share databases
- Each service focuses on a single responsibility
- Communication is synchronous and REST-based for simplicity

## Architecture Notes

A microservices approach was chosen to explore how large systems manage complexity by separating concerns across services. This design improves isolation and scalability but also introduces additional operational overhead compared to a monolithic application.

This project helped me understand those trade-offs in a practical way.

## Features by Service

### Identity Service
Responsible for user accounts, authentication, JWT issuance, and profile management.

### Post Service
Handles post creation, timeline generation, and feed retrieval.

### Media Service
Manages uploading, storing, and serving images and videos using cloud storage.

### Search Service
Provides search functionality over users, posts, and media content.

### API Gateway
Acts as the single entry point, routing requests and applying basic security checks.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | JavaScript (Node.js) |
| Databases | MongoDB, with a separate database for each service |
| Authentication | JWT-based authentication |
| Media Storage | Cloudinary |
| Containerization | Docker and Docker Compose |

## Running the Project Locally

Clone the repository and start all services using Docker Compose.
```bash
git clone https://github.com/Ardent-7322/SOCIAL-MEDIA-MICROSERVICES
cd SOCIAL-MEDIA-MICROSERVICES
docker-compose up --build
```

Once running, the API Gateway is available at:
```
http://localhost:3080/
```

## Design Decisions

- An API Gateway was added to prevent clients from accessing internal services directly
- Each service owns its own database to avoid tight coupling
- Docker Compose is used to simplify local development of multiple services
- Asynchronous messaging was intentionally skipped to keep the system easier to reason about

## Limitations

- There is no message queue for asynchronous events like feed updates
- Search functionality is basic
- Error handling and retries are minimal
- There is no centralized logging or distributed tracing

These limitations were accepted to focus on core architectural concepts.

## Key Takeaways

- Learned how to define service boundaries in a distributed system
- Understood the complexity involved in running multiple services
- Gained experience with authentication across service boundaries
- Developed a practical understanding of when microservices make sense and when they may be unnecessary
