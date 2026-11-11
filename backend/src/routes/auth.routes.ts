import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginBodySchema, registerBodySchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerBodySchema }), authController.register);
authRouter.post('/login', validate({ body: loginBodySchema }), authController.login);
// No requireAuth: logging out with an expired session must still clear the cookie
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
