import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/index.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: {
          message: 'Username and password are required',
        },
      });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user) {
      logger.warn('Login attempt with invalid username', { username });
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
        },
      });
    }

    // Verify password
    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { username });
      return res.status(401).json({
        error: {
          message: 'Invalid credentials',
        },
      });
    }

    // Generate token
    const token = generateToken(user);

    logger.info('User logged in successfully', {
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: {
        message: 'Login failed',
      },
    });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, username, name, role, created_at FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
        },
      });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to get user information',
      },
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          message: 'Current password and new password are required',
        },
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: {
          message: 'New password must be at least 8 characters long',
        },
      });
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: {
          message: 'User not found',
        },
      });
    }

    // Verify current password
    const isValidPassword = bcrypt.compareSync(currentPassword, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: 'Current password is incorrect',
        },
      });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password
    db.prepare('UPDATE users SET password = ?, updated_at = datetime(\'now\') WHERE id = ?').run(
      hashedPassword,
      req.user.id
    );

    logger.info('Password changed successfully', {
      userId: req.user.id,
      username: req.user.username,
    });

    res.json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to change password',
      },
    });
  }
});

// Logout (client-side token removal, but we log it)
router.post('/logout', authenticateToken, (req, res) => {
  logger.info('User logged out', {
    userId: req.user.id,
    username: req.user.username,
  });

  res.json({
    message: 'Logged out successfully',
  });
});

export default router;