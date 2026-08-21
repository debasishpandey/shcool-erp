# School ERP Backend

A production-grade, multi-tenant Spring Boot backend for a School ERP system.

## Architecture

This project implements a single-database, multi-tenant architecture with logical isolation.
Every tenant-owned entity (like `User`) is associated with a `Tenant`. 

Authentication is stateless using JWT. Upon successful login, the `tenantId` is embedded in the JWT.
A `JwtAuthenticationFilter` intercepts requests, extracts the JWT, and populates the `SecurityContext` and `TenantContext`.
All subsequent business logic and database queries utilize the `TenantContext` to ensure strict tenant isolation.

## Tech Stack
- Java 21
- Spring Boot 3+ (4.1.0 snapshot in this template)
- Spring Security
- Spring Data JPA
- MySQL
- io.jsonwebtoken (JJWT)
- BCrypt
- Lombok

## Configuration

The application uses environment variables for sensitive configuration.

Provide the following environment variables (or rely on defaults for local development):
- `DB_URL` (e.g., `jdbc:mysql://localhost:3306/school_erp`)
- `DB_USER` (e.g., `root`)
- `DB_PASSWORD` (e.g., `root`)
- `JWT_SECRET` (A 256-bit base64 encoded secure key for signing JWTs)
- `JWT_EXPIRATION` (Access token expiration in ms)
- `JWT_REFRESH_EXPIRATION` (Refresh token expiration in ms)
- `CORS_ALLOWED_ORIGINS` (Comma-separated list of allowed origins)
- `SEED_SUPER_ADMIN` (Set to `true` to create a default `SYSTEM` tenant and `superadmin` user on startup)

## How to Run

Ensure MySQL is running and the `school_erp` database is created.

```bash
# Compile and test
mvn clean test

# Run application
mvn spring-boot:run
```

## Initial Super Admin Seed

By default, the application will seed a `SYSTEM` tenant and a `superadmin` user (password: `superadmin`) upon startup if they do not exist.
You can disable this in production by setting `SEED_SUPER_ADMIN=false`.

## Authentication Flow

1. **Login:** `POST /api/auth/login` with `username` and `password`.
2. **Access Token:** The server validates credentials against the specific tenant and returns an access token (JWT) and a refresh token.
3. **Protected APIs:** Send the access token in the `Authorization` header: `Bearer <token>`.
4. **Refresh:** `POST /api/auth/refresh` with the refresh token to get a new access token.
5. **Logout:** `POST /api/auth/logout` revokes the refresh token.

## Example Requests

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "superadmin"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```
