# 🏏 Cricket Social Platform API

A Node.js + Express + MongoDB backend that allows players, academies, and scouts to connect, share posts, follow each other, chat, and get real-time notifications.

This project progressed across multiple days — authentication, role-aware profiles, feeds, media uploads, sockets, chat, and now **Day 7 updates: message read endpoint, improved pagination, and admin flow fixes.**

---

## 🚀 Features

- **User Authentication:** Signup & login with JWT (access + refresh tokens)  
- **Admin Panel:** Admin signup/login + moderation endpoints  
- **Role-based Profiles:** Player / Academy / Scout  
- **Social Feed:** Create posts, like/unlike, comment, personalized feed  
- **Media Uploads:** Cloudinary + multer (local fallback)  
- **Follow System:** Follow/unfollow + follower lists  
- **Real-time:** Notifications & chat via Socket.IO  
- **Private Messaging:** Store + real-time message delivery  
- **Search API:** Filter by role, age, location, name (in-memory filters)  
- **Player Stats (Mock):** Basic match/runs/wickets fields  
- **Applications / Invites:** Apply & accept/reject flow  
- **Moderation / Reports:** Submit & admin review  
- **Role Dashboards:** For academies/scouts  
- **Day 7:** Message read endpoint + conversation pagination fixes  

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
Create a `.env` file at the root:
```env
MONGO_URI=mongodb://127.0.0.1:27017/project1db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
BASE_URL=http://localhost:3000

# Optional Cloudinary (if used)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Start MongoDB
```bash
mongod --dbpath ~/data/db
# or
sudo systemctl start mongod
```

### 5. Start Server
```bash
npm start
# or during development
npm run dev
```

**Runs at:** `http://localhost:3000`  
**Socket.IO:** same host (`/socket.io`)

---

## 🧾 Admin Setup (Safe Way)

### 1. Remove incorrect admin if any:
```bash
mongosh
use project1db
db.users.deleteOne({ email: "admin@test.com" })
exit
```

### 2. Create secure admin (auto-hashed):
```bash
curl -X POST http://localhost:3000/api/auth/admin/signup   -H "Content-Type: application/json"   -d '{"name":"Admin","email":"admin@test.com","password":"123456"}'
```

After that you can log in via `/api/auth/admin/login`.

---

## 🧪 API Endpoints & Examples

### Authentication

#### Regular Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup   -H "Content-Type: application/json"   -d '{"name":"Ashu","email":"ashu@test.com","password":"123456","role":"player","age":21,"playingRole":"batsman"}'
```

#### Admin Signup
```bash
curl -X POST http://localhost:3000/api/auth/admin/signup   -H "Content-Type: application/json"   -d '{"name":"Admin","email":"admin@test.com","password":"123456"}'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login   -H "Content-Type: application/json"   -d '{"email":"ashu@test.com","password":"123456"}'
```

---

### Search API
```bash
curl -X GET "http://localhost:3000/api/search?role=player&name=ashu&ageMin=18&ageMax=25&location=pune&page=1&limit=10"   -H "Authorization: Bearer <access_token>"
```

---

### Player Stats
```bash
curl -X GET http://localhost:3000/api/users/<user_id>/stats   -H "Authorization: Bearer <access_token>"
```

---

### Applications / Invites

#### Create
```bash
curl -X POST http://localhost:3000/api/applications   -H "Authorization: Bearer <access_token>"   -H "Content-Type: application/json"   -d '{"toUserId":"<target_user_id>"}'
```

#### Sent / Received
```bash
curl -X GET http://localhost:3000/api/applications/sent   -H "Authorization: Bearer <access_token>"

curl -X GET http://localhost:3000/api/applications/received   -H "Authorization: Bearer <access_token>"
```

#### Update Status
```bash
curl -X PUT http://localhost:3000/api/applications/<application_id>   -H "Authorization: Bearer <access_token>"   -H "Content-Type: application/json"   -d '{"status":"accepted"}'
```

---

### Reports

#### Report Post
```bash
curl -X POST http://localhost:3000/api/reports   -H "Authorization: Bearer <access_token>"   -H "Content-Type: application/json"   -d '{"postId":"<post_id>","reason":"spam"}'
```

#### List Reports (Admin)
```bash
curl -X GET http://localhost:3000/api/reports   -H "Authorization: Bearer <admin_access_token>"
```

---

### Feed

#### Upload Media
```bash
curl -X POST http://localhost:3000/api/feed/upload   -H "Authorization: Bearer <access_token>"   -F "file=@/path/to/image.jpg"
```

---

### 💬 Messaging

#### Send Message
```bash
curl -X POST http://localhost:3000/api/messages   -H "Authorization: Bearer <access_token>"   -H "Content-Type: application/json"   -d '{"receiverId":"<user_id>","text":"Hello!"}'
```

#### Fetch Conversation (Paginated)
```bash
curl -X GET http://localhost:3000/api/messages/<user_id>?page=1   -H "Authorization: Bearer <access_token>"
```

#### ✅ Mark Message as Read (Day 7)
```bash
curl -X PUT http://localhost:3000/api/messages/read/<message_id>   -H "Authorization: Bearer <access_token>"
```
Response:
```json
{
  "success": true,
  "data": { "_id": "<message_id>", "read": true },
  "message": "Message marked as read"
}
```

---

## 🔌 Socket.IO Quick Test
```js
const socket = io('http://localhost:3000', { auth: { token: '<access_token>' } });
socket.on('connect', () => console.log('connected', socket.id));
socket.on('notification:new', n => console.log('notif', n));
socket.on('message:new', m => console.log('message', m));
socket.on('feed:new', p => console.log('new post', p));
```

---

## 🔒 Notes

- Always use signup APIs for bcrypt-hashed passwords.  
- `isAdmin` flag + `role: "admin"` handled automatically.  
- Pagination: use `page` & `limit`.  
- Cloudinary fallback → `uploads/` folder.  
- Socket authentication: `{ auth: { token } }`.  
- Rate limiter applied to sensitive routes.  

---

## 🧪 Debug Tips

- Test with multiple accounts (player/academy/scout/admin).  
- Save `accessToken` & `refreshToken` from login responses.  
- If socket fails, check you’re sending JWT in `auth`.  
- For local images, confirm `uploads/` is writable.  

---

## 📄 License
MIT © 2025 Cricket Social Platform API