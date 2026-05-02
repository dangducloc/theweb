// src/routes/transaction.routes.js
import { Router } from 'express';
import * as txController from '../controllers/transaction.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { borrowSchema, returnSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',     txController.getTransactions);
router.get('/:id',  txController.getTransaction);

router.post('/borrow', validate(borrowSchema), txController.borrow);
router.post('/return', validate(returnSchema), txController.returnItem);

export default router;