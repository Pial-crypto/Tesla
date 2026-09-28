# Dhaka Tesla Pool

A ride-pooling MVP for Dhaka where passengers can request rides and Tesla drivers can accept compatible requests into shared pools while respecting vehicle seat capacity.

The project focuses on authentication, ride lifecycle management, pooling, fare calculation, Tesla capacity enforcement, authorization, data consistency, concurrent ride acceptance, ride history, testing, Dockerization, and deployment.

---

## Project Walkthrough Video

### [Watch the 6-Minute Project Walkthrough on Loom](https://www.loom.com/share/fc42cdd15b454eaaa63bacef82382257)

The walkthrough covers the problem, users, architecture, backend, frontend, database design, ride and pool lifecycle, key technical decisions, pooling, fare calculation, edge-case handling, and deployment.

### Video Structure

**0:00–1:00 — Problem, Users & Core Idea**

- Problem
- Passenger and driver roles
- Core ride-pooling concept

**1:00–3:00 — Engineering Walkthrough**

- Architecture
- Backend
- Frontend
- Database / ERD
- Ride and pool lifecycle
- Pooling logic
- Concurrency protection
- Key technical decision and trade-off

**3:00–6:00 — Product Tour**

- Passenger ride request
- Driver ride acceptance
- Shared Tesla pooling
- Fare recalculation
- Ride status progression
- Capacity/concurrency edge case
- Ride history
- Deployment

---

# Live Deployment

## Frontend

https://tesla-seven-mocha.vercel.app/

## Backend API

https://tesla-b52j.onrender.com/

## Database

PostgreSQL hosted on Supabase.

Production database credentials are intentionally not included in this repository.

---

# Problem Statement

Dhaka Tesla Pool demonstrates a simple ride-pooling workflow between passengers and Tesla drivers.

Passengers can:

- Create an account and sign in
- Request rides using pickup and destination zones
- Select required seats
- Select a payment method
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

The main engineering challenge is maintaining consistent ride and pool state while ensuring that Tesla capacity can never be exceeded, including when multiple ride requests are accepted concurrently.

---

# Core Features

## Authentication

- Passenger signup
- Passenger login
- Driver login
- JWT authentication
- Password hashing using bcrypt
- Role-based authorization

## Passenger

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

## Driver / Tesla

- Driver authentication
- View available ride requests
- Accept compatible ride requests
- Create or reuse a Tesla pool
- Enforce Tesla seat capacity
- Recalculate fares when rides become pooled
- Mark the pool as arrived
- Start the trip
- Complete the trip
- View completed ride history

## Ride Pooling

- Multiple passengers can share one Tesla
- Pool requests require compatible pickup zones
- Occupied seats cannot exceed Tesla capacity
- Individual fares are recalculated when pooling occurs
- Ride and pool lifecycle states are persisted
- Ride events are stored for history and traceability

---

# Ride Lifecycle

The ride lifecycle controls the complete journey of a passenger request, from the initial request to trip completion.

![Ride Lifecycle](lifecycle.png)

## Main Lifecycle

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

## Cancellation

Eligible rides can be cancelled before completion:

```text
REQUESTED ──────────┐
                    |
MATCHED ────────────┼──> CANCELLED
                    |
DRIVER_ARRIVED ─────┘
```

## Lifecycle Explanation

### REQUESTED

The passenger creates a ride request.

At this point:

- The ride is available for a compatible driver.
- The ride has not yet been matched.
- The passenger can cancel the ride.

### MATCHED

A driver accepts the ride.

The backend:

- Verifies the ride is still `REQUESTED`
- Identifies the driver's Tesla
- Finds or creates a compatible pool
- Checks pickup-zone compatibility
- Checks Tesla capacity
- Adds the ride to the pool
- Recalculates the pooled fare
- Records a `RideEvent`

### DRIVER_ARRIVED

The driver reaches the pickup location.

The pool and its active rides move to `DRIVER_ARRIVED`.

### STARTED

The driver starts the trip.

The pool and its active rides move to `STARTED`.

### COMPLETED

The trip finishes.

The pool and its rides move to `COMPLETED`.

The completed ride becomes part of passenger and driver history.

### CANCELLED

