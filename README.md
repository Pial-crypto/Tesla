# Dhaka Tesla Pool

A ride-pooling MVP for Dhaka where passengers can request rides and Tesla drivers can accept compatible requests into shared pools while respecting vehicle seat capacity.

---

## Problem Statement

Dhaka Tesla Pool demonstrates a simple ride-pooling workflow between passengers and Tesla drivers.

Passengers can:

- Create an account and sign in
- Request rides using pickup and destination zones
- Select required seats
- View estimated fares
- Track ride status
- Cancel eligible rides
- View ride history and status timelines

Drivers can:

- Sign in
- View available ride requests
- Accept compatible requests
- Create or reuse a Tesla pool
- Manage the pool lifecycle
- View passengers and occupied seats
- View completed ride history

The MVP focuses on:

- Authentication
- Ride lifecycle management
- Pooling
- Fare calculation
- Tesla capacity enforcement
- Authorization
- Data consistency
- Concurrent ride acceptance
- Ride history
- A simple passenger and driver experience

---

## Features

### Passenger

- Sign up and login
- Request a ride
- Select pickup and destination zones
- Select number of seats
- Select payment method
- View estimated fare
- View active ride status
- Cancel eligible rides
- View ride history
- View ride status timeline

### Driver / Tesla

- Driver authentication
- View available ride requests
- Accept compatible ride requests
- Create or reuse a Tesla pool
- Enforce Tesla seat capacity
- Recalculate fares when rides become pooled
- Mark passengers as arrived
- Start a pooled trip
- Complete a pooled trip
- View completed ride history

### Ride Pooling

- Multiple passengers can share one Tesla
- Pool requests use compatible pickup zones
- Occupied seats cannot exceed Tesla capacity
- Individual fares are recalculated when pooling occurs
- Ride and pool lifecycle states are persisted
- Ride events are stored for history and traceability

---

## Ride Lifecycle

```text
REQUESTED
    |
    v
MATCHED
    |
    v
DRIVER_ARRIVED
    |
    v
STARTED
    |
    v
COMPLETED
```

Cancellation is allowed from valid pre-completion states:

```text
REQUESTED
MATCHED
DRIVER_ARRIVED
    |
    v
CANCELLED
```

---

## Screenshots

The project includes screenshots covering the main passenger and driver flows.

### Authentication

#### Sign Up

![Sign Up](sign%20up.png)

#### Login

![Login](login.png)

### Passenger Flow

#### Ride Request

![Ride Request](request%20ride.png)

#### Ride Request / Active Request

![Ride Request](ride%20req.png)

#### Ride History

![Ride History](ride%20history.png)

#### Cancel Ride

![Cancel Ride](cancel%20ride.png)

### Driver Flow

#### Driver Ride Requests

![Driver Ride Requests](ride%20req.png)

#### Driver Started Ride

![Driver Started](drive%20started.png)

#### Driver Marked Arrived

![Driver Arrived](marked%20arrived.png)

> Additional screenshots covering ride acceptance and completed pool states are included in the project repository alongside the other UI evidence.

---

## Architecture

The application follows a simple layered architecture:

```mermaid
flowchart TD
    A[Browser] --> B[Next.js / React]
    B --> C[Node.js / Express API]
    C --> D[Authentication Middleware]
    C --> E[Controllers]
    E --> F[Services / Business Logic]
    F --> G[Prisma ORM / PostgreSQL]
    G --> H[(PostgreSQL Database)]
```

Business rules are enforced in the backend rather than the UI.

Important backend responsibilities include:

- Ride state transitions
- Pool compatibility
- Fare calculation
- Pool capacity enforcement
- Authorization
- Ride ownership
- Cancellation rules
- Concurrency protection
- Ride event history

---

## Database / ERD

![Database ERD](erd.png)

The main database entities are:

- User
- Vehicle
- Ride
- Pool
- RideEvent

The database uses relational constraints and indexes to support ride ownership, pool membership, lifecycle tracking, and capacity-sensitive operations.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM / Database Client | Prisma ORM |
| Authentication | JWT + bcrypt |
| Validation | Backend request validation |
| Containerization | Docker / Docker Compose |
| Database Migration | Prisma migrations |
| Testing | Vitest |
| Version Control | Git / GitHub |

