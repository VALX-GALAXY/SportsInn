# 🏏 Cricket Social Platform API

A Node.js + Express + MongoDB project that allows players, academies, and scouts to connect, share posts, follow each other, and get notifications.

## 🚀 Features

- User signup & login (with JWT & refresh tokens)
- Role-based profiles (Player / Academy / Scout)
- Create, like, comment on posts
- Follow/unfollow users + personalized feed
- Notifications for likes, comments, follows
- Search users by name

## ⚡ Setup Instructions

### Clone repo

```bash
git clone <repo_url>
cd <project_folder>
```

### Install dependencies

```bash
npm install
```

### Start MongoDB (local)

```bash
mongod --dbpath ~/data/db
```

### Start server

```bash
npm start
```

Server runs at: http://localhost:3000

## 🧪 API Testing with cURL

Below are ready-to-use cURL scripts for each feature.

### 🔹 1. Signup Users

**Player**

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

**Academy**

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

**Scout**

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name":"John Scout",
    "email":"scout@test.com",
    "password":"123456",
    "role":"scout",
    "organization":"XYZ Club",
    "experience":"5 years"
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

**Get Profile**

```bash
curl -X GET http://localhost:3000/api/profile/<user_id> \
  -H "Authorization: Bearer <access_token>"
```

**Update Profile**

```bash
curl -X PUT http://localhost:3000/api/profile/<user_id> \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"playingRole":"allrounder"}'
```

### 🔹 5. Feed APIs

**Create Post**

```bash
curl -X POST http://localhost:3000/api/feed \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"caption":"Training hard today!","imageUrl":"http://img.com/pic.jpg"}'
```

**Get Feed**

```bash
curl -X GET http://localhost:3000/api/feed \
  -H "Authorization: Bearer <access_token>"
```

**Like/Unlike Post**

```bash
curl -X PUT http://localhost:3000/api/feed/<post_id>/like \
  -H "Authorization: Bearer <access_token>"
```

**Delete Post**

```bash
curl -X DELETE http://localhost:3000/api/feed/<post_id> \
  -H "Authorization: Bearer <access_token>"
```

### 🔹 6. Follow System

**Follow/Unfollow User**

```bash
curl -X POST http://localhost:3000/api/users/<target_user_id>/follow \
  -H "Authorization: Bearer <access_token>"
```

**Get Followers**

```bash
curl -X GET http://localhost:3000/api/users/<user_id>/followers
```

**Get Following**

```bash
curl -X GET http://localhost:3000/api/users/<user_id>/following
```

### 🔹 7. Personalized Feed

```bash
curl -X GET http://localhost:3000/api/feed/personalized \
  -H "Authorization: Bearer <access_token>"
```

### 🔹 8. Comments

**Add Comment**

```bash
curl -X POST http://localhost:3000/api/feed/<post_id>/comment \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Great post! 🔥"}'
```

**Get Comments (page 1, limit 5)**

```bash
curl -X GET "http://localhost:3000/api/feed/<post_id>/comments?page=1&limit=5"
```

### 🔹 9. Notifications

**Get Notifications**

```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <access_token>"
```

**Mark Notification Read**

```bash
curl -X PUT http://localhost:3000/api/notifications/<notification_id>/read \
  -H "Authorization: Bearer <access_token>"
```

### 🔹 10. Search Users

```bash
curl -X GET "http://localhost:3000/api/users/search?q=ashu"
```

## ✅ Notes

- Replace `<access_token>`, `<refresh_token>`, `<user_id>`, `<post_id>`, `<notification_id>` with real values from responses.
- Use separate accounts (player/academy/scout) for testing different flows.