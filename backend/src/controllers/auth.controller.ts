import type { RequestHandler } from 'express';
import * as authService from '../services/auth.service.js';
import { clearSessionCookie, setSessionCookie } from '../lib/sessionCookie.js';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema.js';

type NoParams = Record<string, string>;

// The token only travels in the httpOnly cookie, never in the JSON body:
// that way the frontend's JavaScript never touches it
export const register: RequestHandler<NoParams, unknown, RegisterInput> = async (req, res) => {
  const { user, token } = await authService.register(req.body);
  setSessionCookie(res, token);
  res.status(201).json(user);
};

export const login: RequestHandler<NoParams, unknown, LoginInput> = async (req, res) => {
  const { user, token } = await authService.login(req.body);
  setSessionCookie(res, token);
  res.json(user);
};

// A JWT cannot be revoked on the server: logging out means deleting the cookie in the browser
export const logout: RequestHandler = (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
};

export const me: RequestHandler = async (req, res) => {
  res.json(await authService.getCurrentUser(req.userId));
};
