import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: {
        message: 'Access token required',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Invalid token attempt', { error: error.message });
    return res.status(403).json({
      error: {
        message: 'Invalid or expired token',
      },
    });
  }
};

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Authentication required',
        },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });
      return res.status(403).json({
        error: {
          message: 'Insufficient permissions',
          requiredRoles: allowedRoles,
        },
      });
    }

    next();
  };
};

export const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};