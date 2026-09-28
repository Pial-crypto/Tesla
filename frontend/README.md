# Dhaka Tesla Pool

Dhaka Tesla Pool is a ride-pooling MVP for Dhaka where passengers can request rides and Tesla drivers can accept compatible ride requests into shared pools while respecting vehicle seat capacity.

The project focuses on reliable ride lifecycle management, pooling, fare calculation, authentication, authorization, database consistency, concurrency protection, testing, and a simple passenger/driver experience.

---

## Table of Contents

- Overview
- Problem Statement
- Users
- Core Features
- Ride Lifecycle
- Architecture
- Database Design
- Technology Stack
- Project Structure
- Prerequisites
- Environment Variables
- Local Setup
- Docker Setup
- Database Migration and Seed
- Running the Backend
- Running the Frontend
- Demo Credentials
- API Overview
- Fare Calculation
- Pooling and Capacity
- Concurrency Strategy
- Testing
- Deployment
- Screenshots
- Key Decisions and Trade-offs
- Known Limitations
- Future Improvements
- Scaling Considerations
- AI Usage
- Git Workflow
- Demo Video
- Final Submission Checklist

---

# Overview

Dhaka Tesla Pool provides a simple ride-pooling workflow:

- Passengers can create ride requests.
- Drivers can view available ride requests.
- Compatible passengers can share one Tesla.
- Tesla seat capacity is enforced by the backend.
- Individual fares are recalculated when rides are pooled.
- Ride state transitions are validated by the backend.
- Ride history is maintained through ride events.
- JWT authentication protects API access.
- Role-based authorization separates passenger and driver operations.
- PostgreSQL row-level locking protects Tesla capacity during concurrent ride acceptance.

The system intentionally keeps the architecture simple while focusing on correctness and business integrity.

---

# Problem Statement

The goal is to build a small ride-pooling platform where multiple passengers can share a Tesla without exceeding its configured seat capacity.

The system needs to support:

- Passenger authentication
- Driver authentication
- Ride requests
- Ride matching
- Shared Tesla pools
- Seat capacity enforcement
- Fare calculation
- Ride lifecycle management
- Ride cancellation
- Ride history
- Authorization
- Concurrent ride acceptance

The most important consistency requirement is preventing multiple concurrent requests from consuming the same remaining Tesla seat.

---

# Users

## Passenger

Passengers can:

- Sign up
- Log in
- Request a ride
- Select pickup zone
- Select destination zone
- Select number of seats
- Select payment method
- View fare estimate
- View active ride status
- View ride timeline
- Cancel eligible rides
- View ride history

## Driver

Drivers can:

- Log in
- View available ride requests
- Accept compatible rides
- Create or reuse a Tesla pool
- Enforce Tesla capacity
- View the active pool
- Mark the pool as arrived
- Start the trip
- Complete the trip
- View completed ride history

---

# Core Features

## Authentication

- Passenger signup
- Passenger login
- Driver login
- JWT authentication
- Password hashing using bcrypt
- Role-based authorization

## Passenger Flow

- Create ride request
- Fare estimation
- Ride status tracking
- Ride timeline
- Ride cancellation
- Ride history

## Driver Flow

- View available requests
- Accept ride
- Add ride to Tesla pool
- Mark arrival
- Start trip
- Complete trip
- View history

## Pooling

- Multiple passengers can share one Tesla
- Compatible pickup zones are required
- Tesla capacity is enforced
- Individual pooled fares are recalculated
- Pool status is persisted
- Ride status is persisted
- Ride events are recorded

---

# Ride Lifecycle

The ride lifecycle controls the complete journey of a passenger request, from the initial request to trip completion.

![Ride Lifecycle](lifecycle.png)

## Main Lifecycle

REQUESTED → MATCHED → DRIVER_ARRIVED → STARTED → COMPLETED

Cancellation is supported from eligible states:

REQUESTED → CANCELLED

MATCHED → CANCELLED

DRIVER_ARRIVED → CANCELLED

## Lifecycle Explanation

### 1. REQUESTED

The passenger creates a ride request.

At this point:

- The ride has no Tesla pool.
- The ride is available for a compatible driver.
- The passenger can cancel the request.

### 2. MATCHED

A driver accepts the ride.

The backend:

- Verifies the ride is still REQUESTED.
- Finds or creates a compatible Tesla pool.
- Checks pickup-zone compatibility.
- Checks available Tesla seats.
- Adds the ride to the pool.
- Recalculates the pooled fare.
- Records a RideEvent.

### 3. DRIVER_ARRIVED

The driver reaches the pickup location.

