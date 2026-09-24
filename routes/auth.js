const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();
const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, gender, phone } = req.body || {};
    if (![fullName, email, password, gender, phone].every(
      (value) => typeof value === 'string' && value.trim()
    )) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    if (!emailPattern.test(email) || email.length > 254 || password.length < 12 || password.length > 128) {
      return res.status(400).json({ error: 'Enter a valid email and a password of 12–128 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({
      fullName: fullName.trim().slice(0, 100),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      gender: gender.trim().slice(0, 40),
      phone: phone.trim().slice(0, 30),
    });
    await user.save();
    return res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Email already registered' });
    console.error('Registration failed:', err.message);
    return res.status(500).json({ error: 'Could not complete registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' ||
        !emailPattern.test(email) || password.length > 128) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.json({ message: 'Login successful', name: user.fullName });
  } catch (err) {
    console.error('Login failed:', err.message);
    return res.status(500).json({ error: 'Could not complete login' });
  }
});

module.exports = router;
