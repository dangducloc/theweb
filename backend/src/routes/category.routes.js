// src/routes/category.routes.js
import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { categorySchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',     categoryController.getCategories);
router.get('/:id',  categoryController.getCategory);

router.post('/',      authorize('ADMIN'), validate(categorySchema), categoryController.createCategory);
router.put('/:id',    authorize('ADMIN'), validate(categorySchema), categoryController.updateCategory);
router.delete('/:id', authorize('ADMIN'),                           categoryController.deleteCategory);

export default router;