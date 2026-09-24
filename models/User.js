const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // unique = no two accounts with same email
  password: { type: String, required: true }, // stored as a scrambled hash, never plain text
  gender: { type: String, required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', UserSchema);
