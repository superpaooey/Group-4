import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';

dotenv.config();

const databaseAvailable = Boolean(
  process.env.DATABASE_URL ||
    (process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER && process.env.DB_PASSWORD)
);
const maybeTest = databaseAvailable ? test : test.skip;

const createDbPath = async () => {
  const dir = path.join(process.cwd(), 'data');
  await fs.mkdir(dir, { recursive: true });

  const dbPath = path.join(dir, `students-${Date.now()}.sqlite`);
  await fs.rm(dbPath, { force: true });

  return dbPath;
};

const runStudentRequest = (dbPath, method, payload) => {
  const script = `
    import app from './src/app.js';
    const server = app.listen(0, async () => {
      const { port } = server.address();
      const response = await fetch('http://127.0.0.1:' + port + '/students', {
        method: ${JSON.stringify(method)},
        headers: { 'Content-Type': 'application/json' },
        body: ${JSON.stringify(JSON.stringify(payload))}
      });
      const text = await response.text();
      console.log(JSON.stringify({ status: response.status, body: text }));
      server.close();
    });
  `;

  return spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/group4', DB_PATH: dbPath },
    encoding: 'utf8',
  });
};

maybeTest('student data persists across app restarts', async () => {
  const dbPath = await createDbPath();

  const createResult = runStudentRequest(dbPath, 'POST', { name: 'student2' });
  assert.equal(createResult.status, 0, createResult.stderr || createResult.stdout);

  const listResult = runStudentRequest(dbPath, 'GET');
  assert.equal(listResult.status, 0, listResult.stderr || listResult.stdout);

  const createPayload = JSON.parse(createResult.stdout.trim());
  const listPayload = JSON.parse(listResult.stdout.trim());

  assert.equal(createPayload.status, 201);
  assert.equal(listPayload.status, 200);
  assert.ok(JSON.parse(listPayload.body).some((student) => student.name === 'student2'));
});
