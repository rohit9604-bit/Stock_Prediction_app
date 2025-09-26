import { Router } from 'express';
import { getAllUsers, signup, login } from '../controller/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { signupValidator, loginValidator } from '../validators/authValidators.js';

const router = Router();

// Public
router.post('/signup', signupValidator, signup);
router.post('/login', loginValidator, login);

// Protected
router.get('/users', requireAuth, getAllUsers);

export default router;
