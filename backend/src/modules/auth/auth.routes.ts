import { Router } from 'express';
import { authController } from './auth.controller';
import { validate, RegisterSchema, LoginSchema } from './auth.dto';

const router = Router();

router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);

export { router as authRoutes };
