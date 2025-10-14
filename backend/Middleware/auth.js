import jwt from 'jsonwebtoken';

// Simple auth middleware for testing - accepts any token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // For testing, let's allow requests without token
      req.user = { id: 'test-user-id' };
      return next();
    }

    try {
      // Verify token if provided
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = { id: decoded.userId || 'test-user-id' };
    } catch (error) {
      // If token is invalid, still allow with test user
      req.user = { id: 'test-user-id' };
    }
    
    next();
  } catch (error) {
    // Fallback to test user
    req.user = { id: 'test-user-id' };
    next();
  }
};

export default auth;