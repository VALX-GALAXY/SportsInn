# SportsHub - Sports Community Platform

A modern React-based sports community platform that connects players, academies, clubs, and scouts. Built with React, Vite, Tailwind CSS, and integrated with a Node.js backend API.

## Features

### Authentication System
- **Role-based Registration**: Player, Academy, Club, Scout
- **JWT Authentication**: Secure login with token management
- **Google OAuth**: Social login integration
- **Auto-refresh**: Automatic token renewal
- **Session Management**: Persistent login state

### Feed System
- **Dynamic Posts**: Real-time feed from backend API
- **Like Functionality**: Like/unlike posts with animations
- **Post Creation**: Create new posts with images
- **User Profiles**: Author information with role badges
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error management

### User Interface
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching support
- **Modern UI**: Clean, professional design
- **Toast Notifications**: User feedback system
- **Loading Animations**: Smooth transitions

##  Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Backend API** running on `http://localhost:3001`

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Day1/frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `frontend` directory:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api

# Development Configuration
REACT_APP_ENV=development
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── api/                    # API service layer
│   │   ├── axiosInstance.js   # HTTP client configuration
│   │   ├── authService.js     # Authentication services
│   │   └── feedService.js     # Feed services
│   ├── components/             # Reusable UI components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── Navbar.jsx        # Navigation component
│   │   ├── AuthButton.jsx    # Authentication button
│   │   └── GoogleButton.jsx   # Google OAuth button
│   ├── contexts/             # React Context providers
│   │   └── AuthContext.jsx   # Authentication context
│   ├── pages/                # Page components
│   │   ├── Login.jsx         # Login page
│   │   ├── Signup.jsx        # Registration page
│   │   ├── Profile.jsx      # User profile page
│   │   └── Feed.jsx          # Main feed page
│   ├── lib/                  # Utility functions
│   │   └── utils.js          # Helper utilities
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles
├── .env                      # Environment variables
├── package.json              # Dependencies and scripts
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

## 🔧 API Integration

### Backend API Endpoints Expected

#### Authentication
```javascript
POST /api/auth/login          // User login
POST /api/auth/signup         // User registration
POST /api/auth/google         // Google OAuth
POST /api/auth/refresh        // Token refresh
POST /api/auth/logout         // User logout
```

#### Feed System
```javascript
GET  /api/feed                // Get feed posts
POST /api/feed                // Create new post
POST /api/feed/{id}/like      // Like/unlike post
GET  /api/feed/{id}/comments  // Get post comments
POST /api/feed/{id}/comments  // Add comment
```

#### User Management
```javascript
GET  /api/profile             // Get user profile
PUT  /api/profile             // Update user profile
GET  /api/users/{id}          // Get user by ID
```

### Data Structures

#### User Object
```javascript
{
  id: "user_id",
  name: "User Name",
  email: "user@example.com",
  role: "Player|Academy|Club|Scout",
  avatar: "image_url",
  verified: true/false,
  createdAt: "2024-01-01T00:00:00Z"
}
```

#### Post Object
```javascript
{
  id: "post_id",
  author: {
    name: "Author Name",
    role: "Player",
    avatar: "image_url",
    verified: true
  },
  content: {
    text: "Post caption",
    image: "image_url"
  },
  stats: {
    likes: 42,
    comments: 8,
    shares: 3
  },
  timestamp: "2 hours ago",
  createdAt: "2024-01-01T00:00:00Z"
}
```

## 🎨 UI Components

### Shadcn/ui Components Used
- **Card**: Post containers and content cards
- **Button**: Interactive buttons with variants
- **Input**: Form input fields
- **Label**: Form labels
- **Select**: Dropdown selections
- **Textarea**: Multi-line text input
- **Toast**: Notification system

### Custom Components
- **Navbar**: Main navigation with auth state
- **AuthButton**: Reusable authentication button
- **GoogleButton**: Google OAuth integration
- **ErrorBoundary**: Error handling wrapper

## 🔐 Authentication Flow

### 1. Registration Process
```javascript
// User selects role and fills form
const signupData = {
  name: "User Name",
  email: "user@example.com",
  password: "password123",
  role: "Player|Academy|Club|Scout"
}

// API call to backend
const response = await authService.signup(signupData)
// Returns: { user, token, refreshToken }
```

### 2. Login Process
```javascript
// User enters credentials
const loginData = {
  email: "user@example.com",
  password: "password123"
}

// API call to backend
const response = await authService.login(loginData)
// Returns: { user, token, refreshToken }
```

