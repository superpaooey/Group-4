import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import app from './src/index.js';

test('GET /students returns the current student list', async () => {
  const server = app.listen(0);
  await once(server, 'listening');

  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/students`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, [{ name: 'student1' }]);

  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});
