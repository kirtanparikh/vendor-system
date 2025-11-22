# System Design & Architecture Document

## 1. System Overview
**Project:** Vendor & Driver Onboarding System
**Architecture:** Microservices-ready, Containerized Full-Stack Application.
**Tech Stack:** - **Backend:** Node.js (Express)
- **Frontend:** Next.js
- **Database:** PostgreSQL
- **Cache:** Redis 
- **Infrastructure:** Docker Compose

---

## 2. Architectural Patterns
The backend strictly follows the **Controller-Service-Repository** pattern to separate concerns and mimic enterprise Java/Spring Boot architectures:

1.  **Controller Layer** (`/controllers`): Handles HTTP requests, input validation, and response formatting. It contains no business logic.
2.  **Service Layer** (`/services`): Contains the core business logic (e.g., Tree Construction Algorithm, Password Hashing). It interacts with the Repository and Cache layers.
3.  **Repository Layer** (`/models`): Encapsulates all data access. It executes raw, parameterized SQL queries using the `pg` library, avoiding the overhead of an ORM.

---

## 3. Core Algorithm: N-Level Hierarchy Construction
**Problem:** Efficiently rendering a multi-level organization tree (HQ -> Region -> City -> Driver) without overloading the database.
**Naive Approach:** Recursive SQL queries (e.g., finding a parent, then querying for children) results in an **N+1 Query Problem**, leading to O(N²) complexity or worse.

**My Solution: Iterative O(N) Hash Map Construction**
Implemented in `VendorService.js`, this algorithm constructs the entire tree in **O(N)** time complexity:
1.  **Batch Fetch:** We execute exactly **2 SQL queries** to fetch *all* vendors and *all* drivers in parallel.
2.  **Hash Mapping (Pass 1):** We iterate through the vendors once to create an in-memory Map (Lookup Table) keyed by ID.
3.  **Association (Pass 2):**
    - We iterate through Drivers and attach them to their parent Vendor using the Map (O(1) lookup).
    - We iterate through Vendors and attach them to their parent Vendor using the Map.
4.  **Result:** The hierarchy is built in memory with linear time complexity, ensuring scalability even with 10,000+ nodes.

---

## 4. Caching Strategy
To handle high read traffic (e.g., dashboard views), I implemented a **Read-Through Caching Strategy** using Redis:

- **Read Path:** 1. Incoming Request -> Check Redis Key `vendor_hierarchy`.
  2. **Hit:** Return cached JSON immediately (~2ms response time).
  3. **Miss:** Execute O(N) Algorithm -> Store result in Redis (TTL: 10 mins) -> Return JSON.
- **Write Path:** - On `createSubVendor`, the system explicitly invalidates the `vendor_hierarchy` cache key to ensure immediate consistency for the next read.

---

## 5. Database Design & Schema
- **Recursive Relationships:** The `vendors` table uses a self-referencing `parent_id` Foreign Key. This allows for an **infinite depth** hierarchy without changing the database schema.
- **Flexible Permissions:** Instead of a rigid permissions table, I utilized a `permissions` **JSONB** column. This allows for schema-less, granular access control (e.g., `{"can_verify": true}`) that can evolve without database migrations.
- **Driver Metadata:** The `drivers` table is linked via `vendor_id` and stores compliance metadata like `license_number`, which is exposed to the frontend for quick verification.

---

## 6. Security Implementation
- **Authentication:** Stateless JWT (JSON Web Token) strategy. The backend issues a signed token upon login, which the frontend stores in HTTP-safe cookies/headers.
- **Password Security:** All passwords are hashed using **Bcrypt** with 10 salt rounds before storage.
- **Access Control:** API endpoints are protected via middleware (`AuthMiddleware.js`) that verifies the token signature before processing requests.
