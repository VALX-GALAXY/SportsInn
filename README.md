# Auth & Feed API (Day 3)

A Node.js + Express backend with **MongoDB integration**, role-based authentication, JWT access/refresh tokens, and feed CRUD APIs.

## Features

- 🔐 JWT-based authentication (access + refresh tokens)
- 👥 Role-based user management (player, coach, fan, etc.)
- 📝 Feed system with CRUD operations
- ❤️ Like/Unlike functionality
- 🔄 Token refresh mechanism
- 🗄️ MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or remote instance)
- npm or yarn

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB (Local)

```bash
sudo systemctl start mongod
```

For macOS using Homebrew:
```bash
brew services start mongodb-community
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=mongodb://127.0.0.1:27017/project1db
JWT_SECRET=yourSecretKey
```

**Important:** Change `yourSecretKey` to a strong, random string in production.

### 4. Start the Server

```bash
# Using node
node server.js

# Or with nodemon for development
nodemon server.js
```

Server runs at: **http://localhost:3000**

---

## API Endpoints

### Authentication

#### 1. Signup (Role-Specific)

Create a new user account with role-based fields.

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ashu",
    "email": "ashu@test.com",
    "password": "123456",
    "role": "player",
    "age": 21,
    "playingRole": "batsman"
  }'
```

**Supported Roles:** `player`, `coach`, `fan`, etc.

**Role-Specific Fields:**
- **Player:** `age`, `playingRole`
- **Coach:** `experience`, `specialization`
- **Fan:** `favoriteTeam`

---

#### 2. Login

Authenticate and receive access and refresh tokens.

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ashu@test.com",
    "password": "123456"
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

#### 3. Refresh Access Token

Get a new access token using your refresh token.

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your_refresh_token_here>"
  }'
```

---

#### 4. Logout

Invalidate the refresh token.

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your_refresh_token_here>"
  }'
```

---

### Profile Management

#### 1. Get Profile

Retrieve user profile information.

```bash
curl -X GET http://localhost:3000/api/profile/<user_id> \
  -H "Authorization: Bearer <your_access_token>"
```

---

#### 2. Update Profile

Update profile with role-based field restrictions.

```bash
curl -X PUT http://localhost:3000/api/profile/<user_id> \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Loves cricket",
    "playingRole": "allrounder"
  }'
```

**Note:** Only fields relevant to the user's role can be updated.

---

### Feed System

#### 1. Create Post

Create a new feed post.

```bash
curl -X POST http://localhost:3000/api/feed \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "Training day",
    "imageUrl": "http://img.com/pic.jpg"
  }'
```

---

#### 2. Get Latest Feed

Fetch the latest posts from the feed.

```bash
curl -X GET http://localhost:3000/api/feed \
  -H "Authorization: Bearer <your_access_token>"
```

**Optional Query Parameters:**
- `?limit=20` - Number of posts to fetch
- `?skip=0` - Number of posts to skip (pagination)

---

#### 3. Like/Unlike Post

Toggle like status on a post.

```bash
curl -X PUT http://localhost:3000/api/feed/<post_id>/like \
  -H "Authorization: Bearer <your_access_token>"
```

**Note:** Calling this endpoint again will unlike the post.

---

#### 4. Delete Post

Delete a post (only the author can delete).

```bash
curl -X DELETE http://localhost:3000/api/feed/<post_id> \
  -H "Authorization: Bearer <your_access_token>"
```

---

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String,
  bio: String,
  // Role-specific fields
  age: Number,
  playingRole: String,
  experience: Number,
  specialization: String,
  favoriteTeam: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Post Model
```javascript
{
  author: ObjectId (ref: User),
  caption: String,
  imageUrl: String,
  likes: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### RefreshToken Model
```javascript
{
  token: String (unique),
  userId: ObjectId (ref: User),
  expiresAt: Date,
  createdAt: Date
}
```

---

## Security Notes

### Token Expiration
- **Access Tokens:** Expire in **15 minutes**
- **Refresh Tokens:** Expire in **7 days**

### Best Practices
1. Store tokens securely (never in localStorage for sensitive apps)
2. Use HTTPS in production
3. Change `JWT_SECRET` to a strong random string
4. Implement rate limiting for auth endpoints
5. Hash passwords with bcrypt (salt rounds: 10+)
6. Validate and sanitize all user inputs

---

## Project Structure

```
.
├── server.js           # Main application entry point
├── .env                # Environment variables (not in git)
├── package.json        # Dependencies and scripts
├── models/             # MongoDB models
│   ├── User.js
│   ├── Post.js
│   └── RefreshToken.js
├── routes/             # API routes
│   ├── auth.js
│   ├── profile.js
│   └── feed.js
├── middleware/         # Custom middleware
│   └── auth.js
└── README.md          # This file
```

---

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use
If port 3000 is occupied, modify the port in `server.js` or set via environment:
```bash
PORT=4000 node server.js
```

### Token Expiration
If you receive "Token expired" errors, use the refresh token endpoint to get a new access token.

---

## Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing

---

## License

MIT

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Contact

For questions or issues, please open an issue on the repository.

---

**Happy Coding! 🚀**