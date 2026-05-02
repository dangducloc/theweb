// src/routes/user.routes.js
import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { registerSchema, updateUserSchema } from '../validations/schemas.js';

const router = Router();

// All user management → ADMIN only
router.use(authenticate, authorize('ADMIN'));

router.get('/',      userController.getUsers);
router.get('/:id',   userController.getUser);
router.post('/',     validate(registerSchema),   userController.createUser);
router.put('/:id',   validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;