---

## Why PostgreSQL?

A relational database fits the ride-pooling domain because rides, passengers, vehicles, pools, and ride events have clear relationships and consistency requirements.

PostgreSQL also provides row-level locking, which is used to protect Tesla pool capacity during concurrent ride acceptance.

The critical acceptance transaction locks the Tesla/Vehicle row before calculating available capacity.

---

## Why a Simple Architecture?

The project intentionally avoids unnecessary microservices, Kafka, Kubernetes, Redis, or queue infrastructure.

The assessment focuses on a reliable ride-pooling MVP, so a modular Node.js API with PostgreSQL is sufficient and easier to understand, test, deploy, and maintain.

Additional infrastructure would become useful at larger scale and is discussed in the scaling section.

---

## Project Structure

```text
tesla/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── handler/
│   │   ├── middleware/
│   │   ├── prisma/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   └── prisma.config.ts
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hook/
│   ├── lib/
│   ├── types/
│   ├── utils/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── archi.png
├── erd.png
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Prerequisites

For local development:

- Node.js 20+
- npm
- Docker Desktop
- Git

For the recommended Docker workflow, Docker Desktop is sufficient.

---

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

Example:

```env
DATABASE_URL="postgresql://tesla:tesla_dev_password@localhost:5432/tesla_pool"
JWT_SECRET="your-development-secret"
PORT=5000
```

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Docker

Docker Compose provides the required database connection and backend JWT secret for the containerized environment.

Never commit real secrets, API keys, tokens, or production credentials.

---

# Running with Docker

Docker Compose runs the application stack:

```text
Frontend
    |
    v
Backend API
    |
    v
PostgreSQL
```

### Start the full stack

From the project root:

```bash
docker compose up -d
```

### Check containers

```bash
docker compose ps
```

Expected services:

```text
tesla-postgres
tesla-backend
tesla-frontend
```

### View logs

Backend:

```bash
docker compose logs backend
```

Frontend:

```bash
docker compose logs frontend
```

PostgreSQL:

```bash
docker compose logs postgres
```

### Stop the stack

```bash
docker compose down
```

The PostgreSQL database uses a Docker volume so data can persist between normal container restarts.

---

## Docker Services

### PostgreSQL

- Image: `postgres:17-alpine`
- Database: `tesla_pool`
- User: `tesla`
- Port: `5432`
- Health check: `pg_isready`

### Backend

- Node.js 22 Alpine
- Express API
- Port: `5000`
- Depends on the healthy PostgreSQL service

### Frontend

- Next.js
- Port: `3000`
- Depends on the backend service

---

# Database Setup

The project uses Prisma migrations and a development seed containing the assessment story cast.

### Demo data

The seed contains:

- Jashim — Driver
- Nusrat — Passenger
- Rafiq — Passenger
- Shirin — Passenger
- Bullet — Tesla
- Bullet capacity — 3 seats

### Prisma contract

From the backend directory:

```bash
cd backend
npx prisma contract emit
```

### Apply migrations

```bash
npx prisma db migrate
```

### Check migration status

```bash
npx prisma migration status
```

The backend startup flow initializes the database and seeds the required development data when the seed data does not already exist.

---

## Demo Credentials

The seeded demo users use the development password:

```text
password123
```

| Role | Name | Email |
|---|---|---|
| Driver | Jashim | jashim@oitesla.test |
| Passenger | Nusrat | nusrat@oitesla.test |
| Passenger | Rafiq | rafiq@oitesla.test |
| Passenger | Shirin | shirin@oitesla.test |

Tesla:

```text
Name: Bullet
Capacity: 3 seats
Driver: Jashim
```

These credentials are for local/demo evaluation only.

---

# Running the Backend

From the backend directory:

```bash
cd backend
npm install
npm run dev
```

The backend runs on the configured API port.

Default local URL:

```text
http://localhost:5000
```

---

# Running the Frontend

From the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# API Overview

## Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

## Passenger

```text
POST /api/rides
GET  /api/rides
GET  /api/rides/fare/estimate
POST /api/rides/:id/cancel
GET  /api/rides/:id/history
```

## Driver

```text
GET  /api/driver/requests
POST /api/driver/rides/:id/accept
GET  /api/driver/pool
POST /api/driver/pool/arrive
POST /api/driver/pool/start
POST /api/driver/pool/complete
GET  /api/driver/history
```

Protected endpoints require JWT authentication.

Role-based authorization prevents passengers from accessing driver-only operations and prevents users from modifying rides they do not own.

---

# Fare Model

The MVP uses a simple deterministic zone-based fare model.

The fare calculation is based on:

```text
Solo Fare = Base Fare + Distance Charge
```

For pooled rides:

```text
Pooled Fare = Solo Fare - Pool Discount
```

The implementation stores monetary values as integer paisa rather than floating-point currency values.

Current model:

```text
Base Fare = 5000 paisa
Distance Charge = 2000 paisa per zone distance
Pool Discount = 15%
```

The fare is multiplied by the number of requested seats.

The distance model uses the predefined Dhaka zone ordering rather than real road distance.

---

# Zone-Based Matching

The MVP intentionally avoids external map and routing APIs.

Supported zones include:

```text
Banani
Mohakhali
Gulshan 1
Farmgate
Uttara
Dhanmondi
Mirpur
Bashundhara
```

The current pool compatibility rule is deterministic:

```text
Compatible pool
    =
