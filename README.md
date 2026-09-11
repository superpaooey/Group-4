# Activity 3 - Student API with PostgreSQL

A Node.js and Express student API using PostgreSQL for persistent storage.

## Project Structure

```text
.
├── .env.example
├── .gitignore
├── app.test.js
├── package.json
├── README.md
├── server.js
└── src/
    ├── app.js
    ├── config/
    │   └── database.js
    ├── controllers/
    │   └── studentController.js
    ├── middleware/
    ├── models/
    │   └── studentModel.js
    ├── routes/
    │   └── studentRoutes.js
    ├── services/
    ├── utils/
    └── validation/
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