Eligible rides can be cancelled before completion.

The backend rejects:

- Cancellation of an already completed ride
- Duplicate cancellation
- Unauthorized cancellation
- Invalid lifecycle transitions

## Why the Lifecycle Matters

The frontend displays the current ride state, but the backend is responsible for enforcing the lifecycle.

This prevents clients from arbitrarily changing a ride from `REQUESTED` directly to `COMPLETED` or performing another invalid transition.

Every important transition is also stored in `RideEvent`, providing a complete ride timeline.

---

# Architecture

The application follows a simple layered architecture.

![Architecture](archi.png)

The main request flow is:

```text
Browser
   |
   v
Next.js / React
   |
   | HTTP + JWT
   v
Node.js / Express API
   |
   v
Middleware / Controllers
   |
   v
Services / Business Logic
   |
   +----------------------+
   |                      |
   v                      v
Prisma ORM        PostgreSQL Transaction
   |                      |
   +----------+-----------+
              |
              v
         PostgreSQL
```

Business rules are enforced in the backend rather than being trusted to the frontend.

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

# Database / ERD

The database ERD screenshot is captured from the Supabase PostgreSQL database.

![Database ERD](erd-supabase.png)

The main database entities are:

- `User`
- `Vehicle`
- `Ride`
- `Pool`
- `RideEvent`

The database uses relational constraints and indexes to support:

- Ride ownership
- Pool membership
- Lifecycle tracking
- Passenger history
- Driver history
- Capacity-sensitive operations

---

# Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM / Database Client | Prisma ORM + PostgreSQL client |
| Authentication | JWT + bcrypt |
| Containerization | Docker / Docker Compose |
| Database Migration | Prisma migrations |
| Testing | Vitest |
| Version Control | Git / GitHub |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |
| Database Hosting | Supabase PostgreSQL |

---

# Project Structure

```text
tesla/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── driver.controller.js
│   │   │   └── ride.controller.js
│   │   │
│   │   ├── handler/
│   │   │   └── asyncHandler.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   │
│   │   ├── prisma/
│   │   │   ├── contract.prisma
│   │   │   ├── contract.json
│   │   │   ├── contract.d.ts
│   │   │   └── migrations/
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
│   │   ├── utils/
│   │   │   ├── auth.js
│   │   │   └── fare.js
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   └── ride.validator.js
│   │   │
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
│   ├── .env.example
│   └── package.json
│
├── acceptedridetopool.png
├── archi.png
├── cancel ride.png
├── completed pool.png
├── drive started.png
├── erd-supabase.png
├── erd.png
├── lifecycle.png
├── login.png
├── marked arrived.png
├── request ride.png
├── ride history.png
├── ride req.png
├── sign up.png
│
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── tsconfig.json
└── README.md
```

---

# Prerequisites

Install:

- Node.js
- npm
- Git
- Docker Desktop

Docker is recommended for running the complete application locally.

---

# Environment Variables

## Backend

Create:

```text
backend/.env
```

Use `backend/.env.example` as the template.

Example:

```env
DATABASE_URL="postgresql://tesla:tesla_dev_password@localhost:5432/tesla_pool"
JWT_SECRET="your-development-secret"
PORT=5000
```

## Frontend

Create:

```text
frontend/.env.local
```

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production:

```env
NEXT_PUBLIC_API_URL=https://tesla-b52j.onrender.com
```

The frontend API client appends `/api` to the configured base URL.

Never commit:

- `.env`
- `.env.local`
- Database passwords
- JWT secrets
- API keys
- Access tokens
- Production credentials

---

# Local Setup

Clone the repository:

```bash
git clone https://github.com/Pial-crypto/Tesla.git
```

Enter the project:

