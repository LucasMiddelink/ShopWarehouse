import express from 'express';
import authControllers from '../controllers/authControllers.js';
import authMiddleware from '../config/authMiddleware.js';

const router = express.Router();

// Public
router.post('/register/customer', authControllers.registerCustomer);
router.post('/login', authControllers.login);

// Protected
router.post('/register/employee', authMiddleware.requireEmployeeOrAdmin, authControllers.registerEmployee);
router.post('/register/admin', authMiddleware.requireEmployeeOrAdmin, authControllers.registerAdmin);
router.post('/logout', authMiddleware.requireAuth, authControllers.logout);

router.get('/me', authMiddleware.requireAuth, authControllers.getCurrentUser);

export default router;