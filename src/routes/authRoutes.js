import express from 'express';
import { register, login, logout, refresh, signup, signin, signout } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/signup', signup);
router.post('/login', login);
router.post('/signin', signin);
router.post('/logout', logout);
router.post('/signout', signout);
router.post('/refresh', refresh);

export default router;
