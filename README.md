# SportsInn - Sports Community Platform

A modern React-based sports community platform that connects players, academies, clubs, and scouts. Built with React, Vite, Tailwind CSS, Framer Motion, and integrated with a Node.js backend API.

## ✨ Latest Features

### 🔔 Notifications System
- **Real-time Notifications**: Bell icon with dropdown preview
- **Full Notifications Page**: Complete notification management
- **Smart Navigation**: Click bell to view page, right-click for quick preview
- **Live Updates**: Mock socket integration for real-time updates
- **Mobile Responsive**: Fully optimized for mobile devices
- **Filter System**: Filter by type (All, Unread, Likes, Follows, Comments)
- **Bulk Actions**: Mark all as read, delete notifications

### 📱 Enhanced Mobile Experience
- **Fixed Navbar**: Properly positioned navbar on mobile devices
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Touch-Friendly**: Optimized button sizes and spacing for mobile
- **Smooth Animations**: Framer Motion animations throughout the app
- **Overflow Prevention**: Content properly contained within viewport

### 🖼️ Profile Enhancements
- **Image Upload System**: Cloudinary integration with fallback
- **Profile Picture Upload**: Drag & drop with progress indicators
- **Gallery Management**: Upload up to 3 images with animations
- **Upload Progress**: Real-time progress bars and status indicators
- **Success/Error States**: Visual feedback with toast notifications
- **Framer Motion Animations**: Smooth transitions and micro-interactions

### 🎨 Advanced UI/UX
- **Framer Motion**: Professional animations and transitions
- **Loading States**: Comprehensive loading indicators
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: User feedback system
- **Dark/Light Mode**: Theme switching support
- **Responsive Grids**: Adaptive layouts for all screen sizes

## 🚀 Features

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

### Notifications System
- **Bell Icon**: Notification dropdown in navbar
- **Quick Preview**: Right-click bell for dropdown
- **Full Page**: Dedicated notifications page
- **Real-time Updates**: Mock socket integration
- **Filter & Search**: Advanced notification filtering
- **Bulk Operations**: Mark all read, delete multiple

### Profile Management
- **Image Upload**: Profile picture and gallery uploads
- **Cloudinary Integration**: Professional image hosting
- **Progress Tracking**: Upload progress indicators
- **Gallery System**: Up to 3 images with management
- **Edit Mode**: Animated form transitions
- **Role-specific Fields**: Customized forms per user role

### User Interface
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching support
- **Modern UI**: Clean, professional design
- **Toast Notifications**: User feedback system
- **Loading Animations**: Smooth transitions
- **Framer Motion**: Advanced animations

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
VITE_API_URL=http://localhost:3001/api

# Development Configuration
VITE_ENV=development
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or next available port)

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── api/                    # API service layer
│   │   ├── axiosInstance.js   # HTTP client configuration
│   │   ├── authService.js     # Authentication services
│   │   ├── feedService.js     # Feed services
│   │   ├── notificationService.js # Notification services
│   │   ├── uploadService.js   # Image upload services
│   │   ├── followService.js   # Follow/unfollow services
│   │   └── requestService.js  # Request management
│   ├── components/             # Reusable UI components
│   │   ├── ui/               # Shadcn/ui components
│   │   ├── Navbar.jsx        # Navigation component
│   │   ├── NotificationDropdown.jsx # Notification bell
│   │   ├── AuthButton.jsx    # Authentication button
│   │   └── GoogleButton.jsx   # Google OAuth button
│   ├── contexts/             # React Context providers
│   │   ├── AuthContext.jsx   # Authentication context
│   │   └── NotificationContext.jsx # Notification context
│   ├── pages/                # Page components
│   │   ├── Login.jsx         # Login page
│   │   ├── Signup.jsx        # Registration page
│   │   ├── Profile.jsx      # User profile page
│   │   ├── Feed.jsx          # Main feed page
│   │   ├── Notifications.jsx # Notifications page
│   │   ├── Dashboard.jsx     # User dashboard
│   │   ├── Search.jsx        # Search page
│   │   ├── Messages.jsx      # Messages page
│   │   └── Requests.jsx      # Requests page
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

