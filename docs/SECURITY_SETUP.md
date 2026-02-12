Netlify minimal security setup

1) Set the password (required)

- For security, you **must** set `PROMISE_PASSWORD_HASH` in Netlify to the bcrypt hash of your chosen password. The function will reject unlock attempts if this environment variable is not configured.

2) How to create & set the password

Generate a bcrypt hash for your chosen password locally:

```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync(process.argv[1], 10))" 'your-new-password'
```

Copy the printed hash and in your Netlify site dashboard, go to Site settings → Build & deploy → Environment → Add a new variable:
- Key: `PROMISE_PASSWORD_HASH`
- Value: `<the-hash you generated>`

(Alternative: use Netlify CLI: `netlify env:set PROMISE_PASSWORD_HASH "<the-hash>"`.)

3) Deploy site. The unlock endpoint is available at `/.netlify/functions/unlock`.

Notes:
- The function will set an `unlocked` HttpOnly cookie (30 days) on successful unlock. This provides persistence across browser restarts.
- A `/.netlify/functions/logout` endpoint is available to clear the session cookie when you want to sign out.
- For stronger security, rotate the hash and reduce Max-Age.
- Keep `PROMISE_PASSWORD_HASH` secret and don't commit it to the repo.
