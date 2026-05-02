import { Router } from 'express';
import { loginSchema, signupSchema } from '../validations/authSchema.js';
import { validate } from '../middleware/validate.js';
import { login, me, signup } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';


const router = Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);

export default router;
