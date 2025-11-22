
# Vendor Management System 

A high-performance, containerized dashboard for managing complex **N-Level fleet hierarchies**. Designed to visualize relationships between Headquarters, Regional Offices, City Operations, and Drivers with sub-millisecond data retrieval.

## Tech Stack

- **Backend:** Node.js (Express) with Controller-Service-Repository Pattern
- **Frontend:** Next.js, Tailwind CSS, React D3 Tree
- **Database:** PostgreSQL
- **Caching:** Redis 
- **DevOps:** Docker & Docker Compose

## Quick Start

**Prerequisites:** Docker installed and running.

```bash
git clone https://github.com/kirtanparikh/vendor-system.git
cd vendor-system

# Start the entire stack
docker-compose up -d --build

# Initialize Schema & Seed Data
# (Populates the DB with a realistic Indian fleet hierarchy: Mumbai/Bangalore/Delhi)
docker-compose exec api npm run init:db
docker-compose exec api npm run seed
````

**Access Credentials:**

  - **Frontend:** [http://localhost:3000](http://localhost:3000)
  - **Backend:** [http://localhost:5000](http://localhost:5000/)
  - **Login:** `admin@vendorsystem.com` / `password123`

## Key Features

  - **N-Level Hierarchy:** Unlimited depth parent-child relationships (HQ → Region → City → Driver).
  - **High-Performance Tree:** Implemented an **Iterative O(N) Hash Map algorithm** to construct the hierarchy without recursive DB queries.
  - **Redis Caching:** Latency reduction on read-heavy dashboard loads.
  - **RBAC Security:** Stateless JWT authentication with bcrypt password hashing.
  - **Permissions System:** Flexible JSONB-based access control.

## Documentation

For a deep dive into the architectural decisions, trade-offs, and cost estimation analysis, please see the **[System Design Document](https://github.com/kirtanparikh/vendor-system/blob/master/SYSTEM_DESIGN.md)** included in this repository.

## License

This project is licensed under the MIT License.
