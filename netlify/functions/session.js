exports.handler = async function (event) {
  const cookieHeader = event.headers && (event.headers.cookie || event.headers.Cookie || '');
  const cookies = cookieHeader.split(';').map(c => c.trim()).filter(Boolean);
  const unlocked = cookies.some(c => c.startsWith('unlocked='));
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ unlocked })
  };
};