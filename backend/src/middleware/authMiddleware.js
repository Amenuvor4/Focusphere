const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    console.log('Auth Header:', authHeader);

    // Extract token from "Bearer <token>"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1].trim();
    console.log('Extracted Token:', token ? token.substring(0, 20) + '...' : 'none');

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.userId) {
      console.error('Token is missing user ID information');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    console.log('Token decoded successfully, userID:', decoded.userId);

    // Check if the token has expired
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      console.error('Token has expired');
      return res.status(401).json({ message: 'Token has expired' });
    }

    //console.log('Current time:', now, 'Token expires:', decoded.exp, 'Difference:', decoded.exp - now);

    // Attach user ID as a string to the request for further use
    req.user = { id: decoded.userId.toString() };

    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = protect;

