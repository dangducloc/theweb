// src/routes/auth.routes.js
import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { registerSchema, loginSchema } from '../validations/schemas.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login',    validate(loginSchema),    authController.login);
router.get('/me',        authenticate,             authController.getMe);

export default router;