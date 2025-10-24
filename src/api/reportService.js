import axiosInstance from './axiosInstance'

class ReportService {
  constructor() {
    this.key = 'sportshub_reports'
  }

  _read() {
    try {
      const raw = localStorage.getItem(this.key)
      return raw ? JSON.parse(raw) : []
    } catch (_) {
      return []
    }
  }

  _write(data) {
    localStorage.setItem(this.key, JSON.stringify(data))
  }

  // Report a post
  async reportPost({ postId, reason, details, reporterId }) {
    try {
      console.log('🚨 Submitting report to backend:', { postId, reason, details })
      
      const response = await axiosInstance.post('/api/reports', {
        postId,
        reason,
        details: details || '', // Backend expects details field
        reporterId: reporterId || JSON.parse(localStorage.getItem('user'))?.id
      })
      
      console.log('✅ Report submitted successfully:', response.data)
      return response.data.data
    } catch (error) {
      console.warn('⚠️ Backend report API unavailable, using mock data:', error.message)
      console.warn('Error details:', error.response?.data || error.message)
      
      // Fallback to mock implementation
      await new Promise(r => setTimeout(r, 400))
      const reports = this._read()
      const rec = { 
        id: `report_${Date.now()}`, 
        postId, 
        reason, 
        details, 
        reporterId: reporterId || JSON.parse(localStorage.getItem('user'))?.id,
        status: 'pending',
        createdAt: new Date().toISOString() 
      }
      reports.unshift(rec)
      this._write(reports)
      return rec
    }
  }

  // Report a user
  async reportUser({ userId, reason, details, reporterId }) {
    try {
      const response = await axiosInstance.post('/api/reports/user', {
        userId,
        reason,
        details,
        reporterId
      })
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(r => setTimeout(r, 400))
      const reports = this._read()
      const rec = { 
        id: `report_${Date.now()}`, 
        userId, 
        reason, 
        details, 
        reporterId,
        type: 'user',
        status: 'pending',
        createdAt: new Date().toISOString() 
      }
      reports.unshift(rec)
      this._write(reports)
      return rec
    }
  }

  // Report a tournament
  async reportTournament({ tournamentId, reason, details, reporterId }) {
    try {
      const response = await axiosInstance.post('/api/reports/tournament', {
        tournamentId,
        reason,
        details,
        reporterId
      })
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(r => setTimeout(r, 400))
      const reports = this._read()
      const rec = { 
        id: `report_${Date.now()}`, 
        tournamentId, 
        reason, 
        details, 
        reporterId,
        type: 'tournament',
        status: 'pending',
        createdAt: new Date().toISOString() 
      }
      reports.unshift(rec)
      this._write(reports)
      return rec
    }
  }

  // Get reports by reporter
  async getReportsByReporter(reporterId) {
    try {
      const response = await axiosInstance.get(`/api/reports/reporter/${reporterId}`)
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(r => setTimeout(r, 200))
      return this._read().filter(report => report.reporterId === reporterId)
    }
  }

  // Get all reports (admin only)
  async getAllReports(page = 1, limit = 20, status = 'all') {
    try {
      const response = await axiosInstance.get('/api/reports', {
        params: { page, limit, status }
      })
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(r => setTimeout(r, 200))
      const reports = this._read()
      if (status !== 'all') {
        return reports.filter(report => report.status === status)
      }
      return reports
    }
  }

  // Update report status (admin only)
  async updateReportStatus(reportId, status, adminNotes = '') {
    try {
      const response = await axiosInstance.put(`/api/reports/${reportId}/status`, {
        status,
        adminNotes
      })
      return response.data.data
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(r => setTimeout(r, 200))
      const reports = this._read()
      const reportIndex = reports.findIndex(r => r.id === reportId)
      if (reportIndex !== -1) {
        reports[reportIndex].status = status
        reports[reportIndex].adminNotes = adminNotes
        reports[reportIndex].updatedAt = new Date().toISOString()
        this._write(reports)
        return reports[reportIndex]
      }
      return null
    }
  }

  // Get report statistics
  async getReportStats() {
    try {
      const response = await axiosInstance.get('/api/reports/stats')
      return response.data.data || {}
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(r => setTimeout(r, 200))
      const reports = this._read()
      const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
        byType: {
          post: reports.filter(r => r.postId).length,
          user: reports.filter(r => r.userId).length,
          tournament: reports.filter(r => r.tournamentId).length
        }
      }
      return stats
    }
  }

  // Get available report reasons
  async getReportReasons(type = 'post') {
    try {
      const response = await axiosInstance.get(`/api/reports/reasons`, {
        params: { type }
      })
      return response.data.data || []
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock data
      await new Promise(r => setTimeout(r, 100))
      
      const reasons = {
        post: [
          'Spam',
          'Inappropriate content',
          'Harassment',
          'False information',
          'Copyright violation',
          'Violence',
          'Hate speech',
          'Other'
        ],
        user: [
          'Harassment',
          'Spam',
          'Fake account',
          'Inappropriate behavior',
          'Hate speech',
          'Violence',
          'Other'
        ],
        tournament: [
          'Fake tournament',
          'Inappropriate content',
          'Scam',
          'False information',
          'Harassment',
          'Other'
        ]
      }
      
      return reasons[type] || reasons.post
    }
  }

  // Check if user has already reported an item
  async hasReported(itemId, reporterId, type = 'post') {
    try {
      const response = await axiosInstance.get(`/api/reports/check`, {
        params: { itemId, reporterId, type }
      })
      return response.data.data || false
    } catch (error) {
      console.warn('Backend API unavailable, using mock data:', error.message)
      // Fallback to mock implementation
      await new Promise(r => setTimeout(r, 100))
      const reports = this._read()
      const fieldName = type === 'post' ? 'postId' : type === 'user' ? 'userId' : 'tournamentId'
      return reports.some(report => 
        report[fieldName] === itemId && 
        report.reporterId === reporterId
      )
    }
  }

  // Mock method for backward compatibility
  list() { 
    return this._read() 
  }
}

export default new ReportService()


