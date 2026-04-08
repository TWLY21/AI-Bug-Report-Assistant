import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../../middleware/auth.js';
import { register, login, me } from './auth.controller.js';
import { registerSchema, loginSchema } from './auth.validation.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), register);
authRouter.post('/login', validate({ body: loginSchema }), login);
authRouter.get('/me', requireAuth, me);
