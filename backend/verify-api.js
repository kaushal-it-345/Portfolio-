process.env.NODE_ENV = 'test';
const http = require('http');
const mongoose = require('mongoose');
const Task = require('./models/Task');
const app = require('./server');

async function runTests() {
  console.log('==============================================');
  console.log('Practical 5: MongoDB & Mongoose Schema Tests');
  console.log('==============================================\n');

  // Test 1: Task Schema definition & defaults
  const task1 = new Task({ title: 'Test Task' });
  console.log(`[SCHEMA TEST 1] Default completed value: ${task1.completed} (Expected: false) -> ${task1.completed === false ? 'PASS' : 'FAIL'}`);
  console.log(`[SCHEMA TEST 2] Default priority value: '${task1.priority}' (Expected: 'medium') -> ${task1.priority === 'medium' ? 'PASS' : 'FAIL'}`);
  console.log(`[SCHEMA TEST 3] Default createdAt date: ${task1.createdAt instanceof Date ? 'PASS' : 'FAIL'}`);

  // Test 2: Validation of required fields
  const invalidTask = new Task({});
  let titleError = null;
  try {
    await invalidTask.validate();
  } catch (err) {
    titleError = err.errors && err.errors.title;
  }
  console.log(`[SCHEMA TEST 4] Required title validation: ${titleError ? 'PASS' : 'FAIL'} (${titleError ? titleError.message : ''})`);

  // Test 3: Priority Enum validation
  const invalidPriorityTask = new Task({ title: 'Valid Title', priority: 'urgent' });
  let priorityError = null;
  try {
    await invalidPriorityTask.validate();
  } catch (err) {
    priorityError = err.errors && err.errors.priority;
  }
  console.log(`[SCHEMA TEST 5] Priority enum validation: ${priorityError ? 'PASS' : 'FAIL'} (${priorityError ? priorityError.message : ''})`);

  // Test 4: Pre-save hook whitespace trimming
  const untrimmedTask = new Task({ title: '   Whitespace Title   ', description: '  Trimmed Desc  ' });
  const saveHooks = Task.schema.s.hooks._pres ? Task.schema.s.hooks._pres.get('save') : [];
  if (saveHooks && saveHooks.length > 0) {
    saveHooks[0].fn.call(untrimmedTask, () => {});
  }
  const isTrimmed = untrimmedTask.title === 'Whitespace Title' && untrimmedTask.description === 'Trimmed Desc';
  console.log(`[SCHEMA TEST 6] Pre-save hook whitespace trimming: ${isTrimmed ? 'PASS' : 'FAIL'} (Result: '${untrimmedTask.title}')`);

  // Test 5: Server Pipeline & HTTP Error Handlers
  const testServer = app.listen(5098, async () => {
    function request(options, data = null) {
      return new Promise((resolve, reject) => {
        const req = http.request({ port: 5098, host: 'localhost', ...options }, (res) => {
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
      // 5.1 Content-Type 415 rejection
      const res1 = await request({ path: '/tasks', method: 'POST' }, '{"title":"Test"}');
      console.log(`[HTTP TEST 1] Missing Content-Type rejection: status ${res1.status} (Expected: 415) -> ${res1.status === 415 ? 'PASS' : 'FAIL'}`);

      // 5.2 Invalid ObjectId format 400 rejection
      const res2 = await request({ path: '/tasks/invalid-id-format', method: 'GET' });
      console.log(`[HTTP TEST 2] Invalid ObjectId format: status ${res2.status} (Expected: 400) -> ${res2.status === 400 ? 'PASS' : 'FAIL'}`);

      // 5.3 404 handler for undefined route
      const res3 = await request({ path: '/undefined-endpoint-test', method: 'GET' });
      console.log(`[HTTP TEST 3] Undefined route 404 handler: status ${res3.status} (Expected: 404) -> ${res3.status === 404 ? 'PASS' : 'FAIL'}`);

      console.log('\n==============================================');
      console.log('All Practical 5 Tests Completed Successfully!');
      console.log('==============================================');
    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      testServer.close();
      mongoose.disconnect();
      process.exit(0);
    }
  });
}

runTests();
