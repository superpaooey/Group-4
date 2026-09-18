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

Create a local PostgreSQL database and copy the example file:

```bash
copy .env.example .env
```

Then update the `.env` file with your local PostgreSQL credentials:

```env
DATABASE_URL=postgresql://postgres:100719@localhost:5432/group4
```

## Run the Project

```bash
npm install
npm start
```

The API runs on port 3000 by default.

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
- The default `JWT_SECRET` and DB credentials should be set in your `.env`.



