import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId, email, role) => {
  if (!userId || !email || !role) {
    throw new Error('userId, email, and role are required');
  };

  if (!JWT_SECRET || !JWT_EXPIRES_IN) {
    throw new Error('JWT configuration missing');
  };

  try {
    return jwt.sign(
      {
        userId,
        email,
        role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  };
};

// public endpoint - anyone can register
const registerCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    };

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    };

    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    };

    // Hash password
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, 'customer']
    );

    const newUser = result.rows[0];

    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.status(201).json({
      message: 'Customer registered successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role
      },
      token
    });

  } catch (error) {
    console.error('Register customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// admin only
const registerEmployee = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create employee accounts' });
    };

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    };

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    };

    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    };

    // Hash password
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, 'employee']
    );

    const newEmployee = result.rows[0];

    res.status(201).json({
      message: 'Employee account created successfully',
      user: {
        id: newEmployee.id,
        email: newEmployee.email,
        role: newEmployee.role
      }
    });

  } catch (error) {
    console.error('Register employee error:', error);
    res.status(500).json({ error: 'Server error' });
  };
};

// admin only
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create admin accounts' });
    };

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    };

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    };

    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    };

    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, hashedPassword, 'admin']
    );

    const newAdmin = result.rows[0];

    res.status(201).json({
      message: 'Admin account created successfully',
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });

  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({ error: 'Server error' });
  };
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1', 
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    };

    const user = result.rows[0];

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  };
};

// all users
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    };

    const result = await pool.query('SELECT id, email, password, role FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    };

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    };

    const token = generateToken(user.id, user.email, user.role);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  };
};

// Frontend deletes the token from storage
const logout = async (req, res) => {
  try {
    
    res.status(200).json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  };
};

export default {
  generateToken,
  registerCustomer,
  registerEmployee,
  registerAdmin,
  login,
  getCurrentUser,
  logout
};