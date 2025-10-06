import axiosInstance from './axiosInstance'

class UploadService {
  // Real API methods for production
  async uploadFile(file, type = 'image') {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload file')
    }
  }

  async uploadImage(file) {
    return this.uploadFile(file, 'image')
  }

  async uploadVideo(file) {
    return this.uploadFile(file, 'video')
  }

  // Mock implementation for development
  async uploadFileMock(file, type = 'image') {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a data URL from the file for immediate display
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = {
            url: e.target.result, // Use the actual data URL
            filename: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString()
          }
          console.log('Upload service returning:', result)
          resolve(result)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(file)
      })
    } catch (error) {
      throw new Error('Failed to upload file')
    }
  }

  async uploadImageMock(file) {
    return this.uploadFileMock(file, 'image')
  }

  async uploadVideoMock(file) {
    return this.uploadFileMock(file, 'video')
  }
}

export default new UploadService()

