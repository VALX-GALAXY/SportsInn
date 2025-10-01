# Backend Integration Guide

## 🚀 Quick Start with Backend

### 1. Start Your Backend Server
```bash
# Make sure your backend is running on port 3001
# Example: node server.js or npm start
```

### 2. Verify Backend Endpoints
Test these endpoints with Postman or curl:

#### Authentication Endpoints
```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"Player"}'
```

#### Feed Endpoints
```bash
# Test feed (requires authentication)
curl -X GET http://localhost:3001/api/feed \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test like post
curl -X POST http://localhost:3001/api/feed/1/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Expected Response Formats

#### Login Response
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "Player",
    "avatar": "image_url",
    "verified": true
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}
```

#### Feed Response
```json
{
  "posts": [
    {
      "id": "post_id",
      "author": {
        "name": "Author Name",
        "role": "Player",
        "avatar": "image_url",
        "verified": true
      },
      "content": {
        "text": "Post caption",
        "image": "image_url"
      },
      "stats": {
        "likes": 42,
        "comments": 8,
        "shares": 3
      },
      "timestamp": "2 hours ago",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Like Response
```json
{
  "likes": 43,
  "liked": true
}
```

## 🔧 Backend Requirements

### Required Middleware
1. **CORS**: Allow frontend origin
2. **Body Parser**: Parse JSON requests
3. **JWT**: Token validation
4. **Rate Limiting**: Prevent abuse

### Database Schema Suggestions

#### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Player', 'Academy', 'Club', 'Scout') NOT NULL,
  avatar VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Posts Table
```sql
CREATE TABLE posts (
  id VARCHAR(36) PRIMARY KEY,
  author_id VARCHAR(36) NOT NULL,
  content_text TEXT,
  content_image VARCHAR(500),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### Likes Table
```sql
CREATE TABLE likes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  UNIQUE(user_id, post_id)
);
```

## 🧪 Testing the Integration

### 1. Test Authentication Flow
1. Open browser to `http://localhost:5173`
2. Click "Sign Up"
3. Fill form with test data
4. Submit and check if user is created
5. Check browser console for API calls

### 2. Test Feed Loading
1. Login with test user
2. Navigate to Feed page
3. Check if posts load from backend
4. Verify loading states work

### 3. Test Like Functionality
1. Click like button on a post
2. Check if like count updates
3. Verify animation works
4. Check network tab for API calls

### 4. Test Error Handling
1. Stop backend server
2. Try to like a post
3. Check if error toast appears
4. Verify fallback to dummy data

## 🐛 Common Integration Issues

### 1. CORS Errors
```javascript
// Backend CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### 2. JWT Token Issues
```javascript
// Check token format
const token = localStorage.getItem('token');
console.log('Token:', token);

// Verify token in requests
// Should be: Authorization: Bearer <token>
```

### 3. API Response Format
```javascript
// Ensure backend returns expected format
// Frontend expects: { posts: [...] }
// Not: { data: { posts: [...] } }
```

### 4. Image Upload Issues
```javascript
// For image uploads, backend should handle:
// 1. File upload endpoint
// 2. Image storage
// 3. Return image URL
// 4. CORS for file uploads
```

## 📊 Monitoring Integration

### 1. Browser DevTools
- **Network Tab**: Check API calls
- **Console**: Look for errors
- **Application Tab**: Check localStorage
- **React DevTools**: Component state

### 2. Backend Logs
```javascript
// Add logging to backend
console.log('API Request:', req.method, req.url);
console.log('Response:', response);
```

### 3. API Testing Tools
- **Postman**: Test endpoints manually
- **Insomnia**: Alternative to Postman
- **curl**: Command line testing
- **Browser Network Tab**: Real-time monitoring

## 🚀 Production Deployment

### 1. Environment Variables
```env
# Production .env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_ENV=production
```

### 2. Build Configuration
```bash
# Build for production
npm run build

# Test production build
npm run preview
```

### 3. Backend Configuration
- Update CORS to allow production domain
- Configure HTTPS
- Set up proper JWT secrets
- Implement rate limiting
- Add error monitoring

## 📝 Development Tips

### 1. API Development
- Use consistent response formats
- Implement proper error codes
- Add request validation
- Use proper HTTP status codes

### 2. Frontend Development
- Handle loading states
- Implement error boundaries
- Use optimistic updates
- Add proper validation

### 3. Testing Strategy
- Test happy path first
- Test error scenarios
- Test edge cases
- Test with real data

---

**Ready to integrate with your backend! 🎉**
