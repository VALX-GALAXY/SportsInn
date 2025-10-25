const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// File size limits (in bytes)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];

// Configure local storage
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const fileType = file.mimetype;
  
  if (ALLOWED_IMAGE_TYPES.includes(fileType) || ALLOWED_VIDEO_TYPES.includes(fileType)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(', ')}`), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

function uploadMiddleware() {
  return upload.single('file');
}

async function handleUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded',
        allowedTypes: [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES],
        maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }

    let url, type, publicId;

    // If Cloudinary is configured, upload there
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: 'valaxia-uploads',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });
        
        url = result.secure_url;
        type = result.resource_type;
        publicId = result.public_id;
        
        // Remove local file after successful upload
        fs.unlinkSync(req.file.path);
      } catch (cloudinaryError) {
        console.warn('Cloudinary upload failed, using local fallback:', cloudinaryError.message);
        // Fallback to local URL
        url = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
        type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
      }
    } else {
      // Fallback: local URL
      url = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
      type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    res.json({ 
      success: true, 
      data: { 
        url, 
        type,
        publicId: publicId || null,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      } 
    });
  } catch (err) { 
    // Clean up file if error occurs
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err); 
  }
}

// Additional endpoint for profile picture uploads
async function handleProfileUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No profile picture uploaded',
        allowedTypes: ALLOWED_IMAGE_TYPES,
        maxSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }

    // Validate it's an image
    if (!ALLOWED_IMAGE_TYPES.includes(req.file.mimetype)) {
      // Clean up file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: 'Only image files are allowed for profile pictures',
        allowedTypes: ALLOWED_IMAGE_TYPES
      });
    }

    let url, publicId;

    // If Cloudinary is configured, upload there
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'image',
          folder: 'valaxia-profiles',
          transformation: [
            { width: 300, height: 300, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        });
        
        url = result.secure_url;
        publicId = result.public_id;
        
        // Remove local file after successful upload
        fs.unlinkSync(req.file.path);
      } catch (cloudinaryError) {
        console.warn('Cloudinary profile upload failed, using local fallback:', cloudinaryError.message);
        // Fallback to local URL
        url = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
      }
    } else {
      // Fallback: local URL
      url = `${process.env.BASE_URL || 'http://localhost:3000'}/uploads/${req.file.filename}`;
    }

    res.json({ 
      success: true, 
      data: { 
        url, 
        type: 'image',
        publicId: publicId || null,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      } 
    });
  } catch (err) { 
    // Clean up file if error occurs
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err); 
  }
}

module.exports = { uploadMiddleware, handleUpload, handleProfileUpload };