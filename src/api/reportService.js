// Mock report service
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
  async reportPost({ postId, reason, details }) {
    await new Promise(r => setTimeout(r, 400))
    const reports = this._read()
    const rec = { id: `report_${Date.now()}`, postId, reason, details, createdAt: new Date().toISOString() }
    reports.unshift(rec)
    this._write(reports)
    return rec
  }
  list() { return this._read() }
}

export default new ReportService()


