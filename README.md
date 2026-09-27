# Dhaka Tesla Pool

A ride-pooling MVP for Dhaka where passengers can request rides and Tesla drivers can accept compatible requests into shared pools while respecting vehicle seat capacity.

## Problem Statement

Dhaka Tesla Pool is designed to demonstrate a simple ride-pooling workflow between passengers and Tesla drivers. Passengers can request rides with pickup and destination zones, while drivers can accept compatible requests and group multiple passengers into a shared Tesla.

The MVP focuses on correct ride lifecycle management, pooling, fare calculation, authentication, capacity enforcement, data consistency, and a clean passenger/driver experience.

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
- View ride history and status timeline

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
- Pool requests must use compatible pickup zones
- Occupied seats cannot exceed Tesla capacity
- Individual fares are recalculated when pooling occurs
- Ride and pool lifecycle states are persisted

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

REQUESTED / MATCHED / DRIVER_ARRIVED
    |
    v
CANCELLED
```

![alt text](archi.png)

The application follows a simple layered architecture:

```mermaid
flowchart TD
    A[Browser] --> B[Next.js / React]
    B --> C[Node.js / Express]
    C --> D[Services / Validation / Middleware]
    D --> E[(PostgreSQL)]
```

Business rules such as ride state transitions, pooling compatibility, fare calculation, and capacity enforcement are handled in the backend rather than the UI.

## Database / ERD

![alt text](erd.png)

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
| Version Control | Git / GitHub |

## Why PostgreSQL?

A relational database fits the pooling domain because rides, passengers, vehicles, pools, and ride events have clear relationships and consistency requirements.

PostgreSQL also provides row-level locking, which is used to protect Tesla pool capacity during concurrent ride acceptance.

## Why a simple architecture?

The project intentionally avoids unnecessary microservices, queues, Kafka, Kubernetes, or Redis. The assessment is an MVP, so a modular Node.js API with PostgreSQL is sufficient and easier to reason about and operate.

## Project Structure

```text
tesla/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── prisma/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── prisma.config.ts
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hook/
│   ├── lib/
│   ├── types/
│   └── utils/
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop
- Git

## Environment Variables

Backend `.env`:

```env
DATABASE_URL="postgresql://tesla:tesla_dev_password@localhost:5432/tesla_pool"
JWT_SECRET="your-development-secret"
```

Never commit real secrets.

For other environments, create environment variables from `.env.example`.

## Running with Docker

Start PostgreSQL:

```bash
docker compose up -d
```

Check the containers:

```bash
docker compose ps
```

The PostgreSQL service includes a health check.

## Database Setup

From the backend directory:

```bash
npm install
```

Generate the Prisma contract:

```bash
npx prisma contract emit
```

Apply migrations:

```bash
npx prisma db migrate
```

Check migration status:

```bash
npx prisma migration status
```

Seed the development database with the provided demo users/data.

## Running the Backend

```bash
cd backend
npm install
npm run dev
```

The API runs on the configured backend port.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open the Next.js application in the browser.

## API Overview

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Passenger

```text
POST /api/rides
GET  /api/rides
GET  /api/rides/fare/estimate
POST /api/rides/:id/cancel
GET  /api/rides/:id/history
```

### Driver

```text
GET  /api/driver/requests
POST /api/driver/rides/:id/accept
GET  /api/driver/pool
POST /api/driver/pool/arrive
POST /api/driver/pool/start
POST /api/driver/pool/complete
GET  /api/driver/history
```

Protected endpoints require JWT authentication and enforce the appropriate passenger/driver role.

## Testing

The application was tested against the important MVP behaviors:

- Passenger can create a ride request
- Driver can accept a requested ride
- Ride lifecycle transitions work
- Pooling combines compatible ride requests
- Pool capacity cannot be exceeded
- Pooled fares are recalculated
- Invalid state transitions are rejected
- Passenger cancellation works
- Duplicate cancellation is rejected
- Passenger ownership is enforced
- Passenger cannot access driver-only operations
- Passenger ride history and timeline work
- Driver pool history works
- Docker PostgreSQL starts successfully
- Database migrations are applied successfully
- Frontend production build succeeds
- Session persists across refresh
- Concurrent ride acceptance is protected using PostgreSQL row-level locking

