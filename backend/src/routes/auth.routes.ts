import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginBodySchema, registerBodySchema, updateProfileBodySchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerBodySchema }), authController.register);
authRouter.post('/login', validate({ body: loginBodySchema }), authController.login);
// Sign in with Google: the browser navigates to the first one, Google sends it back to the second
authRouter.get('/google', authController.startGoogle);
authRouter.get('/google/callback', authController.googleCallback);
// No requireAuth: logging out with an expired session must still clear the cookie
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.put('/me', requireAuth, validate({ body: updateProfileBodySchema }), authController.updateMe);
