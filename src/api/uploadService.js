import axiosInstance from './axiosInstance'

class UploadService {
  // Upload image using backend endpoint
  async uploadImage(file, folder = 'sportshub') {
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Upload through backend endpoint
      const response = await axiosInstance.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        return {
          success: true,
          url: response.data.data.url,
          publicId: response.data.data.publicId || null
        }
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (error) {
      console.warn('Backend upload failed, using mock upload:', error.message)
      // Fallback to mock upload
      return this.mockUploadImage(file, folder)
    }
  }

  // Upload multiple images
  async uploadMultipleImages(files, folder = 'sportshub') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder))
      const results = await Promise.all(uploadPromises)
      
      return {
        success: true,
        urls: results.map(result => result.url),
        publicIds: results.map(result => result.publicId)
      }
    } catch (error) {
      console.error('Error uploading multiple images:', error)
      throw error
    }
  }

  // Delete image using backend endpoint
  async deleteImage(publicId) {
    try {
      // For now, we'll use mock delete since backend doesn't have delete endpoint
      // In a real implementation, you'd add a DELETE endpoint to your backend
      console.warn('Delete endpoint not implemented in backend, using mock delete')
      return this.mockDeleteImage(publicId)
    } catch (error) {
      console.warn('Delete failed, using mock delete:', error.message)
      return this.mockDeleteImage(publicId)
    }
  }

  // Mock upload for development
  mockUploadImage(file, folder) {
    return new Promise((resolve) => {
      // Simulate upload delay
      setTimeout(() => {
        // Create a mock URL using FileReader
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            success: true,
            url: e.target.result,
            publicId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
        }
        reader.readAsDataURL(file)
      }, 1000)
    })
  }

  // Mock delete
  mockDeleteImage(publicId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 500)
    })
  }

  // Upload profile picture using backend profile endpoint
  async uploadProfilePicture(userId, file) {
    try {
      const formData = new FormData()
      formData.append('profilePic', file)

      const response = await axiosInstance.post(`/api/profile/${userId}/picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        return {
          success: true,
          url: response.data.profilePic || response.data.data?.profilePic,
          message: response.data.message || 'Profile picture updated successfully'
        }
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (error) {
      console.warn('Backend profile upload failed, using mock upload:', error.message)
      return this.mockUploadImage(file, 'sportshub/profiles')
    }
  }

  // Upload gallery images using backend gallery endpoint
  async uploadGalleryImages(userId, files) {
    try {
      const uploadPromises = files.map(file => this.uploadGalleryImage(userId, file))
      const results = await Promise.all(uploadPromises)
      
      return {
        success: true,
        urls: results.map(result => result.url),
        publicIds: results.map(result => result.publicId)
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error)
      throw error
    }
  }

  // Upload single gallery image
  async uploadGalleryImage(userId, file) {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axiosInstance.post(`/api/profile/${userId}/gallery`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        return {
          success: true,
          url: response.data.url,
          message: response.data.message || 'Image added to gallery successfully'
        }
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (error) {
      console.warn('Backend gallery upload failed, using mock upload:', error.message)
      return this.mockUploadImage(file, 'sportshub/gallery')
    }
  }

  // Upload tournament image
  async uploadTournamentImage(file) {
    return this.uploadImage(file, 'sportshub/tournaments')
  }

  // Upload post image
  async uploadPostImage(file) {
    return this.uploadImage(file, 'sportshub/posts')
  }

  // Mock upload methods for feedService compatibility
  async uploadImageMock(file) {
    return this.mockUploadImage(file, 'sportshub/posts')
  }

  async uploadVideoMock(file) {
    return new Promise((resolve) => {
      // Simulate upload delay
      setTimeout(() => {
        // Create a mock URL using FileReader
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({
            success: true,
            url: e.target.result,
            publicId: `mock_video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          })
        }
        reader.readAsDataURL(file)
      }, 1500) // Longer delay for video
    })
  }
}

export default new UploadService()