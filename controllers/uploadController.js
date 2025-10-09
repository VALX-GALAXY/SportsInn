const multer = require('multer');
const path = require('path');
const fs = require('fs');

// configure local storage
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const upload = multer({ storage });

function uploadMiddleware() {
  return upload.single('file');
}

async function handleUpload(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const url = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url } });
  } catch (err) { next(err); }
}

module.exports = { uploadMiddleware, handleUpload };