Same pickup zone
```

This keeps matching predictable and easy to test.

---

# Testing

The application includes automated tests using Vitest.

Run the test suite from the project root:

```bash
npm test
```

Important tested behaviors include:

- Passenger can create a ride request
- Driver can accept a requested ride
- Ride lifecycle transitions work
- Invalid state transitions are rejected
- Pooling combines compatible ride requests
- Pool capacity cannot be exceeded
- Pooled fares are recalculated
- Passenger cancellation works
- Duplicate cancellation is rejected
- Passenger ownership is enforced
- Passenger cannot access driver-only operations
- Passenger ride history and timeline work
- Driver pool history works
- Concurrent ride acceptance is protected using PostgreSQL row-level locking

Additional verification performed during development:

- PostgreSQL Docker container starts successfully
- Database migrations are applied successfully
- Frontend production build succeeds
- Session persists across refresh
- Docker backend and frontend images build successfully
- Full Docker Compose stack starts successfully

---

# Concurrency Strategy

Pool capacity is a critical consistency rule.

Bullet has a fixed capacity of three seats. Two passengers may attempt to claim the remaining seats at nearly the same time.

A simple read-then-write approach could create a race condition:

```text
Request A → sees 1 seat available
Request B → sees 1 seat available
Request A → accepts
Request B → accepts
```

This could incorrectly exceed the Tesla capacity.

The backend instead opens a PostgreSQL transaction and locks the Tesla/Vehicle row:

```sql
SELECT "id", "capacity"
FROM "Vehicle"
WHERE "driverId" = $1
FOR UPDATE;
```

This serializes capacity-sensitive acceptance operations for the same Tesla.

The transaction then:

1. Locks the Tesla
2. Locks the requested ride
3. Finds or creates the compatible pool
4. Locks active pool rides
5. Calculates occupied seats
6. Validates remaining capacity
7. Updates the accepted ride
8. Recalculates pooled fares
9. Creates the ride event
10. Commits the transaction

If another request attempts to accept a ride for the same Tesla concurrently, it waits for the existing transaction to finish before performing its own capacity calculation.

This prevents two concurrent requests from consuming the same remaining seat.

At larger scale, this can be extended with:

- Idempotency keys
- More targeted locking
- Queue/event-based processing
- Distributed coordination where necessary
- Additional observability
- Better retry and failure handling

---

## Screenshots / UI Evidence

### Authentication

#### Sign Up
![Sign Up](sign%20up.png)

#### Login
![Login](login.png)

### Passenger Flow

#### Ride Request
![Ride Request](request%20ride.png)

#### Ride History
![Ride History](ride%20history.png)

#### Cancel Ride
![Cancel Ride](cancel%20ride.png)

### Driver Flow

#### Ride Request
![Driver Ride Request](ride%20req.png)

#### Ride Accepted
![Ride Accepted](acceptedridetopool.png)

#### Driver Started
![Driver Started](drive%20started.png)

#### Driver Arrived
![Driver Arrived](marked%20arrived.png)

#### Completed Pool
![Completed Pool](completed%20pool.png)

---

# Deployment

Deployment will use free/free-tier infrastructure only.

Public deployment URLs will be added after deployment verification.

### Frontend

```text
TBD
```

### Backend API

```text
TBD
```

### Database

```text
TBD
```

If free backend hosting is not suitable for the final environment, the project remains reproducible through Docker Compose.

---

# Key Decisions and Trade-offs

## PostgreSQL

PostgreSQL was chosen because the application has relational data and strict consistency requirements around ride pooling and Tesla capacity.

An alternative such as a document database could store ride data, but the relational model is more natural for:

- Users
- Vehicles
- Rides
- Pools
- Ride events
- Relationships
- Constraints
- Transactional consistency

---

## JWT Authentication

JWT provides a simple stateless authentication mechanism suitable for this MVP.

It keeps the backend API independent from frontend session storage while allowing protected endpoints to validate the authenticated user and role.

---

## Prisma

Prisma is used for schema management, migrations, generated database contracts, and regular application database operations.

A lower-level PostgreSQL client is additionally used for the concurrency-critical transaction because the required row-locking behavior needed a direct PostgreSQL transaction surface.

---

## Zone-Based Matching

The MVP uses predefined Dhaka zones instead of real routing/geospatial infrastructure.

This keeps the matching model:

- Deterministic
- Easy to test
- Easy to explain
- Free from external map API dependencies

A production implementation would require real geospatial and route compatibility logic.

---

## Simple Fare Calculation

The fare model is intentionally lightweight.

The goal is to demonstrate:

- Distance-based pricing
- Seat multiplication
- Pool discounts
- Fare recalculation

rather than implement a production-grade routing and dynamic pricing engine.

---

## Row-Level Locking

Vehicle-level PostgreSQL row locking was selected to prevent concurrent acceptance requests from exceeding Tesla capacity.

This solves the MVP consistency problem without introducing distributed locking infrastructure.

---

# Known Limitations

- Zone-based distance is not real road distance.
- No live GPS tracking.
- No real payment processing.
- No production-grade route optimization.
- Matching is intentionally simplified.
- Real-time driver/passenger updates are not implemented through WebSockets.
- Production deployment infrastructure is intentionally lightweight.
- Pool matching currently uses a deterministic pickup-zone compatibility rule.
- No distributed queue/event infrastructure is required for the MVP.
- No advanced dynamic pricing or traffic-aware fare calculation.

---

# Future Improvements

Potential future improvements include:

- Real geospatial matching
- Live GPS tracking
- WebSocket-based real-time ride updates
- Real payment integration
- Smarter route compatibility
- Idempotency keys for ride acceptance
- Rate limiting
- Observability and distributed tracing
- Read replicas and caching
- Queue/event infrastructure for high-volume matching
- Better retry and failure handling
- Driver availability and online/offline state
- Production-grade monitoring and alerting

---

# Scaling Considerations — Bonus

If Dhaka Tesla Pool grows significantly, the architecture would need to evolve beyond the current MVP.

A hypothetical large-scale environment could involve:

```mermaid
flowchart TD
    A[Clients] --> B[Load Balancer]
    B --> C[Frontend Instances]
    B --> D[API Instances]

    D --> E[Authentication / Authorization]
    D --> F[Ride Matching Service]
    D --> G[Pool Management]

    F --> H[(Primary PostgreSQL)]
    G --> H

    H --> I[(Read Replicas)]

    D --> J[Cache]
    F --> K[Message Queue]

    K --> L[Async Workers]

    D --> M[Observability]
    H --> M
    K --> M
