# Group 4 Student API

A small Express REST API for managing an in-memory list of students.

## Requirements

- Node.js 18 or newer

## Setup

```bash
npm install
npm start
```

The server listens on `http://localhost:3000`.

For automatic restarts during development:

```bash
npm run dev
```

## API

### List students

```bash
curl http://localhost:3000/students
```

### Add a student

```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Ada Lovelace"}'
```

### Update a student

The `index` is the student's zero-based position in the list.

```bash
curl -X PATCH http://localhost:3000/students/0 \
  -H "Content-Type: application/json" \
  -d '{"name":"Grace Hopper"}'
```

### Delete a student

```bash
curl -X DELETE http://localhost:3000/students/0
```

To delete all students:

```bash
curl -X DELETE http://localhost:3000/students
```

## Notes

Student data is stored in memory and resets whenever the server restarts. This project is intended as a small REST API example, not a production data store.

## License

ISC