```bash
cd Tesla
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

# Docker Setup

The project includes Docker Compose for:

- PostgreSQL
- Backend
- Frontend

## Start the Complete Stack

From the project root:

```bash
docker compose up -d
```

## Check Containers

```bash
docker compose ps
```

Expected services:

```text
tesla-postgres
tesla-backend
tesla-frontend
```

## Local URLs

Frontend:

```text
http://localhost:3000
```

Backend:

```text
http://localhost:5000
```

PostgreSQL:

```text
localhost:5432
```

## View Logs

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

## Stop the Stack

```bash
docker compose down
```

PostgreSQL data uses the Docker volume `postgres_data`.

---

# Docker Services

## PostgreSQL

- Image: `postgres:17-alpine`
- Database: `tesla_pool`
- User: `tesla`
- Port: `5432`
- Health check: `pg_isready`

## Backend

- Node.js 22 Alpine
- Express API
- Port: `5000`
- Depends on healthy PostgreSQL

## Frontend

- Next.js
- Port: `3000`
- Depends on backend

---

# Database Migration and Seed

The project uses Prisma migrations and a development seed containing the assessment story cast.

## Generate Prisma Contract

From the backend directory:

```bash
cd backend
npx prisma contract emit
```

## Apply Migrations

```bash
npx prisma db migrate
```

## Check Migration Status

```bash
npx prisma migration status
```

The project includes:

- Initial database schema migration
- Pooling migration

The production backend runs migration and seed initialization before starting the API.

---

# Seed Data

The seed contains the assessment story users:

- Jashim — Driver
- Nusrat — Passenger
- Rafiq — Passenger
- Shirin — Passenger

The seeded Tesla is:

```text
Name: Bullet
Capacity: 3 seats
Driver: Jashim
```

---

# Demo Credentials

All seeded demo users use:

```text
Password: password123
```

| Role | Name | Email |
|---|---|---|
| Driver | Jashim | jashim@oitesla.test |
| Passenger | Nusrat | nusrat@oitesla.test |
| Passenger | Rafiq | rafiq@oitesla.test |
| Passenger | Shirin | shirin@oitesla.test |

These credentials are for local/demo evaluation only.

---

# Running the Backend

From the backend directory:

```bash
cd backend
npm install
npm run dev
```

Backend:

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

Frontend:

```text
http://localhost:3000
```

---

# API Overview

All API endpoints are prefixed with:

```text
/api
```

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

The MVP uses a deterministic zone-based fare model.

## Current Configuration

```text
Base Fare = 5000 paisa
Distance Charge = 2000 paisa per zone distance
Pool Discount = 15%
```

## Solo Fare

```text
Solo Fare = (Base Fare + Distance Charge) × Seats
```

## Pooled Fare

```text
Pooled Fare = Solo Fare × (1 - Pool Discount)
```

The implementation stores monetary values as integer paisa rather than floating-point currency values.

When a ride joins a pool, its pooled fare is recalculated.

The original solo fare is also preserved.

---

# Zone-Based Matching

The MVP intentionally avoids external map and routing APIs.

Supported zones include:

- Banani
- Mohakhali
- Gulshan 1
- Farmgate
- Uttara
- Dhanmondi
- Mirpur
- Bashundhara

The current pool compatibility rule is:

```text
Compatible Pool = Same Pickup Zone
```

This keeps matching deterministic and easy to test.

---

# Pooling and Capacity

Each Tesla has a configured seat capacity.

The seeded Tesla:

```text
Name: Bullet
Capacity: 3 seats
```

When a driver accepts a ride, the backend:

1. Checks that the ride is still `REQUESTED`.
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

```text
occupied seats + requested seats <= vehicle capacity
```

---

# Concurrency Strategy

Pool capacity is a critical consistency requirement.

Example:

```text
Tesla capacity = 3
Current occupied seats = 2
Remaining seats = 1
```

Two passengers may attempt to claim the remaining seat at nearly the same time.

Without concurrency protection:

```text
Request A → sees 1 seat available
Request B → sees 1 seat available

