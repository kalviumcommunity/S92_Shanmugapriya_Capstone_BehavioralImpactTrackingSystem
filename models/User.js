const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  name: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  authProvider: { type: String, enum: ['password', 'google'], default: 'password' },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);