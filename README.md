# Vendor System

Multi-level vendor hierarchy management system with N-level support, fleet tracking, and role-based access control.

## Tech Stack

**Backend**

- Node.js
- Express.js
- PostgreSQL
- Redis
- JWT Authentication

**Frontend**

- Next.js
- React
- Tailwind CSS
- react-d3-tree

**Architecture**: Controller-Service-Model Pattern

## Quick Start

**Prerequisites**: Docker & Docker Compose

```bash
git clone https://github.com/kirtanparikh/vendor-system.git
cd vendor-system
docker-compose up -d --build
docker-compose exec api npm run init:db
docker-compose exec api npm run seed
```

**Access**:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Login: `admin@vendorsystem.com` / `admin123`

## Features

- **N-Level Vendor Hierarchy**: Unlimited depth parent-child relationships
- **Fleet Management**: Vehicle and driver onboarding with assignments
- **Permissions System**: Granular JSONB-based access control
- **Redis Caching**: 10-minute TTL for hierarchy tree (O(N) build algorithm)
- **Interactive Visualization**: D3 tree with node expansion/collapse
- **Role-Based UI**: Dynamic rendering based on SUPER_VENDOR/SUB_VENDOR roles

## Architecture

Built with **ES6 Classes** following **Object-Oriented Principles**:

- Controller layer handles HTTP requests
- Service layer contains business logic
- Model layer manages database queries

## License

This project is licensed under the MIT License.
