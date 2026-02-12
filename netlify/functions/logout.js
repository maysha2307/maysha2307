exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Clear the unlocked cookie by setting Max-Age=0
  const cookie = `unlocked=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': cookie,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: true })
  };
};