import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    };

    // Extracting token "Bearer eyJhbGciOiJIUz"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    };

    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    };
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    };
    res.status(500).json({ error: 'Server error' });
  };
};

// for any role
const requireAuth = (req, res, next) => {
  verifyToken(req, res, next);
};

const requireEmployeeOrAdmin = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'employee' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Employee or admin access required' });
    };
    next();
  });
};

const requireAdmin = async (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

export default {
  verifyToken,
  requireAuth,
  requireEmployeeOrAdmin,
  requireAdmin
};