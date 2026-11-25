const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { sendEmail } = require('../services/emailService');

// In-memory fallback store for offline/demo mode
const memoryUsers = [];

const generateToken = (id, name, email) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_smartexpense_2026';
  return jwt.sign({ id, name, email }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const isConnected = getIsConnected();

    if (isConnected) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const token = generateToken(user._id, user.name, user.email);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          currency: user.currency,
          token,
        },
      });
    } else {
      // In-memory fallback
      const existing = memoryUsers.find((u) => u.email === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'user_' + Date.now(),
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        profileImage: '',
        currency: 'INR',
        createdAt: new Date(),
      };

      memoryUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.name, newUser.email);

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          profileImage: newUser.profileImage,
          currency: newUser.currency,
          token,
        },
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const isConnected = getIsConnected();

    if (isConnected) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.name, user.email);

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          currency: user.currency,
          notificationPreferences: user.notificationPreferences,
          token,
        },
      });
    } else {
      let user = memoryUsers.find((u) => u.email === email.toLowerCase());

      // Create initial demo user if memory store empty
      if (!user && (email.toLowerCase() === 'demo@smartexpense.ai' || email.toLowerCase() === 'thanuja@smartexpense.ai')) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = {
          _id: 'user_demo_101',
          name: 'Thanuja',
          email: email.toLowerCase(),
          password: hashedPassword,
          profileImage: '',
          currency: 'INR',
        };
        memoryUsers.push(user);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.name, user.email);

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage || '',
          currency: user.currency || 'INR',
          token,
        },
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// Get Me
const getMe = async (req, res) => {
  try {
    const isConnected = getIsConnected();
    if (isConnected) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.json({ success: true, data: user });
    } else {
      const user = memoryUsers.find((u) => u._id === req.user.id) || {
        _id: req.user.id,
        name: req.user.name || 'User',
        email: req.user.email || 'user@smartexpense.ai',
        currency: 'INR',
        profileImage: '',
      };
      const { password, ...userData } = user;
      return res.json({ success: true, data: userData });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, currency, notificationPreferences, profileImage } = req.body;
    const isConnected = getIsConnected();

    if (isConnected) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) user.name = name;
      if (currency) user.currency = currency;
      if (profileImage !== undefined) user.profileImage = profileImage;
      if (notificationPreferences) user.notificationPreferences = notificationPreferences;

      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          currency: user.currency,
          notificationPreferences: user.notificationPreferences,
        },
      });
    } else {
      const userIndex = memoryUsers.findIndex((u) => u._id === req.user.id);
      if (userIndex !== -1) {
        if (name) memoryUsers[userIndex].name = name;
        if (currency) memoryUsers[userIndex].currency = currency;
        if (profileImage !== undefined) memoryUsers[userIndex].profileImage = profileImage;
      }
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: req.user.id,
          name: name || req.user.name,
          email: req.user.email,
          currency: currency || 'INR',
          profileImage: profileImage || '',
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    const isConnected = getIsConnected();
    if (isConnected) {
      const user = await User.findById(req.user.id);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
    }
    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const html = `
      <h3>SmartExpense-AI Password Reset</h3>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="padding:10px 20px; background:#4F46E5; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail({ to: email, subject: 'SmartExpense-AI Password Reset Request', html });
    return res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    return res.json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  memoryUsers,
};
