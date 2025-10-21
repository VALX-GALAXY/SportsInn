const User = require("../models/userModel");
const profileService = require("../services/profileService");
const roleFields = require("../utils/roleFields");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

async function getProfile(req, res) {
  const user = await profileService.getProfile(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
}

async function updateProfile(req, res, next) {
  try {
    const id = req.params.id;
    if (String(id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own profile' });
    }
    
    // Role-based field restrictions
    const allowed = roleFields[req.user.role] || [];
    // exclude protected fields
    const protectedFields = ['password', 'email', 'role', 'refreshTokens', '_id', 'isAdmin'];
    const updates = {};

    // Handle uploaded image URL
    if (req.body.profilePic) updates.profilePic = req.body.profilePic;

    // Allow clearing profilePic if explicitly sent as empty string
    if (req.body.profilePic === "") {
      updates.profilePic = "";
    }

    for (const key of Object.keys(req.body)) {
      if (protectedFields.includes(key)) continue;
      // if role-specific list exists, only allow those fields (plus generic fields)
      if (allowed.length && !allowed.includes(key) && !['name', 'location', 'contactInfo', 'bio'].includes(key)) {
        // skip fields not allowed
        continue;
      }
      updates[key] = req.body[key];
    }

    // Validate required role fields: ensure required fields exist if provided empty
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-passwordHash -refreshTokens');
    res.json({ success: true, data: user, message: 'Profile updated' });
  } catch (err) { next(err); }
}

async function uploadProfilePicture(req, res, next) {
  try {
    const id = req.params.id;

    // authorize: only owner or admin
    if (String(id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only update your own profile picture' });
    }

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded (field: profilePic)" });

    let url;
    // if cloudinary configured, upload there
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" });
      url = result.secure_url;
      // delete local file
      fs.unlinkSync(file.path);
    } else {
      // local fallback
      url = `${process.env.BASE_URL || "http://localhost:3000"}/uploads/${path.basename(file.path)}`;
    }

    const user = await User.findByIdAndUpdate(id, { profilePic: url }, { new: true }).select("-passwordHash -refreshTokens");
    res.json({ success: true, data: user, message: "Profile picture updated", profilePic: url });
  } catch (err) {
    next(err);
  }
}

// GET /api/profile/:id/gallery
async function getGallery(req, res, next) {
  try {
    const user = await User.findById(req.params.id).select("gallery");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user.gallery || [] });
  } catch (err) { next(err); }
}

// POST /api/profile/:id/gallery
async function addGalleryImage(req, res, next) {
  try {
    const id = req.params.id;
    // only owner or admin
    if (String(id) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "No file uploaded" });

    let url;
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const r = await cloudinary.uploader.upload(file.path, { resource_type: "image", folder: `gallery/${id}` });
      url = r.secure_url;
      fs.unlinkSync(file.path);
    } else {
      url = `${process.env.BASE_URL || "http://localhost:3000"}/uploads/${path.basename(file.path)}`;
    }

    const user = await User.findByIdAndUpdate(id, { $push: { gallery: url } }, { new: true }).select("-passwordHash -refreshTokens");
    // invalidate feed cache maybe not needed, but profile page should fetch fresh
    res.json({ success: true, data: user.gallery, message: "Image added to gallery", url });
  } catch (err) { next(err); }
}

// DELETE /api/profile/:id/gallery  body: { url: "<url>" }
async function removeGalleryImage(req, res, next) {
  try {
    const id = req.params.id;
    if (String(id) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: "url required in body" });

    const user = await User.findByIdAndUpdate(id, { $pull: { gallery: url } }, { new: true }).select("-passwordHash -refreshTokens");
    res.json({ success: true, data: user.gallery, message: "Image removed from gallery" });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, uploadProfilePicture, getGallery, addGalleryImage, removeGalleryImage };