Request A → accepts
Request B → accepts
```

This could incorrectly exceed Tesla capacity.

The backend uses a PostgreSQL transaction with row-level locking.

Conceptually:

```sql
SELECT "id", "capacity"
FROM "Vehicle"
WHERE "driverId" = $1
FOR UPDATE;
```

The critical transaction:

1. Begins a PostgreSQL transaction.
2. Locks the driver's Tesla row.
3. Locks the requested ride.
4. Finds or creates the active pool.
5. Locks active pool rides.
6. Calculates occupied seats.
7. Validates capacity.
8. Updates the accepted ride.
9. Recalculates pooled fares.
10. Creates the `RideEvent`.
11. Commits the transaction.

Another concurrent request targeting the same Tesla must wait for the first transaction to complete before performing its own capacity calculation.

This prevents concurrent ride acceptance from exceeding Tesla capacity.

---

# Testing

The application includes automated tests using Vitest.

Run:

```bash
cd backend
npm test
```

The automated test suite covers:

- Fare calculation
- Pool discount
- Seat multiplication
- Ride acceptance
- Full ride lifecycle
- Invalid state transitions
- Sequential capacity protection
- Concurrent capacity protection

Additional integration verification covered:

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
- Passenger ride history
- Driver history
- Docker startup
- Database migration status
- Frontend production build
- Session persistence

---

# Deployment

The application is deployed using free/free-tier infrastructure.

## Frontend

Vercel:

https://tesla-seven-mocha.vercel.app/

## Backend

Render:

https://tesla-b52j.onrender.com/

## Database

Supabase PostgreSQL.

Production database credentials are configured through deployment environment variables and are not committed to the repository.

---

# Production Architecture

```text
                    User Browser
                         |
                         v
                ┌─────────────────┐
                │     Vercel      │
                │ Next.js Frontend│
                └────────┬────────┘
                         |
                         | HTTPS / REST
                         v
                ┌─────────────────┐
                │     Render      │
                │ Node / Express  │
                │      API        │
                └────────┬────────┘
                         |
                         | PostgreSQL
                         v
                ┌─────────────────┐
                │    Supabase     │
                │   PostgreSQL    │
                └─────────────────┘
```

---

# Key Decisions and Trade-offs

## PostgreSQL

PostgreSQL was selected because the application has strongly related entities and strict consistency requirements around ride pooling and Tesla capacity.

The relational model fits:

- Users
- Vehicles
- Rides
- Pools
- Ride events
- Relationships
- Constraints
- Transactions

## JWT Authentication

JWT provides a simple stateless authentication mechanism suitable for this MVP.

Passwords are hashed using bcrypt.

Protected API endpoints validate the authenticated user and role.

## Prisma

Prisma is used for:

- Schema management
- Migrations
- Generated database contracts
- Regular database operations

A PostgreSQL client is additionally used for the concurrency-critical transaction because direct row-level locking is required for the capacity-sensitive operation.

## Zone-Based Matching

The MVP uses predefined Dhaka zones rather than real routing or geospatial infrastructure.

This keeps the matching model:

- Deterministic
- Easy to test
- Easy to explain
- Free from external map API dependencies

## Simple Fare Calculation

The fare model is intentionally lightweight.

The goal is to demonstrate:

- Distance-based pricing
- Seat multiplication
- Pool discounts
- Fare recalculation

rather than build a production-grade routing and dynamic pricing engine.

## Row-Level Locking

PostgreSQL row-level locking was selected for the capacity race condition.

This provides database-level consistency without introducing distributed locking infrastructure.

---

# Known Limitations

- Zone-based distance is not real road distance.
- No live GPS tracking.
- No real payment processing.
- No production routing engine.
- Matching is intentionally simplified.
- No WebSocket-based live ride updates.
- No distributed event infrastructure.
- No external map provider.
- No advanced dynamic pricing.
- Free-tier deployment infrastructure may experience cold starts.

---

# Future Improvements

Potential future improvements include:

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
- Driver online/offline state

---

# Scaling Considerations

If the platform grows significantly, the current modular API could evolve into a horizontally scalable architecture.

Potential improvements include:

## API Scaling

- Run multiple API instances
- Place a load balancer in front of the API
- Keep PostgreSQL as the transactional source of truth

## Database Scaling

- Add targeted composite indexes
- Use read replicas for read-heavy operations
- Optimize pool and ride queries
- Monitor lock contention
- Consider partitioning for very large ride/event tables

## Caching

Frequently accessed non-transactional data could use Redis or another cache.

Transactional ride and capacity state should remain backed by PostgreSQL.

## Geospatial Matching

The current zone-based matching model could be replaced with:

- PostGIS
- Geospatial indexes
- Driver location updates
- Radius-based matching
- Route compatibility calculations

## Queues and Events

Non-critical asynchronous operations could move to a queue:

- Notifications
- Analytics
- Audit processing
- Reporting
- External integrations

Critical capacity decisions would continue to use transactional database operations.

## Real-Time Communication

WebSockets or Server-Sent Events could provide:

- Driver location updates
- Ride status updates
- Arrival notifications
- Pool membership updates
- Trip completion updates

## Idempotency

State-changing operations such as ride acceptance could use idempotency keys to prevent duplicate requests caused by retries.

## Observability

A production deployment should include:

- Structured logging
- Metrics
- Distributed tracing
- Error tracking
- Database monitoring
- Lock/contention monitoring
- API latency monitoring

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

AI-generated suggestions were reviewed, tested, and modified where necessary.

The developer remains responsible for understanding and maintaining the implementation.

## Accepted Suggestion

The PostgreSQL row-locking approach was accepted for protecting Tesla capacity during concurrent ride acceptance.

This directly addresses the consistency requirement without introducing unnecessary distributed infrastructure.

## Changed Approach

An initial approach attempted to use the Prisma runtime transaction/raw API for the locking query.

The runtime behavior did not expose the required raw transaction surface reliably.

The implementation was changed to use a dedicated PostgreSQL connection pool for the critical transaction.

This keeps the capacity check, ride update, fare recalculation, and ride event creation inside one database transaction.

---

# Git Workflow

The project uses feature branches and integration branches.

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

Feature branches include:

```text
feature/auth
feature/driver-flow
feature/pooling
feature/project-foundation
feature/ride-request
```

The deployment workflow is:

```text
Feature Development
        |
        v
     master
        |
        v
   pre-release
        |
        v
