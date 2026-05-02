// src/routes/location.routes.js
import { Router } from 'express';
import * as locationController from '../controllers/location.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { locationSchema } from '../validations/schemas.js';

const router = Router();

router.use(authenticate);

router.get('/',     locationController.getLocations);
router.get('/:id',  locationController.getLocation);

router.post('/',      authorize('ADMIN'), validate(locationSchema), locationController.createLocation);
router.put('/:id',    authorize('ADMIN'), validate(locationSchema), locationController.updateLocation);
router.delete('/:id', authorize('ADMIN'),                           locationController.deleteLocation);

export default router;