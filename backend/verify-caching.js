/**
 * Practical 9: In-Memory Caching Verification & Benchmark Script
 * 
 * Tests:
 * 1. Health check & authentication setup
 * 2. Cache Miss on first GET /tasks (Records Uncached Response Time #1)
 * 3. Cache Hit on subsequent GET /tasks (Records Cached Response Time #1)
 * 4. Repeated Cached GET /tasks (Readings #2 and #3)
 * 5. Supplementary Problem 1: Single-task caching (GET /tasks/:id) - HIT & MISS
 * 6. Cache Invalidation on POST /tasks (Create)
 * 7. Cache Invalidation on PUT /tasks/:id (Update)
 * 8. Cache Invalidation on DELETE /tasks/:id (Delete)
 * 9. Supplementary Problem 2: Debug Cache Stats endpoint (GET /cache/stats)
 * 10. Multi-sample Latency Benchmark (Cached vs Uncached Comparison Table)
 */

process.env.NODE_ENV = 'test';
const http = require('http');
const app = require('./server');

const TEST_PORT = process.env.TEST_PORT || 5002;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const durationMs = Number(endTime - startTime) / 1e6;
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          durationMs
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      const dataString = typeof postData === 'string' ? postData : JSON.stringify(postData);
      req.write(dataString);
    }
    req.end();
  });
}

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}PASS${colors.reset} ${testName}`);
    if (details) console.log(`       ${colors.cyan}${details}${colors.reset}`);
  } else {
    console.log(`  ${colors.red}FAIL${colors.reset} ${testName}`);
    if (details) console.log(`       ${colors.red}Details: ${details}${colors.reset}`);
  }
}

async function runVerification() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Practical 9: In-Memory Caching (node-cache) Tests ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`Test server listening on port ${TEST_PORT}\n`);

  try {
    // 1. Health Check
    console.log(`${colors.bold}1. Health & Server Status${colors.reset}`);
    const healthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/health',
      method: 'GET'
    });
    assert(healthRes.statusCode === 200 && healthRes.data.status === 'healthy', 'Health check returns 200 OK');

    // 2. Obtain Auth Token for Protected Task Routes
    console.log(`\n${colors.bold}2. Authentication Setup${colors.reset}`);
    const loginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'demo@charusat.edu.in',
      password: 'password123'
    });

    const authToken = loginRes.data.token;
    assert(Boolean(authToken), 'Demo student login successful, JWT token acquired');

    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    };

    // 3. Reset Cache before test
    console.log(`\n${colors.bold}3. Cache Initialization & Reset${colors.reset}`);
    const clearRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/cache/clear',
      method: 'POST'
    });
    assert(clearRes.statusCode === 200, 'POST /cache/clear resets cache storage and counters');

    // 4. Test Cache Miss on Initial GET /tasks
    console.log(`\n${colors.bold}4. Route-level Caching (GET /tasks)${colors.reset}`);
    const missRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/tasks',
      method: 'GET',
      headers: authHeaders
    });
    assert(missRes.statusCode === 200 && missRes.headers['x-cache'] === 'MISS',
      'First GET /tasks yields X-Cache: MISS (uncached database read)',
      `Response time: ${missRes.durationMs.toFixed(2)} ms`
    );

    // 5. Test Cache Hit on Immediate Subsequent GET /tasks
    const hitRes1 = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/tasks',
      method: 'GET',
      headers: authHeaders
    });
    assert(hitRes1.statusCode === 200 && hitRes1.headers['x-cache'] === 'HIT',
      'Second GET /tasks yields X-Cache: HIT (served from node-cache memory)',
      `Response time: ${hitRes1.durationMs.toFixed(2)} ms`
    );

    const hitRes2 = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/tasks',
      method: 'GET',
      headers: authHeaders
    });
    assert(hitRes2.headers['x-cache'] === 'HIT',
      'Third GET /tasks yields X-Cache: HIT',
      `Response time: ${hitRes2.durationMs.toFixed(2)} ms`
    );

    // 6. Supplementary Problem 1: Single-Task Caching (GET /tasks/:id)
    console.log(`\n${colors.bold}5. Supplementary Problem 1: Single-Task Caching (GET /tasks/:id)${colors.reset}`);
    const sampleTaskId = hitRes1.data.data[0]._id;

    const singleMiss = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/tasks/${sampleTaskId}`,
      method: 'GET',
      headers: authHeaders
    });
    assert(singleMiss.statusCode === 200 && singleMiss.headers['x-cache'] === 'MISS',
      `First GET /tasks/${sampleTaskId} yields X-Cache: MISS`,
      `Response time: ${singleMiss.durationMs.toFixed(2)} ms`
    );

    const singleHit = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/tasks/${sampleTaskId}`,
      method: 'GET',
      headers: authHeaders
    });
    assert(singleHit.statusCode === 200 && singleHit.headers['x-cache'] === 'HIT',
      `Second GET /tasks/${sampleTaskId} yields X-Cache: HIT`,
      `Response time: ${singleHit.durationMs.toFixed(2)} ms`
    );

    // 7. Cache Invalidation on POST /tasks
    console.log(`\n${colors.bold}6. Cache Invalidation on Write Operations${colors.reset}`);
    const createRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/tasks',
      method: 'POST',
      headers: authHeaders
    }, {
      title: 'Practical 9 Cache Verification Task',
      description: 'Ensures POST operation invalidates stale collection cache',
      priority: 'high'
    });
    const createdId = createRes.data.data._id;
    assert(createRes.statusCode === 201, 'POST /tasks created new task');

    // Check that GET /tasks is now a MISS because cache was invalidated
    const postInvalidateRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/tasks',
      method: 'GET',
      headers: authHeaders
    });
    assert(postInvalidateRes.headers['x-cache'] === 'MISS',
      'GET /tasks yields X-Cache: MISS after POST (all_tasks invalidated successfully)'
    );

    // Re-prime single task cache for created task
    await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/tasks/${createdId}`,
      method: 'GET',
      headers: authHeaders
    });

    // 8. Cache Invalidation on PUT /tasks/:id
    const updateRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/tasks/${createdId}`,
      method: 'PUT',
      headers: authHeaders
    }, {
      title: 'Practical 9 Cache Verification Task (Updated)',
      completed: true
    });
    assert(updateRes.statusCode === 200, 'PUT /tasks/:id updated task');

    const putInvalidateSingle = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/tasks/${createdId}`,
      method: 'GET',
      headers: authHeaders
    });
    assert(putInvalidateSingle.headers['x-cache'] === 'MISS',
      'GET /tasks/:id yields X-Cache: MISS after PUT (task key invalidated)'
    );

    // 9. Cache Invalidation on DELETE /tasks/:id
    const deleteRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: `/tasks/${createdId}`,
      method: 'DELETE',
      headers: authHeaders
    });
    assert(deleteRes.statusCode === 200, 'DELETE /tasks/:id deleted task');

    // 10. Supplementary Problem 2: Debug Endpoint & Cache Stats
    console.log(`\n${colors.bold}7. Supplementary Problem 2: Cache Hit/Miss Metrics Endpoint${colors.reset}`);
    const statsRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/cache/stats',
      method: 'GET'
    });
    const stats = statsRes.data.data;
    assert(statsRes.statusCode === 200 && stats.hits > 0 && stats.misses > 0,
      'GET /cache/stats exposes hits, misses, hitRatio, and keys',
      `Hits: ${stats.hits}, Misses: ${stats.misses}, Hit Ratio: ${stats.hitRatio}`
    );

    // 11. Empirical Response Time Benchmark (3 Uncached vs 3 Cached Readings)
    console.log(`\n${colors.bold}8. Empirical Benchmark: 3 Uncached vs 3 Cached Sample Readings${colors.reset}`);
    
    // Clear cache to start fresh benchmark
    await makeRequest({ hostname: '127.0.0.1', port: TEST_PORT, path: '/cache/clear', method: 'POST' });

    const uncachedReadings = [];
    const cachedReadings = [];

    // Measure 3 uncached requests (using ?no_cache=true to bypass cache)
    for (let i = 1; i <= 3; i++) {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/tasks?no_cache=true',
        method: 'GET',
        headers: authHeaders
      });
      uncachedReadings.push(res.durationMs);
    }

    // Warm the cache once
    await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/tasks',
      method: 'GET',
      headers: authHeaders
    });

    // Measure 3 cached requests
    for (let i = 1; i <= 3; i++) {
      const res = await makeRequest({
        hostname: '127.0.0.1',
        port: TEST_PORT,
        path: '/tasks',
        method: 'GET',
        headers: authHeaders
      });
      cachedReadings.push(res.durationMs);
    }

    const avgUncached = uncachedReadings.reduce((a, b) => a + b, 0) / uncachedReadings.length;
    const avgCached = cachedReadings.reduce((a, b) => a + b, 0) / cachedReadings.length;
    const latencyReduction = ((avgUncached - avgCached) / avgUncached) * 100;

    console.log('\n┌────────────────────────┬─────────────────────┬─────────────────────┐');
    console.log('│ Sample Reading         │ Uncached Latency    │ Cached Latency      │');
    console.log('├────────────────────────┼─────────────────────┼─────────────────────┤');
    for (let i = 0; i < 3; i++) {
      console.log(`│ Sample #${i + 1}             │ ${uncachedReadings[i].toFixed(2).padStart(15)} ms │ ${cachedReadings[i].toFixed(2).padStart(15)} ms │`);
    }
    console.log('├────────────────────────┼─────────────────────┼─────────────────────┤');
    console.log(`│ ${colors.bold}Average Latency        │ ${avgUncached.toFixed(2).padStart(15)} ms │ ${avgCached.toFixed(2).padStart(15)} ms${colors.reset} │`);
    console.log(`│ ${colors.bold}Speedup / Reduction    │ ${colors.green}${latencyReduction.toFixed(1).padStart(15)}% faster response${colors.reset} │`);
    console.log('└────────────────────────┴─────────────────────┴─────────────────────┘\n');

    assert(avgCached < avgUncached, 'In-memory cached requests are measurably faster than uncached reads');

  } catch (err) {
    console.error(`${colors.red}Test suite error:${colors.reset}`, err);
    totalTests++;
  } finally {
    server.close();
  }

  console.log(`\n${colors.bold}Test Summary:${colors.reset} ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)\n`);

  if (passedTests === totalTests) {
    console.log(`${colors.green}${colors.bold}All Practical 9 tests and benchmarks passed successfully!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}Some tests failed. Please review the output above.${colors.reset}\n`);
    process.exit(1);
  }
}

runVerification();