### 3. Token Management
```javascript
// Automatic token attachment to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on token expiry
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      await authService.refreshToken()
    }
    return Promise.reject(error)
  }
)
```

## 📱 Feed System

### 1. Fetching Posts
```javascript
const fetchFeed = async () => {
  try {
    setIsLoading(true)
    const response = await feedService.getFeed()
    setFeedData(response.posts || [])
  } catch (error) {
    // Error handling with fallback data
    setFeedData(dummyFeedData)
  } finally {
    setIsLoading(false)
  }
}
```

### 2. Like Functionality
```javascript
const handleLike = async (postId) => {
  try {
    // Optimistic update
    setLikedPosts(prev => toggleLike(prev, postId))
    
    // API call
    const response = await feedService.toggleLike(postId)
    
    // Update with server response
    setFeedData(prev => updatePostLikes(prev, postId, response.likes))
  } catch (error) {
    // Revert optimistic update on error
    setLikedPosts(prev => toggleLike(prev, postId))
  }
}
```

### 3. Post Creation
```javascript
const handleCreatePost = async (postData) => {
  try {
    setIsCreating(true)
    const response = await feedService.createPost(postData)
    
    // Add new post to feed
    setFeedData(prev => [response.post, ...prev])
    
    // Reset form
    setNewPost({ caption: '', image: null })
    setShowCreatePost(false)
  } catch (error) {
    // Error handling
  } finally {
    setIsCreating(false)
  }
}
```

## 🎯 Key Features Implementation

### 1. Role-based UI
```javascript
const getRoleColor = (role) => {
  switch (role) {
    case 'Player': return 'text-green-600 bg-green-50'
    case 'Academy': return 'text-blue-600 bg-blue-50'
    case 'Club': return 'text-purple-600 bg-purple-50'
    case 'Scout': return 'text-orange-600 bg-orange-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}
```

### 2. Loading States
```javascript
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-6 h-6 animate-spin" />
    <span>Loading feed...</span>
  </div>
) : (
  // Feed content
)}
```

### 3. Error Handling
```javascript
try {
  const response = await apiCall()
  // Success handling
} catch (error) {
  toast({
    title: "Error",
    description: error.message || "Something went wrong",
    variant: "destructive"
  })
}
```

## 🚀 Development Workflow

### 1. Start Backend Server
```bash
# In backend directory
npm start
# Server runs on http://localhost:3001
```

### 2. Start Frontend Development
```bash
# In frontend directory
npm run dev
# App runs on http://localhost:5173
```

### 3. Development Features
- **Hot Reload**: Automatic browser refresh on changes
- **Error Overlay**: Development error display
- **Source Maps**: Easy debugging
- **Environment Variables**: Configurable API endpoints

## 🐛 Troubleshooting

### Common Issues

#### 1. Blank Page
- Check browser console for errors
- Verify all imports are correct
- Ensure no missing dependencies
- Check if development server is running

#### 2. API Connection Issues
- Verify backend server is running on port 3001
- Check `.env` file configuration
- Ensure CORS is configured on backend
- Verify API endpoints are implemented

#### 3. Authentication Issues
- Check JWT token in localStorage
- Verify token expiration
- Ensure refresh token is working
- Check backend authentication middleware

#### 4. Import Errors
- Use relative paths instead of `@/` aliases
- Check file paths are correct
- Ensure all dependencies are installed
- Verify component exports

### Debug Steps
1. **Check Console**: Look for JavaScript errors
2. **Network Tab**: Verify API calls are being made
3. **Local Storage**: Check if tokens are stored
4. **Component Tree**: Use React DevTools
5. **API Testing**: Test endpoints with Postman

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.263.0"
}
```

### Development Dependencies
```json
{
  "vite": "^4.4.0",
  "@vitejs/plugin-react": "^4.0.0",
  "tailwindcss": "^3.3.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0"
}
```

## 🔄 Build & Deployment

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints updated for production
- [ ] Build process completed successfully
- [ ] Static files served correctly
- [ ] HTTPS configured (if needed)

## 📝 Development Notes

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript for better type safety (optional)

### Performance
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize images and assets
- Implement proper caching strategies

### Security
- Never expose API keys in frontend
- Implement proper input validation
- Use HTTPS in production
- Implement rate limiting on API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Check browser console for errors
- Verify backend server is running

---

**Happy Coding! 🚀**