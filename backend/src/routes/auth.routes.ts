import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  loginBodySchema,
  registerBodySchema,
  setPasswordBodySchema,
  updateProfileBodySchema,
} from '../schemas/auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerBodySchema }), authController.register);
authRouter.post('/login', validate({ body: loginBodySchema }), authController.login);
// Sign in with Google: the browser navigates to /google (or /google/link from /settings) and Google
// sends it back to /google/callback, which handles both
authRouter.get('/google', authController.startGoogle);
authRouter.get('/google/link', requireAuth, authController.startGoogleLink);
authRouter.get('/google/callback', authController.googleCallback);
// No requireAuth: logging out with an expired session must still clear the cookie
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.put('/me', requireAuth, validate({ body: updateProfileBodySchema }), authController.updateMe);
// Sign-in methods, shown in /settings
authRouter.get('/methods', requireAuth, authController.methods);
authRouter.delete('/methods/google', requireAuth, authController.unlinkGoogle);
authRouter.post('/password', requireAuth, validate({ body: setPasswordBodySchema }), authController.setPassword);