#### Notifications
```javascript
GET  /api/notifications       // Get user notifications
PUT  /api/notifications/{id}  // Mark notification as read
PUT  /api/notifications/read-all // Mark all as read
DELETE /api/notifications/{id} // Delete notification
```

#### User Management
```javascript
GET  /api/profile             // Get user profile
PUT  /api/profile             // Update user profile
GET  /api/users/{id}          // Get user by ID
POST /api/users/{id}/follow   // Follow/unfollow user
```

#### Image Upload
```javascript
POST /api/upload/profile      // Upload profile picture
POST /api/upload/gallery      // Upload gallery images
POST /api/upload/post         // Upload post images
```

### Data Structures

#### User Object
```javascript
{
  id: "user_id",
  name: "User Name",
  email: "user@example.com",
  role: "Player|Academy|Club|Scout",
  profilePicture: "image_url",
  galleryImages: ["image1_url", "image2_url"],
  bio: "User bio",
  age: 25,
  location: "City, Country",
  contactInfo: "contact@example.com",
  organization: "Organization Name",
  yearsOfExperience: 5,
  verified: true/false,
  createdAt: "2024-01-01T00:00:00Z"
}
```

#### Notification Object
```javascript
{
  id: "notification_id",
  type: "like|follow|comment|tournament|scout|academy|club",
  title: "Notification Title",
  message: "Notification message",
  isRead: false,
  comment: {
    text: "Comment text",
    author: "Author name"
  },
  post: {
    preview: "Post preview text"
  },
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
    profilePicture: "image_url",
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
- **Badge**: Status indicators
- **Avatar**: User profile images

### Custom Components
- **Navbar**: Main navigation with auth state
- **NotificationDropdown**: Bell icon with dropdown
- **AuthButton**: Reusable authentication button
- **GoogleButton**: Google OAuth integration
- **ErrorBoundary**: Error handling wrapper

## 🔔 Notifications System

### 1. Notification Bell
```javascript
// Bell icon with dropdown
<NotificationDropdown />

// Click to navigate to full page
const handleBellClick = () => {
  navigate('/notifications')
}

// Right-click for quick preview
const handleBellRightClick = (e) => {
  e.preventDefault()
  setIsOpen(!isOpen)
}
```

### 2. Real-time Updates
```javascript
// Mock socket integration
const socketService = {
  connect: () => {
    // Simulate real-time connection
    setInterval(() => {
      const newNotification = generateMockNotification()
      addNotification(newNotification)
    }, 30000) // Every 30 seconds
  }
}
```

### 3. Notification Management
```javascript
const markAsRead = async (notificationId) => {
  try {
    await notificationService.markAsRead(notificationId)
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? {...n, isRead: true} : n)
    )
  } catch (error) {
    // Fallback to mock data
    console.info('Using mock data for notifications')
  }
}
```

## 🖼️ Image Upload System

### 1. Profile Picture Upload
```javascript
const handleImageChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  setIsUploading(true)
  setUploadStatus('uploading')
  setUploadProgress(0)

  try {
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Upload to Cloudinary or mock
    const result = await uploadService.uploadProfilePicture(file)
    
    setUploadStatus('success')
    setImagePreview(result.url)
    toast({ title: "Success", description: "Profile picture updated!" })
  } catch (error) {
    setUploadStatus('error')
    toast({ title: "Error", description: "Upload failed" })
  } finally {
    setIsUploading(false)
    setTimeout(() => setUploadStatus('idle'), 3000)
  }
}
```

### 2. Gallery Management
```javascript
const handleGalleryUpload = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return

  setIsUploadingGallery(true)
  setUploadStatus('uploading')

  try {
    for (const file of files) {
      const result = await uploadService.uploadGalleryImage(file)
      setGalleryImages(prev => [...prev, {
        id: Date.now(),
        url: result.url,
        name: file.name
      }])
    }
    
    setUploadStatus('success')
    toast({ title: "Success", description: "Images uploaded!" })
  } catch (error) {
    setUploadStatus('error')
    toast({ title: "Error", description: "Upload failed" })
  } finally {
    setIsUploadingGallery(false)
    setTimeout(() => setUploadStatus('idle'), 3000)
  }
}
```

## 🎭 Framer Motion Animations

### 1. Upload Progress Animations
```javascript
<AnimatePresence>
  {isUploading && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center space-x-2 text-blue-600"
    >
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-sm">Uploading...</span>
      <motion.div
        className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: `${uploadProgress}%` }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )}
