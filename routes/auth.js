// routes/auth.js
// This is a NEW file — create it inside your routes folder

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /api/auth/register  -> called by Exp1.html's "Create Account" button
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, gender, phone } = req.body;

    // Check if this email is already registered
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Scramble the password before saving — this is what "hashing" means.
    // Even if someone sees the database, they cannot read the real password.
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      gender,
      phone
    });

    await newUser.save();
    res.status(201).json({ message: 'Registered successfully' });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login  -> called by Login.js
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'No account with this email' });
    }

    // Compare the typed password against the scrambled one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    res.json({ message: 'Login successful', name: user.fullName });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
