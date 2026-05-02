// src/routes/item.routes.js
import { Router } from 'express';
import * as itemController from '../controllers/item.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { createItemSchema, updateItemSchema } from '../validations/schemas.js';

const router = Router();

// All item routes require authentication
router.use(authenticate);

router.get('/',          itemController.getItems);
router.get('/low-stock', itemController.getLowStock);
router.get('/:id',       itemController.getItem);

// Only ADMIN can create/update/delete
router.post('/',    authorize('ADMIN'), validate(createItemSchema), itemController.createItem);
router.put('/:id',  authorize('ADMIN'), validate(updateItemSchema), itemController.updateItem);
router.delete('/:id', authorize('ADMIN'),                           itemController.deleteItem);

export default router;