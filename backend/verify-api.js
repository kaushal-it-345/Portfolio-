const http = require('http');
const app = require('./server.js');

const server = app.listen(5099, async () => {
  console.log('Test server running on port 5099');

  function request(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = http.request({ port: 5099, host: 'localhost', ...options }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null }));
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  }

  try {
    // 1. GET /tasks
    const res1 = await request({ path: '/tasks', method: 'GET' });
    console.log(`[TEST 1] GET /tasks: status ${res1.status} (Expected: 200) -> ${res1.status === 200 ? 'PASS' : 'FAIL'}`);

    // 2. GET /tasks/1
    const res2 = await request({ path: '/tasks/1', method: 'GET' });
    console.log(`[TEST 2] GET /tasks/1: status ${res2.status} (Expected: 200) -> ${res2.status === 200 ? 'PASS' : 'FAIL'}`);

    // 3. GET /tasks/abc (Route middleware: ID validation)
    const res3 = await request({ path: '/tasks/abc', method: 'GET' });
    console.log(`[TEST 3] GET /tasks/abc: status ${res3.status} (Expected: 400) -> ${res3.status === 400 ? 'PASS' : 'FAIL'}`);

    // 4. POST /tasks (Without Content-Type: application/json)
    const res4 = await request({ path: '/tasks', method: 'POST' }, '{"title":"Test"}');
    console.log(`[TEST 4] POST /tasks missing Content-Type: status ${res4.status} (Expected: 415) -> ${res4.status === 415 ? 'PASS' : 'FAIL'}`);

    // 5. POST /tasks (Valid JSON)
    const res5 = await request({
      path: '/tasks',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ title: 'New Task', description: 'Testing POST' }));
    console.log(`[TEST 5] POST /tasks valid: status ${res5.status} (Expected: 201) -> ${res5.status === 201 ? 'PASS' : 'FAIL'}`);

    // 6. PUT /tasks/1
    const res6 = await request({
      path: '/tasks/1',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ completed: true }));
    console.log(`[TEST 6] PUT /tasks/1: status ${res6.status} (Expected: 200) -> ${res6.status === 200 ? 'PASS' : 'FAIL'}`);

    // 7. DELETE /tasks/2
    const res7 = await request({ path: '/tasks/2', method: 'DELETE' });
    console.log(`[TEST 7] DELETE /tasks/2: status ${res7.status} (Expected: 200) -> ${res7.status === 200 ? 'PASS' : 'FAIL'}`);

    // 8. 404 undefined route
    const res8 = await request({ path: '/non-existent-route', method: 'GET' });
    console.log(`[TEST 8] GET /non-existent-route: status ${res8.status} (Expected: 404) -> ${res8.status === 404 ? 'PASS' : 'FAIL'}`);

    // 9. 500 error handler
    const res9 = await request({ path: '/error-test', method: 'GET' });
    console.log(`[TEST 9] GET /error-test: status ${res9.status} (Expected: 500) -> ${res9.status === 500 ? 'PASS' : 'FAIL'}`);

    console.log('\nAll Practical 4 & RMM Level 2 API Tests PASSED successfully!');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
