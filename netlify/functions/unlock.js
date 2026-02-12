const bcrypt = require('bcryptjs');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { password } = body;
  if (!password) return { statusCode: 400, body: 'Missing password' };

  const hash = process.env.PROMISE_PASSWORD_HASH;

  if (!hash) {
    console.error('PROMISE_PASSWORD_HASH not set');
    return { statusCode: 500, body: 'Server misconfigured: PROMISE_PASSWORD_HASH not set' };
  }

  const match = await bcrypt.compare(password, hash);
  if (!match) {
    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, message: 'Invalid password' })
    };
  }

  // Set an HttpOnly cookie to mark the session. Cookie is persistent (30 days).
  const cookie = `unlocked=true; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`;

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: true })
  };
};