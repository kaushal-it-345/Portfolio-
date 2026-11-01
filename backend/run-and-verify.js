const { spawn } = require('child_process');
const path = require('path');

console.log('Starting backend server for test verification...');

const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  env: { ...process.env, PORT: '5002', JWT_SECRET: 'test_jwt_secret_for_verification_pipeline_charusat' }
});

let started = false;

server.stdout.on('data', (d) => {
  const text = d.toString();
  process.stdout.write('[server] ' + text);
  if (!started && text.includes('Task Management API Server running on port')) {
    started = true;
    console.log('\nServer is up! Running test suite...\n');

    const tester = spawn('node', ['verify-auth-pipeline.js'], {
      cwd: __dirname,
      env: { ...process.env, PORT: '5002' },
      stdio: 'inherit'
    });

    tester.on('close', (code) => {
      console.log(`\nTests finished with exit code: ${code}. Stopping server...`);
      server.kill();
      process.exit(code);
    });
  }
});

server.stderr.on('data', (d) => {
  process.stderr.write('[server-err] ' + d.toString());
});

// Fallback timeout in case output didn't match
setTimeout(() => {
  if (!started) {
    console.error('Timeout waiting for server to start.');
    server.kill();
    process.exit(1);
  }
}, 15000);
