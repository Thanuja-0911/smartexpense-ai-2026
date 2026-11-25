const http = require('http');
const { app } = require('./server');

const runTests = async () => {
  console.log('🧪 Starting SmartExpense-AI Complete Authentication Test Suite...\n');

  // Start temporary test server
  const testPort = 5099;
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(testPort, resolve));

  const baseUrl = `http://127.0.0.1:${testPort}/api/auth`;

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  const request = async (endpoint, method = 'GET', body = null, token = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data, headers: res.headers };
  };

  try {
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const newPassword = 'NewPassword456!';
    let authToken = '';
    let resetToken = '';

    // Test 1: Registration with valid details
    console.log('--- Test Group 1: Registration ---');
    const regRes = await request('/register', 'POST', {
      name: 'Thanuja Test',
      email: testEmail,
      password: testPassword,
    });
    assert(regRes.status === 201, 'Registration returns 201 Created');
    assert(regRes.data.success === true, 'Registration returns success: true');
    assert(!!regRes.data.data.token, 'Registration returns JWT auth token');
    assert(regRes.data.data.email === testEmail.toLowerCase(), 'Registration returns correct email');
    assert(!regRes.data.data.password, 'Registration does NOT expose password');

    // Test 2: Prevent Duplicate Email Registration
    const dupRes = await request('/register', 'POST', {
      name: 'Duplicate User',
      email: testEmail,
      password: 'AnotherPassword123',
    });
    assert(dupRes.status === 400, 'Duplicate email registration is rejected with 400 Bad Request');
    assert(dupRes.data.success === false, 'Duplicate registration returns success: false');

    // Test 3: Validation - Short Password
    const shortPassRes = await request('/register', 'POST', {
      name: 'Short Pass',
      email: 'shortpass@example.com',
      password: '123',
    });
    assert(shortPassRes.status === 400, 'Short password (< 6 chars) is rejected with 400');

    // Test 4: Validation - Invalid Email
    const invalidEmailRes = await request('/register', 'POST', {
      name: 'Bad Email',
      email: 'not-an-email',
      password: testPassword,
    });
    assert(invalidEmailRes.status === 400, 'Invalid email format is rejected with 400');

    // Test Group 2: Login
    console.log('\n--- Test Group 2: Login & JWT ---');
    const loginRes = await request('/login', 'POST', {
      email: testEmail,
      password: testPassword,
      rememberMe: true,
    });
    assert(loginRes.status === 200, 'Login with correct credentials returns 200 OK');
    assert(loginRes.data.success === true, 'Login returns success: true');
    assert(!!loginRes.data.data.token, 'Login returns JWT token');
    authToken = loginRes.data.data.token;

    // Test 6: Login with Incorrect Password
    const badPassRes = await request('/login', 'POST', {
      email: testEmail,
      password: 'WrongPassword!',
    });
    assert(badPassRes.status === 401, 'Login with incorrect password returns 401 Unauthorized');

    // Test 7: Login with Non-Existent Email
    const noUserRes = await request('/login', 'POST', {
      email: 'nonexistent_user_9999@example.com',
      password: testPassword,
    });
    assert(noUserRes.status === 401, 'Login with non-existent email returns 401 Unauthorized');

    // Test Group 3: Protected Route (GET /api/auth/me)
    console.log('\n--- Test Group 3: Protected Route & Session Verification ---');
    const meRes = await request('/me', 'GET', null, authToken);
    assert(meRes.status === 200, 'GET /api/auth/me with valid Bearer token returns 200 OK');
    assert(meRes.data.data.email === testEmail.toLowerCase(), 'Profile matches authenticated user');
    assert(!meRes.data.data.password, 'User password is excluded from profile response');

    // Test 9: Protected Route without Token
    const unauthRes = await request('/me', 'GET', null, null);
    assert(unauthRes.status === 401, 'GET /api/auth/me without token returns 401 Unauthorized');

    // Test Group 4: Forgot Password & Single-Use Reset Token
    console.log('\n--- Test Group 4: Forgot Password & Reset Flow ---');
    const forgotRes = await request('/forgot-password', 'POST', {
      email: testEmail,
    });
    assert(forgotRes.status === 200, 'POST /api/auth/forgot-password returns 200 OK');
    assert(forgotRes.data.success === true, 'Forgot password response returns success: true');
    assert(!!forgotRes.data.resetUrl, 'Reset URL generated with secure token');

    // Extract token from resetUrl
    const urlParts = forgotRes.data.resetUrl.split('/');
    resetToken = urlParts[urlParts.length - 1];
    assert(resetToken.length === 64, 'Reset token is secure 32-byte (64 hex characters)');

    // Test 11: Reset Password with Valid Token
    const resetRes = await request('/reset-password', 'POST', {
      token: resetToken,
      newPassword: newPassword,
    });
    assert(resetRes.status === 200, 'POST /api/auth/reset-password returns 200 OK');
    assert(resetRes.data.success === true, 'Reset password returns success: true');

    // Test 12: Invalidation - Reusing the same reset token (Single-Use Token Guarantee)
    const reuseRes = await request('/reset-password', 'POST', {
      token: resetToken,
      newPassword: 'AnotherNewPassword!',
    });
    assert(reuseRes.status === 400, 'Token cannot be reused (single-use token invalidated immediately)');

    // Test 13: Login with Old Password Fails
    const oldLoginRes = await request('/login', 'POST', {
      email: testEmail,
      password: testPassword,
    });
    assert(oldLoginRes.status === 401, 'Login with old password now fails (401)');

    // Test 14: Login with New Password Succeeds
    const newLoginRes = await request('/login', 'POST', {
      email: testEmail,
      password: newPassword,
    });
    assert(newLoginRes.status === 200, 'Login with new password succeeds (200 OK)');
    assert(!!newLoginRes.data.data.token, 'New JWT token generated upon login');

    // Test Group 5: Logout
    console.log('\n--- Test Group 5: Logout ---');
    const logoutRes = await request('/logout', 'POST', null, newLoginRes.data.data.token);
    assert(logoutRes.status === 200, 'POST /api/auth/logout returns 200 OK');
    assert(logoutRes.data.success === true, 'Logout returns success: true');

  } catch (err) {
    console.error('Test suite error:', err);
    failed++;
  } finally {
    await new Promise((resolve) => testServer.close(resolve));
    console.log('\n==========================================');
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('==========================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