## Concurrency Strategy

Pool capacity is a critical consistency rule.

When a driver accepts a ride, the backend opens a PostgreSQL transaction and locks the corresponding Tesla/Vehicle row using:

```sql
SELECT "id", "capacity"
FROM "Vehicle"
WHERE "driverId" = $1
FOR UPDATE;
```

This serializes capacity-sensitive acceptance operations for the same Tesla.

The transaction then:

- Locks the Tesla
- Reads active pool rides
- Calculates occupied seats
- Validates remaining capacity
- Updates the accepted ride
- Recalculates pooled fares
- Creates the ride event
- Commits the transaction

If another request tries to accept a ride for the same Tesla at the same time, it waits for the existing transaction to finish before performing its own capacity calculation.

This prevents the classic race condition where two requests both observe the same remaining seat and both attempt to consume it.

At larger scale, this could be extended with stronger idempotency controls, more targeted locking, queue/event-based processing, and additional observability.

## Demo Data

The development seed follows the assessment story cast, including:

- Jashim
- Nusrat
- Rafiq

Demo credentials should be documented here after final seed verification.

## Screenshots / GIFs

Screenshots and GIFs demonstrating the following flows will be added before final release:

- Passenger authentication
- Ride request
- Active ride timeline
- Driver request list
- Ride acceptance
- Shared Tesla pool
- Pool capacity
- Driver arrival/start/complete flow
- Ride history

## Deployment

Deployment is intended to use free/free-tier infrastructure.

Final deployment URLs will be added here after deployment verification.

### Frontend

TBD

### Backend API

TBD

## Key Decisions and Trade-offs

### PostgreSQL

Chosen because the application has relational data and strict consistency requirements around pool capacity.

### JWT Authentication

JWT provides a simple stateless authentication mechanism suitable for this MVP.

### Zone-based Matching

The MVP uses predefined Dhaka zones instead of real routing/geospatial infrastructure. This keeps the matching model deterministic and avoids unnecessary external mapping dependencies.

### Simple Fare Calculation

Fare is calculated using a lightweight zone-distance model. The goal is to demonstrate fare behavior and pooling discounts rather than implement a production-grade routing engine.

### Row-level Locking

Vehicle-level PostgreSQL row locking was chosen to prevent concurrent acceptance requests from exceeding Tesla capacity without introducing a distributed locking system.

## Known Limitations

- Zone-based distance is not real road distance.
- No live GPS tracking.
- No real payment processing.
- No production-grade route optimization.
- Matching is intentionally simplified for the MVP.
- Real-time driver/passenger updates are not implemented through WebSockets.
- Production deployment infrastructure is intentionally lightweight.

## Future Improvements

- Real geospatial matching
- Live GPS tracking
- WebSocket-based real-time ride updates
- Real payment integration
- Smarter route compatibility
- Idempotency keys for ride acceptance
- Rate limiting
- Observability and distributed tracing
- Read replicas and caching at larger scale
- Queue/event infrastructure for high-volume matching

## AI Usage

AI tools were used during development as engineering assistance for:

- Architecture discussion
- Database design review
- Prisma/API debugging
- Frontend component organization
- Test planning
- Concurrency analysis
- Documentation drafting

AI-generated suggestions were reviewed and tested rather than accepted blindly.

### Accepted suggestion

Using PostgreSQL row-level locking with SELECT ... FOR UPDATE for the Tesla capacity race condition was accepted because it directly addresses the consistency requirement without introducing unnecessary infrastructure.

### Rejected / Changed suggestion

An initial approach attempted to use the Prisma runtime transaction/raw API for the locking query. Runtime behavior did not expose the required raw transaction surface reliably, so the implementation was changed to use a dedicated PostgreSQL connection pool for the transaction. This keeps the critical database operations on the same PostgreSQL transaction.

## Demo Video

Final six-minute demonstration video:

TBD

The final video will cover:

- Problem and user flows
- Architecture and database design
- Passenger flow
- Driver flow
- Pooling and fare calculation
- Capacity/concurrency handling
- Important edge case
- Deployment