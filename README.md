# Auth & Feed API (Day 2)

A Node.js + Express backend with role-based authentication, JWT access/refresh tokens, and mock feed endpoints. Users are stored in-memory (no database).

## Setup

```bash
# Install dependencies
npm install

# Start server
node server.js
# or with nodemon for auto-restart
nodemon server.js
```

Server runs at: `http://localhost:3000`

## Endpoints & Curl Examples

1. **Signup**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Ashu","email":"ashu@test.com","password":"123456","role":"player","age":21,"playingRole":"batsman"}'
   ```

2. **Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"ashu@test.com","password":"123456"}'
   ```
   *Response includes `accessToken` and `refreshToken`.*

3. **Refresh Access Token**
   ```bash
   curl -X POST http://localhost:3000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"<your_refresh_token_here>"}'
   ```

4. **Logout**
   ```bash
   curl -X POST http://localhost:3000/api/auth/logout \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"<your_refresh_token_here>"}'
   ```

5. **Update Profile (Role-based fields only)**
   ```bash
   curl -X PUT http://localhost:3000/api/auth/profile \
     -H "Authorization: Bearer <your_access_token>" \
     -H "Content-Type: application/json" \
     -d '{"bio":"Loves cricket","playingRole":"allrounder"}'
   ```

6. **Get Feed**
   ```bash
   curl -X GET http://localhost:3000/api/feed \
     -H "Authorization: Bearer <your_access_token>"
   ```

## Notes

- Access tokens expire in 15 minutes.
- Refresh tokens expire in 7 days (mocked).
- Refresh token is required to get a new access token.
- Data resets when server restarts (in-memory store).