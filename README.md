# 🏏 Cricket Social Platform API

A Node.js + Express + MongoDB project that allows players, academies, and scouts to connect, share posts, follow each other, chat, and get notifications.

## 🚀 Features

- **User Authentication**: Signup & login with JWT & refresh tokens
- **Role-based Profiles**: Player / Academy / Scout
- **Social Feed**: Create, like, and comment on posts
- **Media Uploads**: Integration with Cloudinary/S3
- **Follow System**: Follow/unfollow users with personalized feed
- **Real-time Notifications**: Likes, comments, follows via Socket.IO
- **Private Messaging**: Real-time chat functionality
- **User Search**: Search users by name
- **Role Dashboards**: Specialized dashboards for scouts & academies

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

### 3. Start MongoDB (Local)
```bash
mongod --dbpath ~/data/db
```

### 4. Start Server
```bash
npm start
```

**Server runs at:** `http://localhost:3000`

**Socket.IO runs on:** Same server (`/socket.io`)

---

## 🧪 API Testing with cURL

### 🔹 1. Signup Users

#### Player Signup
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

#### Academy Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Cricket Academy",
    "email":"academy@test.com",
    "password":"123456",
    "role":"academy",
    "location":"Pune",
    "contactInfo":"9876543210"
  }'
```

#### Scout Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Scout",
    "email":"scout@test.com",
    "password":"123456",
    "role":"scout",
    "organization":"XYZ Club",
    "experience":5
  }'
```

### 🔹 2. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ashu@test.com","password":"123456"}'
```

### 🔹 3. Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refresh_token_here>"}'
```

### 🔹 4. Profile APIs

#### Get Profile
```bash
curl -X GET http://localhost:3000/api/profile/<user_id> \
  -H "Authorization: Bearer <access_token>"
```

#### Update Profile
```bash
curl -X PUT http://localhost:3000/api/profile/<user_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"playingRole":"allrounder"}'
```

### 🔹 5. Feed APIs

#### Upload Media (image/video)
```bash
curl -X POST http://localhost:3000/api/feed/upload \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/image.jpg"
```

#### Create Post
```bash
curl -X POST http://localhost:3000/api/feed \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"caption":"Training hard today!","mediaUrl":"http://img.com/pic.jpg","mediaType":"image"}'
```

#### Get Feed
```bash
curl -X GET http://localhost:3000/api/feed \
  -H "Authorization: Bearer <access_token>"
```

#### Like Post
```bash
curl -X POST http://localhost:3000/api/feed/<post_id>/like \
  -H "Authorization: Bearer <access_token>"
```

#### Unlike Post
```bash
curl -X POST http://localhost:3000/api/feed/<post_id>/unlike \
  -H "Authorization: Bearer <access_token>"
```

#### Delete Post
```bash
curl -X DELETE http://localhost:3000/api/feed/<post_id> \
  -H "Authorization: Bearer <access_token>"
```

### 🔹 6. Follow System

#### Follow/Unfollow User
```bash
curl -X POST http://localhost:3000/api/users/<target_user_id>/follow \
  -H "Authorization: Bearer <access_token>"
```

#### Get Followers
```bash
curl -X GET http://localhost:3000/api/users/<user_id>/followers
```

#### Get Following
```bash
curl -X GET http://localhost:3000/api/users/<user_id>/following
```

### 🔹 7. Personalized Feed
```bash
curl -X GET http://localhost:3000/api/feed/personalized \
  -H "Authorization: Bearer <access_token>"
```

### 🔹 8. Comments

#### Add Comment
```bash
curl -X POST http://localhost:3000/api/feed/<post_id>/comment \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Great post! 🔥"}'
```

#### Get Comments (with pagination)
```bash
curl -X GET "http://localhost:3000/api/feed/<post_id>/comments?page=1&limit=5"
```

### 🔹 9. Notifications

#### Get Notifications
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <access_token>"
```

#### Mark Notification as Read
```bash
curl -X PUT http://localhost:3000/api/notifications/<notification_id>/read \
  -H "Authorization: Bearer <access_token>"
```

### 🔹 10. Search Users
```bash
curl -X GET "http://localhost:3000/api/users/search?q=ashu"
```

### 🔹 11. Messaging (Chat)

#### Send Message
```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"<user_id>","text":"Hey, let's connect!"}'
```

#### Fetch Conversation
```bash
curl -X GET http://localhost:3000/api/messages/<user_id> \
  -H "Authorization: Bearer <access_token>"
```

### 🔹 12. Role Dashboards

#### Academy Dashboard
List all players who follow this academy:
```bash
curl -X GET http://localhost:3000/api/dashboard/academy \
  -H "Authorization: Bearer <access_token>"
```

#### Scout Dashboard
Search players under age 25 with specific role:
```bash
curl -X GET "http://localhost:3000/api/dashboard/scout?age=25&role=batsman" \
  -H "Authorization: Bearer <access_token>"
```

---

## 📝 Notes

- Replace `<user_id>`, `<post_id>`, `<access_token>`, `<refresh_token>`, and `<notification_id>` with actual values from API responses
- Ensure MongoDB is running before starting the server
- Socket.IO enables real-time features for notifications and messaging

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO
- **Media Storage**: Cloudinary/S3

---

## 📄 License

This project is licensed under the MIT License.