</AnimatePresence>
```

### 2. Gallery Image Animations
```javascript
<AnimatePresence>
  {galleryImages.map((image, index) => (
    <motion.div
      key={image.id}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative group"
    >
      {/* Image content */}
    </motion.div>
  ))}
</AnimatePresence>
```

### 3. Edit Mode Transitions
```javascript
<AnimatePresence mode="wait">
  {editingSection === 'basic' ? (
    <motion.form
      key="edit-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Form content */}
    </motion.form>
  ) : (
    <motion.div
      key="view-mode"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* View content */}
    </motion.div>
  )}
</AnimatePresence>
```

## 📱 Mobile Responsiveness

### 1. Navbar Fixes
```css
/* Fixed navbar on mobile */
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2147483647;
}

/* Content margin for fixed navbar */
.main-content {
  margin-top: 5rem; /* 80px */
}

@media (min-width: 640px) {
  nav {
    position: relative;
    z-index: auto;
  }
  
  .main-content {
    margin-top: 0;
  }
}
```

### 2. Responsive Button Layouts
```javascript
// Follow/Apply buttons
<div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
  <Button className="w-full sm:w-auto">
    Follow
  </Button>
  <Button className="w-full sm:w-auto">
    Apply
  </Button>
</div>
```

### 3. Responsive Grids
```javascript
// Performance stats
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
  {/* Stats cards */}
</div>

// Gallery
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
  {/* Gallery images */}
</div>
```

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
# App runs on http://localhost:5173 (or next available port)
```

### 3. Development Features
- **Hot Reload**: Automatic browser refresh on changes
- **Error Overlay**: Development error display
- **Source Maps**: Easy debugging
- **Environment Variables**: Configurable API endpoints
- **Mock Data**: Fallback data when backend unavailable

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
- App gracefully falls back to mock data

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

#### 5. Mobile Layout Issues
- Check viewport meta tag in index.html
- Verify responsive classes are applied
- Test on actual mobile devices
- Check for CSS conflicts

### Debug Steps
1. **Check Console**: Look for JavaScript errors
2. **Network Tab**: Verify API calls are being made
3. **Local Storage**: Check if tokens are stored
4. **Component Tree**: Use React DevTools
5. **API Testing**: Test endpoints with Postman
6. **Mobile Testing**: Test responsive design on devices

## 📦 Dependencies

### Core Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "axios": "^1.6.0",
  "lucide-react": "^0.263.0",
  "framer-motion": "^10.16.0",
  "recharts": "^2.8.0"
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
- [ ] Image upload service configured
- [ ] Notification system tested

## 📝 Development Notes

### Code Style
- Use functional components with hooks
- Implement proper error boundaries
- Follow React best practices
- Use TypeScript for better type safety (optional)
- Implement Framer Motion for animations

### Performance
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize images and assets
- Implement proper caching strategies
- Use AnimatePresence for smooth transitions

### Security
- Never expose API keys in frontend
- Implement proper input validation
- Use HTTPS in production
- Implement rate limiting on API calls
- Validate file uploads

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

### Typography
- **Headings**: Inter, system fonts
- **Body**: Inter, system fonts
- **Code**: JetBrains Mono, monospace

### Spacing
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on mobile and desktop
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Check browser console for errors
- Verify backend server is running
- Test responsive design on mobile devices

---

**Happy Coding! 🚀**

## 🏆 Recent Achievements

- ✅ **Notifications System**: Complete real-time notification management
- ✅ **Mobile Responsiveness**: Fully optimized mobile experience
- ✅ **Image Upload**: Professional image upload with Cloudinary
- ✅ **Framer Motion**: Advanced animations throughout the app
- ✅ **Error Handling**: Comprehensive error management with fallbacks
- ✅ **Performance**: Optimized loading and smooth transitions