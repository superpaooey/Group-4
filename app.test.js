import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';

dotenv.config();

const createDbPath = async () => {
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });

  const dbPath = path.join(dir, `students-${Date.now()}.sqlite`);
  await fs.rm(dbPath, { force: true });

  return dbPath;
};

const runRequest = (dbPath, route, method, payload, token) => {
  const script = `
    import app from './src/app.js';
    const server = app.listen(0, async () => {
      const { port } = server.address();
      const headers = { 'Content-Type': 'application/json' };
      if (${JSON.stringify(Boolean(token))}) {
        headers.Authorization = 'Bearer ' + ${JSON.stringify(token)};
      }

      const response = await fetch('http://127.0.0.1:' + port + ${JSON.stringify(route)}, {
        method: ${JSON.stringify(method)},
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const text = await response.text();
      console.log(JSON.stringify({ status: response.status, body: text }));
      server.close();
    });
  `;

  return spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/group4',
      DB_PATH: dbPath,
      USE_SQLITE: 'true',
    },
    encoding: 'utf8',
  });
};

const parseResponseJson = (stdout) => {
  const lines = stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const jsonLine = [...lines].reverse().find((line) => line.startsWith('{'));

  if (!jsonLine) {
    throw new Error(`No JSON response found in child process output: ${stdout}`);
  }

  return JSON.parse(jsonLine);
};

test('student data persists across app restarts', async () => {
  const dbPath = await createDbPath();
  const email = `student-${Date.now()}@example.com`;
  const password = 'Password123';

  const registerResult = runRequest(dbPath, '/auth/register', 'POST', { name: 'Student One', email, password });
  assert.equal(registerResult.status, 0, registerResult.stderr || registerResult.stdout);

  const registerPayload = parseResponseJson(registerResult.stdout);
  assert.equal(registerPayload.status, 201);

  const loginResult = runRequest(dbPath, '/auth/login', 'POST', { email, password });
  assert.equal(loginResult.status, 0, loginResult.stderr || loginResult.stdout);

  const loginPayload = parseResponseJson(loginResult.stdout);
  assert.equal(loginPayload.status, 200, loginResult.stdout);
  assert.ok(loginPayload.body, 'Login response should include a body');

  const loginBody = JSON.parse(loginPayload.body);
  assert.ok(loginBody.token, 'Login response should include an access token');
  assert.ok(loginBody.refreshToken, 'Login response should include a refresh token');

  const createResult = runRequest(dbPath, '/students', 'POST', { name: 'student2' }, loginBody.token);
  assert.equal(createResult.status, 0, createResult.stderr || createResult.stdout);

  const createPayload = parseResponseJson(createResult.stdout);
  assert.equal(createPayload.status, 201, createResult.stdout);

  const restartResult = runRequest(dbPath, '/students', 'GET', undefined, loginBody.token);
  assert.equal(restartResult.status, 0, restartResult.stderr || restartResult.stdout);

  const restartPayload = parseResponseJson(restartResult.stdout);
  assert.equal(restartPayload.status, 200, restartResult.stdout);

  const students = JSON.parse(restartPayload.body);
  assert.ok(students.some((student) => student.name === 'student2'));
});
