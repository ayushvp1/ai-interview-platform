# AI Interview Platform — Admin Backend

Secure REST API for managing interview types and configurations.
Built with **Express.js**, **MongoDB (Mongoose)**, and **JWT authentication**.

---

## Quick Start

```bash
cd admin-backend
npm install
cp .env.example .env      # fill in your values
npm run seed              # seed default interview types
npm run dev               # development (nodemon)
# or
npm start                 # production
```

Server starts at: `http://localhost:5000`

---

## Environment Variables

| Variable         | Description                              | Default                        |
|------------------|------------------------------------------|--------------------------------|
| `PORT`           | Server port                              | `5000`                         |
| `NODE_ENV`       | Environment (`development`/`production`) | `development`                  |
| `MONGODB_URI`    | MongoDB connection string                | `mongodb://localhost:27017/...`|
| `JWT_SECRET`     | Secret key for signing JWTs             | *(set a strong value)*         |
| `JWT_EXPIRES_IN` | JWT expiry duration                      | `24h`                          |
| `ADMIN_USERNAME` | Admin login username                     | `admin`                        |
| `ADMIN_PASSWORD` | Admin login password (plain or bcrypt)   | `admin123!@#`                  |
| `CLIENT_ORIGIN`  | Allowed CORS origin                      | `*`                            |

---

## API Reference

All endpoints (except `/auth/login` and `/health`) require the header:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| POST   | /auth/login   | Get a JWT token     |

**Login request:**
```json
{ "username": "admin", "password": "admin123!@#" }
```

**Login response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJ...",
    "expiresIn": "24h",
    "admin": { "username": "admin", "role": "admin" }
  },
  "error": null
}
```

---

### Interview Types

| Method | Endpoint                  | Description                            |
|--------|---------------------------|----------------------------------------|
| GET    | /interview-types          | List all interview types               |
| POST   | /interview-types          | Create a new interview type            |
| GET    | /interview-types/:id      | Get details + config for one type      |
| PUT    | /interview-types/:id      | Update an interview type               |
| DELETE | /interview-types/:id      | Soft-delete an interview type          |

**Create / Update body fields:**

| Field           | Type     | Required | Notes                                    |
|-----------------|----------|----------|------------------------------------------|
| `name`          | string   | Yes (create) | Max 100 chars, must be unique        |
| `description`   | string   | No       | Max 500 chars                            |
| `enabled`       | boolean  | No       | Default `true`                           |
| `visibility`    | string   | No       | `public` / `private` / `restricted`     |
| `prerequisites` | string[] | No       | Array of prerequisite type names        |

---

### Interview Config

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | /interview-config/:interviewTypeId | Get config for an interview type  |
| PUT    | /interview-config/:interviewTypeId | Update components & settings      |

**Update config body:**
```json
{
  "components": [
    {
      "name": "Coding Assessment",
      "settings": {
        "questions": 5,
        "timeLimit": 45,
        "difficulty": "medium",
        "passingScore": 70
      }
    }
  ]
}
```

**Settings fields:**

| Field          | Type    | Range       | Default  |
|----------------|---------|-------------|----------|
| `questions`    | integer | 1 – 100     | `5`      |
| `timeLimit`    | integer | 1 – 480 min | `30`     |
| `difficulty`   | string  | easy/medium/hard/mixed | `medium` |
| `passingScore` | integer | 0 – 100     | `60`     |

---

## Response Format

All responses follow a consistent envelope:

```json
{
  "success": true | false,
  "message": "Human-readable message",
  "data": { ... } | null,
  "error": null | "error details"
}
```

## Status Codes

| Code | Meaning                              |
|------|--------------------------------------|
| 200  | Success                              |
| 201  | Resource created                     |
| 400  | Validation error / bad request       |
| 401  | Unauthenticated (invalid/expired JWT)|
| 404  | Resource not found                   |
| 409  | Conflict (duplicate name)            |
| 500  | Internal server error                |

---

## Postman Quick Test

```bash
# 1. Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123!@#"}'

# 2. List interview types (replace TOKEN)
curl http://localhost:5000/interview-types \
  -H "Authorization: Bearer TOKEN"

# 3. Update config for an interview type (replace ID and TOKEN)
curl -X PUT http://localhost:5000/interview-config/ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"components":[{"name":"Coding","settings":{"questions":5,"timeLimit":45,"difficulty":"hard","passingScore":70}}]}'
```
