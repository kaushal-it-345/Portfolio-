const jwt = require('jsonwebtoken');

/**
 * Practical 7: Authentication Middleware
 * 
 * Flow:
 * Client Request (Authorization: Bearer <token>)
 *   -> verifies token
 *   -> req.user = decoded
 *   -> next()
 * 
 * Error Handling:
 * - Missing or malformed header -> 401 Unauthorized
 * - Invalid, expired, or tampered token -> 401 Unauthorized (wrapped in try/catch)
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is present
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No authorization header provided. Expected: Authorization: Bearer <token>'
      });
    }

    // Verify 'Bearer ' prefix and extract token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Malformed authorization header. Expected format: Bearer <token>'
      });
    }

    const token = parts[1];
    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Token is missing.'
      });
    }

    // Verify token with secret from environment variable
    const jwtSecret = process.env.JWT_SECRET || 'charusat_practical_7_jwt_secret_key_2026_itue301';
    const decoded = jwt.verify(token, jwtSecret);

    // Attach decoded user payload to request object
    req.user = decoded;
    next();
  } catch (error) {
    // Handling specific JWT error cases without crashing the server
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired. Please log in again.',
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Authentication failed.'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Authentication error: ' + error.message
    });
  }
};

module.exports = authMiddleware;