The pool and its active rides move to DRIVER_ARRIVED.

### 4. STARTED

The driver starts the trip.

The pool and its active rides move to STARTED.

### 5. COMPLETED

The trip finishes.

The pool and its rides move to COMPLETED.

The completed ride becomes part of the passenger and driver history.

### 6. CANCELLED

An eligible ride can be cancelled before completion.

The backend rejects:

- Cancellation of an already completed ride.
- Duplicate cancellation.
- Unauthorized cancellation.
- Invalid lifecycle transitions.

## Why the Lifecycle Matters

The frontend displays the current ride state, but the backend is responsible for enforcing the lifecycle.

This prevents clients from arbitrarily changing a ride from REQUESTED directly to COMPLETED or performing another invalid transition.

Every important transition is also stored in RideEvent, which provides a timeline/history of what happened to the ride.

---

# Architecture

The application uses a layered architecture.

![Architecture](archi.png)

The request flow is:

Browser
↓
Next.js / React
↓
Node.js / Express API
↓
Authentication / Validation
↓
Controllers
↓
Business Services
↓
Prisma / PostgreSQL
↓
Database

Business rules are implemented in backend services instead of being trusted to the frontend.

Important rules include:

- Ride state transitions
- Pool compatibility
- Fare calculation
- Capacity enforcement
- Ownership checks
- Cancellation rules

---

# Database Design

The main database entities are:

- User
- Vehicle
- Ride
- Pool
- RideEvent

## User

Stores authentication and role information.

Important fields:

- id
- name
- email
- passwordHash
- role
- createdAt
- updatedAt

## Vehicle

Represents a Tesla assigned to a driver.

Important fields:

- id
- name
- driverId
- capacity

## Ride

Represents a passenger ride request.

Important fields:

- id
- passengerId
- pickupZone
- destZone
- seats
- status
- fareSoloPaisa
- farePaisa
- paymentMethod
- poolId
- createdAt
- updatedAt

## Pool

Represents a shared Tesla trip.

Important fields:

- id
- vehicleId
- pickupZone
- status
- createdAt
- updatedAt

## RideEvent

Stores the lifecycle history of a ride.

Important fields:

- id
- rideId
- fromStatus
- toStatus
- actorId
- note
- at

## Database ERD

The final ERD screenshot is taken directly from the database/Supabase interface.

![Database ERD](erd-supabase.png)

---

# Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| UI | React + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM / DB Client | Prisma ORM |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Testing | Vitest |
| Containerization | Docker + Docker Compose |
| Deployment | Vercel + Render + Supabase |
| Version Control | Git + GitHub |

---

# Project Structure

tesla/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── driver.controller.js
│   │   │   └── ride.controller.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── driver.routes.js
│   │   │   └── ride.routes.js
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.js
│   │   │   ├── driver.service.js
│   │   │   └── ride.service.js
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── ride.validator.js
│   │   │
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   └── fare.js
│   │   │
│   │   ├── handler/
│   │   │   └── asyncHandler.js
│   │   │
│   │   ├── prisma/
│   │   │   ├── contract.prisma
│   │   │   ├── contract.json
│   │   │   ├── contract.d.ts
│   │   │   └── migrations/
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── passenger/
│   │   │   └── page.tsx
│   │   └── driver/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── passenger/
│   │   └── driver/
│   │
│   ├── hook/
│   │   └── auth.ts
│   │
│   ├── lib/
│   ├── types/
│   ├── utils/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
└── README.md

---

# Prerequisites

Install:

- Node.js
- npm
- Git
- Docker Desktop

Docker is recommended for running PostgreSQL locally.

---

# Environment Variables

## Backend

Create:

backend/.env

Example:

DATABASE_URL="postgresql://tesla:tesla_dev_password@localhost:5432/tesla_pool"
JWT_SECRET="your-local-development-secret"
PORT=5000

A template is available in:

backend/.env.example

## Frontend

Create:

frontend/.env.local

For local development:

NEXT_PUBLIC_API_URL=http://localhost:5000

For production:

NEXT_PUBLIC_API_URL=https://tesla-b52j.onrender.com

Never commit real environment files or database credentials.

---

# Local Setup

Clone the repository:

git clone https://github.com/Pial-crypto/Tesla.git

Enter the project:

cd Tesla

Checkout the integration branch:

git checkout pre-release

Install backend dependencies:

cd backend
npm install

Install frontend dependencies:

cd ../frontend
npm install

---

# Docker Setup

The project includes Docker Compose for:

- PostgreSQL
- Backend
- Frontend

Start the complete stack:

docker compose up -d

Check containers:

docker compose ps

Expected services:

