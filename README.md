# Vendor Management System

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL / MongoDB (configurable)
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Architecture**: MVC with Controller-Service-Repository Pattern
- **Language**: JavaScript

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm**
- **PostgreSQL**
- **Redis** (for caching layer)
- **Git** (for version control)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kirtanparikh/vendor-system.git
   cd vendor-system
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   NODE_ENV=development
   PORT=3000

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vendor_system
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRY=24h
   ```

4. **Run database migrations** (if applicable)

   ```bash
   npm run migrate
   ```

5. **Start the application**

   Development mode:

   ```bash
   npm run dev
   ```

   Production mode:

   ```bash
   npm start
   ```

## Features

- N-Level Vendor Hierarchy Management
- Role-Based Access Control (RBAC)
- Redis Caching for Performance Optimization
- RESTful API Architecture
- Object-Oriented Design Principles

> **Note on Technology Stack & Architecture** > This project was architected in **Node.js** to ensure a complete, production-grade implementation of all functional requirements (N-Level Hierarchy, Caching, RBAC). However, the system is strictly designed using **Object-Oriented Principles (OOPS)** and a **Controller-Service-Repository** pattern. This ensures a seamless logical transition to **Java Spring Boot**, which is my primary area of interest and a framework I am eager to adopt immediately upon joining.

## License

This project is licensed under the MIT License.
