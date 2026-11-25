const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // 1. Check Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
    } catch (e) {
      token = null;
    }
  }

  // 2. Check Cookie fallback (token=<token>)
  if (!token && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_smartexpense_2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains id, name, email
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, session expired or invalid token',
    });
  }
};

module.exports = { protect };
