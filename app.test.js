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

const runRequests = (dbPath, steps, initialResults = {}) => {
  const script = `
    import app from './src/app.js';
    const results = ${JSON.stringify(initialResults)};
    const steps = ${JSON.stringify(steps)};
    const resolvePath = (path) => path.split('.').reduce((value, key) => value?.[key], results);
    const resolveValue = (value) => {
      if (typeof value === 'string') {
        return value.replace(/\\{([^}]+)\\}/g, (_, path) => String(resolvePath(path) ?? ''));
      }
      if (Array.isArray(value)) return value.map(resolveValue);
      if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveValue(item)]));
      }
      return value;
    };

    const server = app.listen(0, async () => {
      const { port } = server.address();
      try {
        for (const step of steps) {
          const headers = { 'Content-Type': 'application/json' };
          if (step.tokenFrom) {
            headers.Authorization = 'Bearer ' + resolvePath(step.tokenFrom);
          }

          const payload = resolveValue(step.body);
          const response = await fetch('http://127.0.0.1:' + port + resolveValue(step.route), {
            method: step.method,
            headers,
            body: payload === undefined ? undefined : JSON.stringify(payload),
          });

          const text = await response.text();
          let body = text;
          try { body = JSON.parse(text); } catch {}
          results[step.key] = { status: response.status, body };
        }

        console.log(JSON.stringify(results));
      } catch (error) {
        console.error(error);
        process.exitCode = 1;
      } finally {
        server.close();
      }
    });
  `;

  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/group4',
      JWT_SECRET: 'test-only-secret',
      DB_PATH: dbPath,
      USE_SQLITE: 'true',
    },
    encoding: 'utf8',
    timeout: 30000,
  });

  if (result.error) {
    result.stderr += `\n${result.error.message}`;
  }

  return result;
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
  const firstSession = runRequests(dbPath, [
    { key: 'invalidRegister', route: '/auth/register', method: 'POST', body: { name: 'Student One', email: 'invalid-email', password } },
    { key: 'register', route: '/auth/register', method: 'POST', body: { name: 'Student One', email, password } },
    { key: 'invalidLogin', route: '/auth/login', method: 'POST', body: { email: 42, password: 42 } },
    { key: 'login', route: '/auth/login', method: 'POST', body: { email, password } },
    { key: 'unauthenticatedList', route: '/students', method: 'GET' },
    { key: 'refresh', route: '/auth/refresh', method: 'POST', body: { refreshToken: '{login.body.refreshToken}' } },
    { key: 'missingRefresh', route: '/auth/refresh', method: 'POST', body: {} },
    { key: 'invalidCreate', route: '/students', method: 'POST', tokenFrom: 'login.body.token', body: { name: '   ' } },
    { key: 'create', route: '/students', method: 'POST', tokenFrom: 'login.body.token', body: { name: 'student2' } },
    { key: 'update', route: '/students/{create.body.id}', method: 'PATCH', tokenFrom: 'login.body.token', body: { name: 'updated student' } },
    { key: 'invalidUpdate', route: '/students/{create.body.id}', method: 'PATCH', tokenFrom: 'login.body.token', body: { name: '  ' } },
    { key: 'list', route: '/students', method: 'GET', tokenFrom: 'login.body.token' },
  ]);
  assert.equal(firstSession.status, 0, firstSession.stderr || firstSession.stdout);

  const firstResults = parseResponseJson(firstSession.stdout);
  assert.equal(firstResults.invalidRegister.status, 400);
  assert.equal(firstResults.register.status, 201);
  assert.equal(firstResults.invalidLogin.status, 400);
  assert.equal(firstResults.login.status, 200);
  assert.equal(firstResults.unauthenticatedList.status, 401);
  assert.equal(firstResults.refresh.status, 200);
  assert.equal(firstResults.missingRefresh.status, 400);
  assert.equal(firstResults.invalidCreate.status, 400);
  assert.equal(firstResults.create.status, 201);
  assert.ok(Number.isInteger(firstResults.create.body.id));
  assert.equal(firstResults.update.status, 200);
  assert.equal(firstResults.invalidUpdate.status, 400);
  assert.ok(firstResults.list.body.some((student) => student.id === firstResults.create.body.id && student.name === 'updated student'));

  const secondSession = runRequests(dbPath, [
    { key: 'getAfterRestart', route: '/students/{create.body.id}', method: 'GET', tokenFrom: 'login.body.token' },
    { key: 'delete', route: '/students/{create.body.id}', method: 'DELETE', tokenFrom: 'login.body.token' },
    { key: 'missingStudent', route: '/students/{create.body.id}', method: 'GET', tokenFrom: 'login.body.token' },
    { key: 'logout', route: '/auth/logout', method: 'POST', tokenFrom: 'login.body.token', body: { refreshToken: '{login.body.refreshToken}' } },
    { key: 'revokedToken', route: '/students', method: 'GET', tokenFrom: 'login.body.token' },
    { key: 'revokedRefresh', route: '/auth/refresh', method: 'POST', body: { refreshToken: '{login.body.refreshToken}' } },
  ], firstResults);
  assert.equal(secondSession.status, 0, secondSession.stderr || secondSession.stdout);

  const secondResults = parseResponseJson(secondSession.stdout);
  assert.equal(secondResults.getAfterRestart.status, 200);
  assert.equal(secondResults.delete.status, 200);
  assert.equal(secondResults.missingStudent.status, 404);
  assert.equal(secondResults.logout.status, 200);
  assert.equal(secondResults.revokedToken.status, 401);
  assert.equal(secondResults.revokedRefresh.status, 401);
});
