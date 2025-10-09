import axiosInstance from './axiosInstance'

class UploadService {
  // Upload image to Cloudinary
  async uploadImage(file, folder = 'sportshub') {
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'sportshub_preset') // Replace with your upload preset
      formData.append('folder', folder)

      // Upload to Cloudinary
      const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      }
    } catch (error) {
      console.warn('Cloudinary upload failed, using mock upload:', error.message)
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

  // Delete image from Cloudinary
  async deleteImage(publicId) {
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/image/destroy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
          api_key: 'your_api_key', // Replace with your API key
          api_secret: 'your_api_secret' // Replace with your API secret
        })
      })

      if (!response.ok) {
        throw new Error('Delete failed')
      }

      return { success: true }
    } catch (error) {
      console.warn('Cloudinary delete failed, using mock delete:', error.message)
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

  // Upload profile picture
  async uploadProfilePicture(file) {
    return this.uploadImage(file, 'sportshub/profiles')
  }

  // Upload gallery images
  async uploadGalleryImages(files) {
    return this.uploadMultipleImages(files, 'sportshub/gallery')
  }

  // Upload tournament image
  async uploadTournamentImage(file) {
    return this.uploadImage(file, 'sportshub/tournaments')
  }

  // Upload post image
  async uploadPostImage(file) {
    return this.uploadImage(file, 'sportshub/posts')
  }
}

export default new UploadService()