```

### Horizontal Scaling

The API layer can be horizontally scaled behind a load balancer.

Multiple Node.js API instances can process independent requests while PostgreSQL remains the source of truth for transactional ride and pool state.

### Database Scaling

At larger scale:

- Add appropriate composite indexes
- Use read replicas for read-heavy workloads
- Separate transactional writes from reporting workloads
- Optimize pool and ride queries
- Monitor lock contention
- Consider partitioning for very large ride/event tables

### Caching

Frequently accessed data could be cached, such as:

- Static zone information
- Driver availability
- Frequently requested metadata

Transactional ride and capacity state should continue to rely on the database as the source of truth.

### Geospatial Search

The current zone-based matching model could be replaced with:

- PostGIS
- Geospatial indexes
- Driver location updates
- Radius-based matching
- Route compatibility calculations

### Queues and Events

High-volume matching could move non-critical asynchronous operations to a queue:

- Notifications
- Analytics
- Audit processing
- Matching events
- Reporting
- External integrations

Critical capacity decisions would still require transactional consistency.

### Real-Time Communication

WebSockets or Server-Sent Events could provide:

- Driver location updates
- Ride status updates
- Arrival notifications
- Pool membership changes
- Trip completion updates

### Idempotency

Ride acceptance and other state-changing operations could use idempotency keys to prevent duplicate requests caused by network retries or client re-submissions.

### Observability

A production deployment should include:

- Structured logging
- Metrics
- Distributed tracing
- Error tracking
- Database monitoring
- Lock/contention monitoring
- API latency monitoring

### Security

At larger scale:

- Rate limiting
- Stronger secret management
- Token rotation
- Request validation
- Audit logging
- Security headers
- Abuse detection
- Centralized identity management

The MVP intentionally does not implement all of these systems because they are not required to demonstrate the core ride-pooling problem.

---

# AI Usage

AI tools were used during development as engineering assistance for:

- Architecture discussion
- Database design review
- Prisma/API debugging
- Frontend component organization
- Test planning
- Concurrency analysis
- Documentation drafting

AI-generated suggestions were reviewed, tested, and modified where necessary rather than accepted blindly.

The developer remains responsible for understanding and maintaining the implementation.

## Accepted Suggestion

Using PostgreSQL row-level locking with:

```sql
SELECT ... FOR UPDATE
```

for the Tesla capacity race condition was accepted because it directly addresses the consistency requirement without introducing unnecessary infrastructure.

## Rejected / Changed Suggestion

An initial approach attempted to use the Prisma runtime transaction/raw API for the locking query.

Runtime behavior did not expose the required raw transaction surface reliably, so the implementation was changed to use a dedicated PostgreSQL connection pool for the critical transaction.

This keeps the capacity-sensitive operations inside the same PostgreSQL transaction.

---

# Demo Video

Final six-minute demonstration video:

```text
TBD
```

The final video will cover:

### 0:00 – 1:00

- Problem understanding
- Users
- Core ride-pooling idea

### 1:00 – 3:00

- Architecture
- Backend
- Frontend
- Database design
- Ride lifecycle
- Pooling
- Key engineering decision
- Trade-off

### 3:00 – 6:00

- Passenger flow
- Driver flow
- Shared Tesla pooling
- Fare calculation
- Ride status
- Capacity/concurrency edge case
- Deployment

---

# Git Workflow

The project follows the assessment's Git workflow:

```text
feature/*
    |
    v
master
    |
    v
pre-release
    |
    v
release/v1.0.0
```

Feature branches are used for logical development work.

Examples:

```text
feature/auth
feature/ride-request
feature/pooling
feature/driver-flow
feature/project-foundation
```

The project uses incremental commits rather than one large final commit.

---

# Commit Message Convention

Commit messages follow:

```text
<type>(<scope>): <short description>
```

Examples:

```text
feat(auth): add passenger login endpoint
feat(pool): enforce Tesla seat capacity
fix(pool): prevent pool overbooking
test(backend): add ride flow integration tests
docs(readme): document project architecture and setup
build(docker): add compose setup for application services
```

Common types:

```text
feat
fix
refactor
test
docs
chore
build
```

---

# License

This project was created as an engineering assessment project for demonstrating full-stack development, backend architecture, database design, testing, Dockerization, and engineering decision-making.