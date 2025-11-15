import { Router } from 'express';
import { getUserProfile } from '../auth/auth.ts';
import { changePassword, userImageUpdate } from '../controllers/userController.ts';
const userRouter = Router();

// dummy route for single user
userRouter.get('/:userId', getUserProfile);
// user image uploader router
userRouter.put('/upload', userImageUpdate);
// new password
userRouter.post('/newpassword', changePassword);

export default userRouter;
