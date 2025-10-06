// Mock request/invite/application service using localStorage
class RequestService {
  constructor() {
    this.key = 'sportshub_requests'
  }

  _read() {
    try {
      const raw = localStorage.getItem(this.key)
      return raw ? JSON.parse(raw) : { sent: [], received: [] }
    } catch (_) {
      return { sent: [], received: [] }
    }
  }

  _write(data) {
    localStorage.setItem(this.key, JSON.stringify(data))
  }

  _gen(idPrefix) {
    return `${idPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  sendInvite({ fromUser, toUser, message }) {
    const db = this._read()
    const record = {
      id: this._gen('invite'),
      type: 'invite',
      fromUser,
      toUser,
      message: message || 'Invitation to connect/join',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    db.sent.unshift(record)
    db.received.unshift(record)
    this._write(db)
    return record
  }

  sendApplication({ fromUser, toUser, message }) {
    const db = this._read()
    const record = {
      id: this._gen('application'),
      type: 'application',
      fromUser,
      toUser,
      message: message || 'Application request',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    db.sent.unshift(record)
    db.received.unshift(record)
    this._write(db)
    return record
  }

  list() {
    return this._read()
  }

  updateStatus(id, status) {
    const db = this._read()
    const update = (arr) => {
      const idx = arr.findIndex(r => r.id === id)
      if (idx !== -1) arr[idx] = { ...arr[idx], status }
    }
    update(db.sent)
    update(db.received)
    this._write(db)
    return { id, status }
  }
}

export default new RequestService()


