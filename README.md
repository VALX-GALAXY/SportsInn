# 🏏 Cricket Social Platform API

A Node.js + Express + MongoDB backend that allows players, academies, and scouts to connect, share posts, follow each other, chat, and get real-time notifications.

This project progressed across multiple days — auth, role-aware profiles, feed, media uploads, sockets, chat, and Day 6 features: search, player stats (mock), applications/invites, feed updates and moderation.

---

## 🚀 Features

- **User Authentication**: Signup & login with JWT access + refresh tokens
- **Admin Panel**: Admin signup/login and admin-only moderation endpoints
- **Role-based Profiles**: Player / Academy / Scout (role-specific fields)
- **Social Feed**: Create posts (media), like/unlike, comment, personalized feed
- **Media Uploads**: Cloudinary (or local uploads fallback) via multer
- **Follow System**: Follow/unfollow + followers/following lists
- **Real-time**: Notifications & messaging via Socket.IO (`notification:new`, `message:new`, `feed:new`)
- **Private Messaging**: Store + realtime delivery of messages
- **Search API**: Filter users by role, age range, location, name (in-memory filters)
- **Player Stats** (mock): Stats field per user (matches, runs, wickets)
- **Applications / Invites**: Apply/invite workflow + accept/reject
- **Moderation / Reports**: Submit reports for posts, admin can list reports
- **Role Dashboards**: Academy & scout focused endpoints

---

## ⚡ Setup Instructions

### 1. Clone Repository

```bash
git clone <repo_url>
cd <project_folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file at the project root with the following:

```env
MONGO_URI=mongodb://127.0.0.1:27017/project1db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
BASE_URL=http://localhost:3000

# Optional Cloudinary (if used):
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Start MongoDB (Local)

```bash
mongod --dbpath ~/data/db

# or via systemctl:
sudo systemctl start mongod
```

### 5. Start Server

```bash
npm start

# or during development
npm run dev
```

**Server runs at**: `http://localhost:3000`  
**Socket.IO**: Same host (`/socket.io`)

---

## 🧪 Admin Setup

**⚠️ Do NOT create admin records manually with plain passwords.**

### Recommended Approach

1. **Remove any incorrectly created admin document** (if exists):

```bash
# in mongosh
use project1db
db.users.deleteOne({ email: "admin@test.com" })
```

2. **Create an admin using the API** (hashing is applied automatically):

```bash
curl -X POST http://localhost:3000/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456"}'
```

This endpoint creates a user with `role: "admin"` and `isAdmin: true`. After that you can login using `/api/auth/login` or `/api/auth/admin/login`.

---

## 🧾 API Endpoints & Examples

Replace placeholders like `<access_token>`, `<user_id>`, `<post_id>`, `<application_id>` with real values from responses.

### Authentication & Admin

#### Signup (Regular Users)

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Ashu",
    "email":"ashu@test.com",
    "password":"123456",
    "role":"player",
    "age":21,
    "playingRole":"batsman"
  }'
```

#### Admin Signup

```bash
curl -X POST http://localhost:3000/api/auth/admin/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"123456"}'
```

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ashu@test.com","password":"123456"}'
```

---

### Search API

Search users with filters (in-memory filtering; paginated):

```bash
curl -X GET "http://localhost:3000/api/search?role=player&name=ashu&ageMin=18&ageMax=25&location=pune&page=1&limit=10" \
  -H "Authorization: Bearer <access_token>"
```

**Query Parameters:**
- `role`, `name` (partial), `location` (partial), `ageMin`, `ageMax`
- Pagination: `page`, `limit`

---

### Player Stats

Get player stats (stored in `user.stats`):

```bash
curl -X GET http://localhost:3000/api/users/<user_id>/stats \
  -H "Authorization: Bearer <access_token>"
```

---

### Applications / Invites

Players can apply; academies/scouts can invite.

#### Create Application / Invite

```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"toUserId":"<target_user_id>"}'
```

#### Get Sent Applications

```bash
curl -X GET http://localhost:3000/api/applications/sent \
  -H "Authorization: Bearer <access_token>"
```

#### Get Received Applications

```bash
curl -X GET http://localhost:3000/api/applications/received \
  -H "Authorization: Bearer <access_token>"
```

#### Update Status (Accept/Reject)

```bash
curl -X PUT http://localhost:3000/api/applications/<application_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"status":"accepted"}'
```

---

### Reports & Moderation

#### Report a Post (Any User)

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"postId":"<post_id>","reason":"spam"}'
```

#### Admin-Only: List All Reports

```bash
curl -X GET http://localhost:3000/api/reports \
  -H "Authorization: Bearer <admin_access_token>"
```

---

### Feed & Real-time

- Post creation emits `feed:new` via Socket.IO to followers/rooms
- Like/comment emits `notification:new` to post author
- Use `/api/feed/upload` (multer) to upload media (Cloudinary or local fallback)

#### Upload File

```bash
curl -X POST http://localhost:3000/api/feed/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/image.jpg"
```

---

### Messaging

#### Send Message

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"<user_id>","text":"Hello!"}'
```

#### Fetch Conversation

```bash
curl -X GET http://localhost:3000/api/messages/<user_id>?page=1 \
  -H "Authorization: Bearer <access_token>"
```

---

## 🔌 Socket.IO - Quick Test

Use this in a browser console or Node REPL (`socket.io-client` required):

```javascript
// Browser / Node example
const socket = io('http://localhost:3000', { 
  auth: { token: '<access_token>' } 
});

socket.on('connect', () => console.log('socket connected', socket.id));
socket.on('notification:new', (n) => console.log('notif', n));
socket.on('message:new', (m) => console.log('message', m));
socket.on('feed:new', (p) => console.log('new post', p));
```

---

## 🔒 Notes & Important Details

- **User Model**: Includes `isAdmin` and `stats` fields. Admin role added to the role enum
- **Passwords**: Stored in `passwordHash` (bcrypt). Use signup endpoints to ensure correct hashing
- **Refresh Tokens**: Stored per user in DB (array in user doc)
- **Search**: Uses in-memory filtering (suitable for small datasets). Move to DB queries when scaling
- **File Uploads**: Go to `uploads/` when Cloudinary not configured. Add `/uploads` to `.gitignore`
- **Rate Limiting**: Applied to sensitive routes (see `middlewares/rateLimiter.js`)
- **Pagination**: Supported on feed/comments/messages via `page` and `limit` query params

---

## 🧪 Testing & Debugging Tips

- Use separate accounts for player/academy/scout/admin while testing role flows
- After signup, save the `accessToken` & `refreshToken` returned by login
- If a socket connection fails, ensure you pass the token in `auth` when connecting: `io(..., { auth: { token } })`
- If you created an admin manually earlier with a plain password: delete that record and recreate via `/api/auth/admin/signup` so password gets hashed

---

## 📄 License

MIT