tesla-postgres
tesla-backend
tesla-frontend

Local URLs:

Frontend:
http://localhost:3000

Backend:
http://localhost:5000

PostgreSQL:
localhost:5432

Stop the stack:

docker compose down

PostgreSQL data is persisted using the Docker volume:

postgres_data

---

# Database Migration and Seed

The project uses Prisma migrations.

From the backend directory:

cd backend

Generate the Prisma contract:

npx prisma contract emit

Apply migrations:

npx prisma db migrate

Check migration status:

npx prisma migration status

Current migrations:

20260925T2104_initial
20260927T0316_add_pooling

The seed contains the story users required for demonstration and testing.

Seed users:

- Jashim
- Nusrat
- Rafiq
- Shirin

The production deployment also runs migration and seed during backend startup.

---

# Running the Backend

cd backend
npm install
npm run dev

Backend:

http://localhost:5000

---

# Running the Frontend

cd frontend
npm install
npm run dev

Frontend:

http://localhost:3000

---

# Demo Credentials

The seeded users use:

Password:
password123

## Driver

Name: Jashim
Email: jashim@oitesla.test
Role: DRIVER

## Passenger

Name: Nusrat
Email: nusrat@oitesla.test
Role: PASSENGER

## Passenger

Name: Rafiq
Email: rafiq@oitesla.test
Role: PASSENGER

## Passenger

Name: Shirin
Email: shirin@oitesla.test
Role: PASSENGER

These credentials are for development and demonstration only.

---

# API Overview

All API endpoints use:

/api

## Authentication

### Signup

POST /api/auth/signup

### Login

POST /api/auth/login

---

# Passenger API

### Create Ride

POST /api/rides

### Get Passenger Rides

GET /api/rides

### Fare Estimate

GET /api/rides/fare/estimate

### Cancel Ride

POST /api/rides/:id/cancel

### Ride History

GET /api/rides/:id/history

---

# Driver API

### Available Requests

GET /api/driver/requests

### Accept Ride

POST /api/driver/rides/:id/accept

### Current Pool

GET /api/driver/pool

### Arrive at Pool

POST /api/driver/pool/arrive

### Start Pool

POST /api/driver/pool/start

### Complete Pool

POST /api/driver/pool/complete

### Driver History

GET /api/driver/history

Protected endpoints require JWT authentication and the appropriate user role.

---

# Fare Calculation

The MVP uses a simple zone-based fare model.

Current configuration:

Base Fare = 5000 paisa

Per Zone Distance = 2000 paisa

Pool Discount = 15%

The system calculates a solo fare first.

When the ride becomes part of a pool, the pooled fare is recalculated.

The database stores:

fareSoloPaisa
farePaisa

This makes the original fare and current pooled fare independently available.

---

# Dhaka Zones

The MVP uses predefined Dhaka zones:

- Banani
- Mohakhali
- Gulshan 1
- Farmgate
- Uttara
- Dhanmondi
- Mirpur
- Bashundhara

The project does not use real-time road routing.

Instead, the zone list provides deterministic matching and distance calculation for the MVP.

---

# Pooling and Capacity

Each Tesla has a configured seat capacity.

The seeded Tesla is:

Name: Bullet
Capacity: 3 seats

When a driver accepts a ride, the backend:

1. Checks that the ride is still REQUESTED.
2. Identifies the driver's Tesla.
3. Finds or creates a compatible pool.
4. Checks pickup-zone compatibility.
5. Locks the relevant database rows.
6. Calculates currently occupied seats.
7. Checks remaining Tesla capacity.
8. Rejects the request if capacity would be exceeded.
9. Adds the ride to the pool.
10. Recalculates pooled fares.
11. Records the ride event.

Capacity rule:

occupied seats + requested seats <= vehicle capacity

---

# Concurrency Strategy

Capacity protection is one of the most important backend consistency requirements.

Example:

Tesla capacity = 3

Current occupied seats = 2

Remaining seats = 1

Two passengers may attempt to join at almost exactly the same time.

Without concurrency protection, both requests could read the same remaining capacity and both be accepted.

The backend therefore uses a PostgreSQL transaction with row-level locking.

Conceptually:

SELECT vehicle
FOR UPDATE

The critical transaction:

1. Begins a PostgreSQL transaction.
2. Locks the driver's Tesla row.
3. Locks the requested ride.
4. Finds the active pool.
5. Locks active pool rides.
6. Calculates occupied seats.
7. Validates capacity.
8. Updates the ride.
9. Recalculates pooled fares.
10. Creates a RideEvent.
11. Commits the transaction.

