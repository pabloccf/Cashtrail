import type { RequestHandler } from 'express';
import * as categoryService from '../services/category.service.js';

export const list: RequestHandler = async (req, res) => {
  res.json(await categoryService.list(req.userId));
};
