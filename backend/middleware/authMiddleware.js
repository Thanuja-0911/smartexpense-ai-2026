const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
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
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