Another concurrent request targeting the same Tesla must wait for the first transaction to complete.

This prevents overbooking caused by concurrent ride acceptance.

A dedicated PostgreSQL connection pool is used for this critical transaction because the Prisma runtime API used by the project did not reliably expose the required raw transaction surface.

---

# Testing

Testing is implemented with Vitest.

Run:

cd backend
npm test

The automated tests cover:

- Fare calculation
- Pool discount
- Seat multiplication
- Ride acceptance
- Full ride lifecycle
- Invalid state transitions
- Sequential capacity protection
- Concurrent capacity protection

Additional integration testing verified:

- Passenger ride request
- Driver acceptance
- Driver arrival
- Trip start
- Trip completion
- Pooling
- Fare repricing
- Capacity protection
- Ride cancellation
- Duplicate cancellation
- Passenger ownership authorization
- Driver endpoint authorization
- Ride history
- Driver history
- Docker startup
- Database migrations
- Frontend production build
- Session persistence

---

# Deployment

The application is deployed using free/free-tier infrastructure.

## Frontend

Vercel:

https://tesla-seven-mocha.vercel.app

## Backend

Render:

https://tesla-b52j.onrender.com

## Database

Supabase PostgreSQL.

The production database connection string is intentionally not included in this repository.

All production secrets are configured through deployment environment variables.

---

# Production Architecture

User Browser
    |
    v
Vercel
Next.js Frontend
    |
    | HTTPS
    v
Render
Node.js / Express API
    |
    | PostgreSQL
    v
Supabase
PostgreSQL Database

---

# Screenshots

The repository includes screenshots for the main passenger, driver, architecture, and ride lifecycle flows.

## Login

![Login](login.png)

## Signup

![Signup](sign%20up.png)

## Request Ride

![Request Ride](request%20ride.png)

## Ride Request

![Ride Request](ride%20req.png)

## Accepted Ride / Pool

![Accepted Ride](acceptedridetopool.png)

## Driver Arrived

![Driver Arrived](marked%20arrived.png)

## Trip Started

![Trip Started](drive%20started.png)

## Completed Pool

![Completed Pool](completed%20pool.png)

## Ride History

![Ride History](ride%20history.png)

## Cancel Ride

![Cancel Ride](cancel%20ride.png)

## Architecture

![Architecture](archi.png)

## Database ERD

![Database ERD](erd-supabase.png)

## Ride Lifecycle

![Ride Lifecycle](lifecycle.png)

---

# Key Decisions and Trade-offs

## PostgreSQL

PostgreSQL was selected because the application contains strongly related entities and requires transactional consistency.

The database supports row-level locking for the capacity-sensitive ride acceptance operation.

## JWT Authentication

JWT provides a simple stateless authentication mechanism suitable for this MVP.

Passwords are hashed using bcrypt.

## Zone-Based Matching

The MVP uses predefined Dhaka zones rather than real-time routing.

This keeps the matching logic deterministic and avoids unnecessary external mapping dependencies.

## Simple Fare Model

The fare calculation is intentionally simple.

The goal is to demonstrate:

- Fare estimation
- Seat multiplication
- Pool discount
- Fare recalculation

rather than build a production-grade routing and pricing engine.

## Backend Business Logic

Important business rules are enforced by backend services.

The frontend is not trusted for:

- Capacity
- Ride state
- Ownership
- Cancellation
- Pool compatibility
- Fare calculation

## Row-Level Locking

PostgreSQL row-level locking was selected for the capacity race condition.

This solves the consistency problem without adding unnecessary distributed infrastructure.

---

# Known Limitations

The current MVP intentionally has several limitations:

- Zone-based distance is not real road distance.
- No live GPS tracking.
- No real payment processing.
- No production routing engine.
- Matching is intentionally simplified.
- No WebSocket-based live updates.
- No distributed event infrastructure.
- No external map provider.
- Limited observability.
- Free-tier infrastructure may have cold starts or inactivity pauses.

---

# Future Improvements

Possible future improvements include:

- Real geospatial matching
- PostGIS
- Live GPS tracking
- WebSocket-based ride updates
- Real payment integration
- Smarter route compatibility
- Idempotency keys
- API rate limiting
- Better observability
- Distributed tracing
- Redis caching
- Queue/event infrastructure
- Improved matching algorithms
- Production monitoring
- Retry handling

---

# Scaling Considerations

If the platform grows significantly, the current monolithic API could evolve into a horizontally scalable architecture.

Possible future architecture:

Clients
    |
    v
Load Balancer
    |
    +-------------------+
    |        |          |
    v        v          v
