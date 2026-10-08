# Activity 3 - Student API with PostgreSQL

A Node.js and Express student API using PostgreSQL for persistent storage.

## Project Structure

```text
.
├── .env.example
├── .gitignore
├── app.test.js
├── data/
│   └── seed.js
├── package.json
├── README.md
├── server.js
└── src/
    ├── app.js
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── authController.js
    │   └── studentController.js
    ├── middleware/
    │   └── authMiddleware.js
    ├── models/
    │   ├── studentModel.js
    │   ├── tokenModel.js
    │   └── userModel.js
    ├── routes/
    │   ├── authRoutes.js
    │   └── studentRoutes.js
    ├── services/
    │   └── tokenService.js
    ├── utils/
    │   ├── index.js
    │   └── response.js
    └── validations/
        ├── authValidation.js
        └── studentValidation.js
```

## Database Setup

Copy the example configuration file and set your local PostgreSQL credentials and a unique JWT secret:

```bash
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env`. Then create the `group4` PostgreSQL database and update `DATABASE_URL` in `.env`. Never commit `.env` or real credentials.

For local SQLite development instead, comment out `DATABASE_URL` and set `USE_SQLITE=true`. SQLite is also used automatically in tests.

## Run the Project

```bash
npm install
npm start
```

The API runs on port 3000 by default.

## API Documentation

The OpenAPI 3.0 definition is in [`docs/openapi.yaml`](docs/openapi.yaml). Import it into Swagger Editor or another OpenAPI-compatible viewer. Students routes use a zero-based position as `{index}` and require a bearer access token.

Run the automated tests with:

```bash
npm test
```

## Authentication

This project now includes JWT-based authentication with refresh tokens.

- `POST /auth/register` or `POST /auth/signup` — body: `{ name, email, password }` — creates a user.
- `POST /auth/signin` or `POST /auth/login` — body: `{ email, password }` — returns `{ token, refreshToken, user }`.
- `POST /auth/refresh` — body: `{ refreshToken }` — returns a new access token.
- `POST /auth/logout` or `POST /auth/signout` — header: `Authorization: Bearer <token>` and optional body `{ refreshToken }` — revokes the access token and removes the refresh token.

Protected routes (like `/students`) require the header:
```
Authorization: Bearer <token>
```

Notes:
- Refresh tokens and blacklisted tokens are persisted in the database.
- `JWT_SECRET` is required; the server will not start without it.
- Do not commit `.env`, database files, access tokens, or refresh tokens.



