import express from 'express';
import authCtrl from '../../controllers/auth.js';
import { validatedContacts, authenticate, } from '../../middlewares/index.js';
import * as userSchemas from '../../models/User.js';

const authRouter = express.Router();

authRouter.post('/register', validatedContacts(userSchemas.userRegisterSchema), authCtrl.register);

authRouter.post('/login', validatedContacts(userSchemas.userLoginSchema), authCtrl.login);

authRouter.get('/current', authenticate, authCtrl.getCurrent);

authRouter.post('/logout', authenticate, authCtrl.logout);

authRouter.patch('/current/subscription', authenticate, validatedContacts(userSchemas.userSubscriptionSchema), authCtrl.patchSubscription)


export default authRouter;