API 1     API 2      API N
    |        |          |
    +--------+----------+
             |
             v
     Ride / Matching Service
             |
        +----+----+
        |         |
        v         v
     Redis    PostgreSQL
                  |
                  v
             Read Replicas

Potential improvements:

- Horizontal API scaling
- Database connection pooling
- Read replicas
- Query optimization
- Redis caching
- PostGIS geospatial queries
- Queue/event processing
- WebSocket infrastructure
- Rate limiting
- Idempotency
- Centralized logging
- Metrics
- Distributed tracing
- Error monitoring

The current MVP intentionally avoids this infrastructure because it is not required for the assessment-scale application.

---

# AI Usage

AI tools were used as engineering assistance during development.

Areas where AI assistance was used include:

- Architecture discussion
- Database design review
- Prisma debugging
- API implementation guidance
- Frontend component organization
- Test planning
- Concurrency analysis
- Documentation drafting

AI suggestions were reviewed and tested before being incorporated.

## Accepted Suggestion

The PostgreSQL row-locking approach was accepted for protecting Tesla capacity during concurrent ride acceptance.

This provides a database-level consistency guarantee without introducing unnecessary distributed locking infrastructure.

## Changed Approach

An initial approach attempted to use the Prisma runtime transaction/raw API for the locking query.

The runtime behavior did not expose the required raw transaction functionality reliably.

The implementation was therefore changed to use a dedicated PostgreSQL connection pool for the critical transaction.

This allowed the capacity check, ride update, fare recalculation, and ride event creation to execute within one database transaction.

---

# Git Workflow

The project uses feature branches and integration branches.

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

Feature branches include:

feature/auth
feature/driver-flow
feature/pooling
feature/project-foundation
feature/ride-request

Commit format:

<type>(<scope>): <short description>

Examples:

feat(auth): add passenger login endpoint

feat(pool): enforce Tesla seat capacity

fix(pool): prevent overbooking available seats

fix(cors): enable frontend origin for api requests

test(backend): add ride flow integration tests

docs(readme): document project architecture and setup

build(docker): add compose setup for api and postgres

The main integration workflow is:

master
    |
    v
pre-release
    |
    v
deployment verification
    |
    v
release/v1.0.0

---

# Demo Video

<!--

Add the final 6-minute Loom / Google Drive / YouTube link here.

Example:

[Watch the 6-minute project walkthrough](YOUR_VIDEO_URL_HERE)

-->

The walkthrough covers:

- Problem
- Users
- Core idea
- Architecture
- Backend
- Frontend
- Database / ERD
- Ride lifecycle
- Pooling
- Fare calculation
- Capacity protection
- Passenger flow
- Driver flow
- Edge case
- Deployment

## Video Structure

### 0:00 – 1:00

Problem, users, and core idea.

### 1:00 – 3:00

Architecture, backend, frontend, database, ride lifecycle, pooling logic, concurrency strategy, and key trade-off.

### 3:00 – 6:00

Live product demonstration:

Passenger Login
    ↓
Request Ride
    ↓
REQUESTED
    ↓
Driver Login
    ↓
Accept Ride
    ↓
MATCHED
    ↓
Second Passenger
    ↓
Pooling
    ↓
Fare Recalculation
    ↓
DRIVER_ARRIVED
    ↓
STARTED
    ↓
COMPLETED
    ↓
History

Then demonstrate an edge case such as:

Invalid state transition

or:

Attempt to exceed Tesla capacity

Finally show the deployed application.

---

# Security Notes

Never commit:

.env
.env.local
DATABASE_URL
JWT_SECRET
Database passwords
API keys
Access tokens

Use .env.example files for documentation.

Production credentials are stored as deployment environment variables.

---

# Final Submission Checklist

- [x] Passenger authentication
- [x] Driver authentication
- [x] Ride request
- [x] Ride lifecycle
- [x] Ride cancellation
- [x] Ride history
- [x] Driver request list
- [x] Driver ride acceptance
- [x] Tesla pooling
- [x] Pool capacity enforcement
- [x] Fare recalculation
- [x] Backend authorization
- [x] Ride ownership protection
- [x] Invalid state transition protection
- [x] Concurrency protection
- [x] PostgreSQL migrations
- [x] Seed/demo data
- [x] Docker setup
- [x] Automated tests
- [x] Frontend production build
- [x] Architecture diagram
- [x] Database design
- [x] Screenshots
- [x] Vercel deployment
- [x] Render deployment
- [x] Supabase PostgreSQL
- [x] AI usage documentation
- [ ] Final six-minute video link
- [ ] Final release/v1.0.0 verification

---

# License

This project was created as a technical assessment / demonstration project.