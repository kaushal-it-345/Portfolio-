/**
 * Practical 7: Automated Verification Script
 * Tests the entire Authentication and Middleware Pipeline:
 * 1. Health check
 * 2. User Registration input validation (missing fields, invalid email, password length)
 * 3. User Registration (bcrypt hashing, 201 response)
 * 4. Duplicate user registration rejection (400)
 * 5. User Login with incorrect credentials (401)
 * 6. User Login with correct credentials (200 + JWT token)
 * 7. Protected route rejection without token (401)
 * 8. Protected route rejection with malformed/tampered token (401)
 * 9. Supplementary /me endpoint with token (200 + user profile)
 * 10. Task validation middleware (reject missing title before DB) (400)
 * 11. Task validation middleware (reject invalid priority) (400)
 * 12. Create Task with valid token (201)
 * 13. Get all Tasks with valid token (200)
 * 14. Update Task with valid token (200)
 * 15. Delete Task with valid token (200)
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE_HOST = '127.0.0.1';

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
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
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

let passedCount = 0;
let failedCount = 0;

function assertTest(name, condition, details = '') {
  if (condition) {
    console.log(`  ${colors.green}✔ PASS${colors.reset} - ${name}`);
    passedCount++;
  } else {
    console.log(`  ${colors.red}✖ FAIL${colors.reset} - ${name}`);
    if (details) console.log(`    ${colors.yellow}Details: ${details}${colors.reset}`);
    failedCount++;
  }
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Practical 7: Authentication & Middleware Pipeline ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  Comprehensive Automated Verification Suite        ${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  const uniqueId = Date.now();
  const testUser = {
    email: `student_${uniqueId}@charusat.edu.in`,
    password: 'SecurePassword123!',
    name: 'Charusat Test Student'
  };

  let authToken = null;
  let createdTaskId = null;

  // 1. Health check
  try {
    console.log(`${colors.bold}[1] Testing Server Health Check...${colors.reset}`);
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/health',
      method: 'GET'
    });
    assertTest('GET /health returns 200 OK', res.statusCode === 200);
  } catch (err) {
    console.error(`Cannot connect to server on port ${PORT}. Is it running? (${err.message})`);
    process.exit(1);
  }

  // 2. Validation Middleware: Register with malformed inputs
  console.log(`\n${colors.bold}[2] Testing Input Validation Middleware on Registration...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: '', password: '' });
    assertTest('Rejects empty email/password with 400 Bad Request', res.statusCode === 400);
  }

  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'invalid-email-format', password: 'secretpassword' });
    assertTest('Rejects malformed email format with 400 Bad Request', res.statusCode === 400);
  }

  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'valid@charusat.edu.in', password: '123' });
    assertTest('Rejects short password (< 6 chars) with 400 Bad Request', res.statusCode === 400);
  }

  // 3. User Registration (bcrypt hashing + 201 Created)
  console.log(`\n${colors.bold}[3] Testing User Registration (POST /register)...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, testUser);

    assertTest('POST /register returns 201 Created', res.statusCode === 201);
    assertTest('Response does not leak password hash', res.data?.data?.password === undefined);
    assertTest('Response returns created user ID and email', res.data?.data?.email === testUser.email.toLowerCase());
  }

  // 4. Duplicate Registration
  console.log(`\n${colors.bold}[4] Testing Duplicate User Registration Rejection...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, testUser);
    assertTest('Duplicate registration returns 400 Bad Request', res.statusCode === 400);
  }

  // 5. User Login with incorrect password
  console.log(`\n${colors.bold}[5] Testing Login with Invalid Password...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: testUser.email, password: 'WrongPassword999!' });
    assertTest('Invalid password returns 401 Unauthorized', res.statusCode === 401);
  }

  // 6. User Login with correct credentials (JWT Generation)
  console.log(`\n${colors.bold}[6] Testing User Login & JWT Generation (POST /login)...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: testUser.email, password: testUser.password });

    assertTest('POST /login returns 200 OK', res.statusCode === 200);
    assertTest('Response contains valid JWT token string', typeof res.data?.token === 'string' && res.data.token.split('.').length === 3);
    authToken = res.data?.token;
  }

  // 7. Auth Middleware: Access protected routes without token
  console.log(`\n${colors.bold}[7] Testing Auth Middleware Protection (No Token)...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/tasks',
      method: 'GET'
    });
    assertTest('GET /tasks without Authorization header returns 401 Unauthorized', res.statusCode === 401);
  }

  // 8. Auth Middleware: Access protected routes with malformed/invalid token
  console.log(`\n${colors.bold}[8] Testing Auth Middleware Protection (Tampered Token)...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/tasks',
      method: 'GET',
      headers: { 'Authorization': 'Bearer this.is.an.invalid.token' }
    });
    assertTest('GET /tasks with invalid token returns 401 Unauthorized (does not crash)', res.statusCode === 401);
  }

  // 9. Supplementary Problem: GET /me with valid token
  console.log(`\n${colors.bold}[9] Testing /me Endpoint with JWT Decoded User Details...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    assertTest('GET /me returns 200 OK', res.statusCode === 200);
    assertTest('GET /me returns current user email matching login', res.data?.data?.email === testUser.email.toLowerCase());
    assertTest('GET /me never exposes password field', res.data?.data?.password === undefined);
  }

  // 10. Validation Middleware: Reject task creation with missing title before DB
  console.log(`\n${colors.bold}[10] Testing Task Validation Middleware (Missing Title)...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, { description: 'Missing title task' });

    assertTest('POST /tasks without title returns 400 Bad Request', res.statusCode === 400);
    assertTest('Error response indicates title is required', JSON.stringify(res.data).includes('Task title is required'));
  }

  // 11. Validation Middleware: Reject task creation with invalid priority enum
  console.log(`\n${colors.bold}[11] Testing Task Validation Middleware (Invalid Priority)...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, { title: 'Valid Title', priority: 'extreme_urgency' });

    assertTest('POST /tasks with invalid priority returns 400 Bad Request', res.statusCode === 400);
  }

  // 12. Create Task with valid token and payload
  console.log(`\n${colors.bold}[12] Testing Task Creation with Token & Valid Payload...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/tasks',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      title: 'Practical 7 Verification Task',
      description: 'Verifying end-to-end JWT auth and middleware pipeline',
      priority: 'high',
      completed: false
    });

    assertTest('POST /tasks with token returns 201 Created', res.statusCode === 201);
    assertTest('Task object returned with generated ID', Boolean(res.data?.data?._id));
    createdTaskId = res.data?.data?._id;
  }

  // 13. Get all tasks with valid token
  console.log(`\n${colors.bold}[13] Testing GET /tasks with Authorization Token...${colors.reset}`);
  {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: '/tasks',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    assertTest('GET /tasks with token returns 200 OK', res.statusCode === 200);
    assertTest('Tasks list returned as array', Array.isArray(res.data?.data));
  }

  // 14. Update task with valid token
  console.log(`\n${colors.bold}[14] Testing PUT /tasks/:id with Authorization Token...${colors.reset}`);
  if (createdTaskId) {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: `/tasks/${createdTaskId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    }, {
      title: 'Practical 7 Verification Task (Updated)',
      completed: true,
      priority: 'medium'
    });

    assertTest('PUT /tasks/:id returns 200 OK', res.statusCode === 200);
    assertTest('Task completed flag updated to true', res.data?.data?.completed === true);
  }

  // 15. Delete task with valid token
  console.log(`\n${colors.bold}[15] Testing DELETE /tasks/:id with Authorization Token...${colors.reset}`);
  if (createdTaskId) {
    const res = await makeRequest({
      hostname: BASE_HOST,
      port: PORT,
      path: `/tasks/${createdTaskId}`,
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    assertTest('DELETE /tasks/:id returns 200 OK', res.statusCode === 200);
  }

  console.log(`\n${colors.bold}${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.bold}Test Results Summary:${colors.reset}`);
  console.log(`  Passed: ${colors.green}${passedCount}${colors.reset}`);
  console.log(`  Failed: ${failedCount === 0 ? colors.green : colors.red}${failedCount}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}====================================================${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
