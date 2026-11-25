const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { sendEmail } = require('../services/emailService');

// In-memory fallback store for offline/graceful mode
const memoryUsers = [];

// Helper to generate JWT token with customizable expiration
const generateToken = (id, name, email, rememberMe = false) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_smartexpense_2026';
  const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
  return jwt.sign({ id, name, email }, secret, {
    expiresIn,
  });
};

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(String(email).trim());
};

// 1. Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const trimmedName = name.trim();
    const cleanEmail = email.toLowerCase().trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters long' });
    }

    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const isConnected = getIsConnected();

    if (isConnected) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: trimmedName,
        email: cleanEmail,
        password: hashedPassword,
      });

      const token = generateToken(user._id, user.name, user.email, false);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to SmartExpense-AI.',
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
      const existing = memoryUsers.find((u) => u.email === cleanEmail);
      if (existing) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        _id: 'user_' + Date.now(),
        name: trimmedName,
        email: cleanEmail,
        password: hashedPassword,
        profileImage: '',
        currency: 'INR',
        createdAt: new Date(),
      };

      memoryUsers.push(newUser);
      const token = generateToken(newUser._id, newUser.name, newUser.email, false);

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to SmartExpense-AI.',
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
    return res.status(500).json({ success: false, message: error.message || 'Server Error during registration' });
  }
};

// 2. Login User
const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Invalid email address format' });
    }

    const isConnected = getIsConnected();

    if (isConnected) {
      let user = await User.findOne({ email: cleanEmail });
      if (!user) {
        // Auto-provision user account on sign in with Gmail / Email if not exists
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const cleanName = cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
        const formattedName = cleanName.length > 0
          ? cleanName.replace(/\b\w/g, (c) => c.toUpperCase())
          : 'User';

        user = await User.create({
          name: formattedName,
          email: cleanEmail,
          password: hashedPassword,
        });

        const token = generateToken(user._id, user.name, user.email, !!rememberMe);

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
        });

        return res.json({
          success: true,
          message: 'Sign in successful! Account created.',
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

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.name, user.email, !!rememberMe);

      // Set HTTP-Only Cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: 'Login successful! Welcome back.',
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
      let user = memoryUsers.find((u) => u.email === cleanEmail);

      if (!user) {
        // Auto-provision user account on sign in with Gmail / Email in memory mode
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const cleanName = cleanEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim();
        const formattedName = cleanName.length > 0
          ? cleanName.replace(/\b\w/g, (c) => c.toUpperCase())
          : 'User';

        user = {
          _id: 'user_' + Date.now(),
          name: formattedName,
          email: cleanEmail,
          password: hashedPassword,
          profileImage: '',
          currency: 'INR',
          createdAt: new Date(),
        };
        memoryUsers.push(user);

        const token = generateToken(user._id, user.name, user.email, !!rememberMe);

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
        });

        return res.json({
          success: true,
          message: 'Sign in successful! Account created.',
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImage: '',
            currency: 'INR',
            token,
          },
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id, user.name, user.email, !!rememberMe);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: 'Login successful! Welcome back.',
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
    return res.status(500).json({ success: false, message: error.message || 'Server Error during login' });
  }
};

// 3. Get Current Authenticated User (GET /api/auth/me)
const getMe = async (req, res) => {
  try {
    const isConnected = getIsConnected();
    if (isConnected) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User account not found' });
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
    return res.status(500).json({ success: false, message: error.message || 'Error fetching profile' });
  }
};

// 4. Update Profile
const updateProfile = async (req, res) => {
  try {
    const { name, currency, notificationPreferences, profileImage } = req.body;
    const isConnected = getIsConnected();

    let finalProfileImage = profileImage;
    if (req.file) {
      finalProfileImage = `/uploads/${req.file.filename}`;
    }

    if (isConnected) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (name) user.name = name.trim();
      if (currency) user.currency = currency;
      if (finalProfileImage !== undefined) user.profileImage = finalProfileImage;
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
        if (name) memoryUsers[userIndex].name = name.trim();
        if (currency) memoryUsers[userIndex].currency = currency;
        if (finalProfileImage !== undefined) memoryUsers[userIndex].profileImage = finalProfileImage;
      }
      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: req.user.id,
          name: name ? name.trim() : req.user.name,
          email: req.user.email,
          currency: currency || 'INR',
          profileImage: finalProfileImage !== undefined ? finalProfileImage : (req.user.profileImage || ''),
        },
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error updating profile' });
  }
};

// 5. Change Password (Authenticated)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const isConnected = getIsConnected();
    if (isConnected) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();
    } else {
      const user = memoryUsers.find((u) => u._id === req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error changing password' });
  }
};

// 6. Forgot Password (POST /api/auth/forgot-password)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please enter your registered email' });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address' });
    }

    const isConnected = getIsConnected();
    let user;

    if (isConnected) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryUsers.find((u) => u.email === cleanEmail);
    }

    if (!user) {
      // Security best practice: don't reveal account non-existence to avoid user enumeration
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.',
      });
    }

    // Generate secure, random, single-use reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Store only the HASHED reset token in MongoDB for security (SHA-256)
    const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 15-minute token expiration
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    if (isConnected) {
      user.resetPasswordToken = hashedResetToken;
      user.resetPasswordExpire = tokenExpiry;
      await user.save();
    } else {
      user.resetPasswordToken = hashedResetToken;
      user.resetPasswordExpire = tokenExpiry;
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; background: #0b0f17; color: #e2e8f0; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #6366f1; font-size: 24px; font-weight: 800; margin: 0;">SmartExpense-AI</h1>
          <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Password Reset Request</p>
        </div>
        <p style="font-size: 15px; color: #f1f5f9; line-height: 1.6;">Hello <strong>${user.name || 'User'}</strong>,</p>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          You requested a password reset for your SmartExpense-AI account. Click the button below to establish a new password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);">
            Reset Password
          </a>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
          ⏱️ This link is single-use and will expire in <strong>15 minutes</strong>.
        </p>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748b;">
          If you didn't request a password reset, you can safely ignore this email. Your account remains protected.
        </div>
      </div>
    `;

    console.log(`🔑 [Password Reset Token Generated] For: ${user.email} | URL: ${resetUrl}`);

    await sendEmail({
      to: user.email,
      subject: 'SmartExpense-AI — Password Reset Link (Valid for 15 minutes)',
      html,
      text: `Reset your SmartExpense-AI password by clicking: ${resetUrl} (Valid for 15 minutes)`,
    });

    return res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      resetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error processing forgot password' });
  }
};

// 7. Reset Password (POST /api/auth/reset-password)
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Password reset token is required' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    // Hash the incoming plain token using SHA-256 to compare with stored hashed token
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');

    const isConnected = getIsConnected();
    let user;

    if (isConnected) {
      user = await User.findOne({
        resetPasswordToken: hashedResetToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired (15-minute limit exceeded)',
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      // Invalidate the reset token immediately (single-use protection)
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    } else {
      user = memoryUsers.find(
        (u) =>
          u.resetPasswordToken === hashedResetToken &&
          u.resetPasswordExpire &&
          new Date(u.resetPasswordExpire).getTime() > Date.now()
      );

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Password reset token is invalid or has expired (15-minute limit exceeded)',
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      // Invalidate single-use token
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
    }

    return res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error resetting password' });
  }
};

// 8. Logout User (POST /api/auth/logout)
const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Error during logout' });
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
  logoutUser,
  memoryUsers,
};
