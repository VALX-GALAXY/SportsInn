const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const users = require("../models/userModel");

const SECRET = "secret123";

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success:false, message:"Email & password required" });

  const exists = users.find(u => u.email === email);
  if (exists) return res.status(400).json({ success:false, message:"User exists" });

  const hash = await bcrypt.hash(password, 10);
  const user = { email, password: hash, bio:"", profilePic:"" };
  users.push(user);
  res.json({ success:true, data:{ email }, message:"User created" });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ success:false, message:"Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ success:false, message:"Invalid credentials" });

  const token = jwt.sign({ email }, SECRET, { expiresIn: "1h" });
  res.json({ success:true, data:{ token }, message:"Login successful" });
};

exports.updateProfile = (req, res) => {
  const { bio, profilePic } = req.body;
  const user = users.find(u => u.email === req.user.email);
  if (!user) return res.status(404).json({ success:false, message:"User not found" });

  if (bio) user.bio = bio;
  if (profilePic) user.profilePic = profilePic;
  res.json({ success:true, data:{ email:user.email, bio:user.bio, profilePic:user.profilePic }, message:"Profile updated" });
};
