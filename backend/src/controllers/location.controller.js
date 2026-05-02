// src/controllers/location.controller.js
import * as locationService from '../services/location.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getLocations = async (req, res, next) => {
  try {
    const data = await locationService.getAllLocations();
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getLocation = async (req, res, next) => {
  try {
    const data = await locationService.getLocationById(req.params.id);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const createLocation = async (req, res, next) => {
  try {
    const data = await locationService.createLocation(req.body);
    return sendCreated(res, data, 'Location created');
  } catch (err) { next(err); }
};

export const updateLocation = async (req, res, next) => {
  try {
    const data = await locationService.updateLocation(req.params.id, req.body);
    return sendSuccess(res, data, 'Location updated');
  } catch (err) { next(err); }
};

export const deleteLocation = async (req, res, next) => {
  try {
    await locationService.deleteLocation(req.params.id);
    return sendSuccess(res, null, 'Location deleted');
  } catch (err) { next(err); }
};
