import express from 'express';
import authCtrl from '../../controllers/auth.js';
import { validatedContacts, authenticate, upload, resizeAvatar } from '../../middlewares/index.js';
import * as userSchemas from '../../models/User.js';

const authRouter = express.Router();

authRouter.post('/register', validatedContacts(userSchemas.userRegisterSchema), authCtrl.register);

authRouter.get('/verify/:verificationCode', authCtrl.verify);

authRouter.post('/verify', validatedContacts(userSchemas.userEmailSchema), authCtrl.resendVerifyEmail);

authRouter.post('/login', validatedContacts(userSchemas.userLoginSchema), authCtrl.login);

authRouter.get('/current', authenticate, authCtrl.getCurrent);

authRouter.post('/logout', authenticate, authCtrl.logout);

authRouter.patch('/current/subscription', authenticate, validatedContacts(userSchemas.userSubscriptionSchema), authCtrl.patchSubscription);

authRouter.patch('/avatars', authenticate, upload.single('avatar'), resizeAvatar, authCtrl.updateAvatar)


export default authRouter;