Deployment Verification
        |
        v
 release/v1.0.0
```

---

# Commit Convention

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

# Product Walkthrough

The final walkthrough demonstrates the complete product flow.

## Passenger

```text
Passenger Login
      |
      v
Request Ride
      |
      v
REQUESTED
```

## Driver

```text
Driver Login
      |
      v
View Ride Request
      |
      v
Accept Ride
      |
      v
MATCHED
```

## Pooling

```text
Second Compatible Passenger
      |
      v
Existing Tesla Pool
      |
      v
Capacity Validation
      |
      v
Fare Recalculation
```

## Trip

```text
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

## Edge Cases

The system handles:

- Tesla capacity overflow
- Invalid ride state transitions
- Unauthorized ride modification
- Duplicate cancellation
- Passenger access to driver-only operations
- Concurrent ride acceptance

---

# Security Notes

Never commit:

```text
.env
.env.local
DATABASE_URL
JWT_SECRET
Database passwords
API keys
Access tokens
Production credentials
```

Use `.env.example` files for documentation and setup guidance.

Production credentials are stored as deployment environment variables.

---

## Screenshots

### Authentication

#### Login
![Login](login.png)

#### Sign Up
![Sign Up](sign%20up.png)

---

### Passenger Flow

#### Request Ride
![Request Ride](request%20ride.png)

#### Ride Request
![Ride Request](ride%20req.png)

#### Ride Accepted into Pool
![Accepted Ride to Pool](acceptedridetopool.png)

#### Ride History
![Ride History](ride%20history.png)

#### Cancel Ride
![Cancel Ride](cancel%20ride.png)

---

### Driver Flow

#### Marked Driver Arrived
![Driver Arrived](marked%20arrived.png)

#### Driver Started Ride
![Drive Started](drive%20started.png)

#### Completed Pool
![Completed Pool](completed%20pool.png)

---

### Architecture & Database

#### System Architecture
![System Architecture](archi.png)

#### Database ERD
![Database ERD](erd-supabase.png)

#### Ride Lifecycle
![Ride Lifecycle](lifecycle.png)

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
- [x] Supabase database ERD
- [x] Ride lifecycle diagram
- [x] Passenger screenshots
- [x] Driver screenshots
- [x] Vercel deployment
- [x] Render deployment
- [x] Supabase PostgreSQL
- [x] AI usage documentation
- [x] Six-minute project walkthrough
- [x] Git workflow
- [x] Scaling considerations

---

# License

This project was created as an engineering assessment project for demonstrating full-stack development, backend architecture, database design, testing, Dockerization, deployment, concurrency handling, and engineering decision-making.