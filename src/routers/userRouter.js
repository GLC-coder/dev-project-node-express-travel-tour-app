import express from 'express';

import {
  getAllUsers,
  getUser,
  getMe,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} from '../controllers/userContorller.js';
import {
  signUp,
  signIn,
  forgetPassword,
  resetPassword,
  updatePassword,
} from '../controllers/authController.js';
import protectMiddleware from '../middleware/protectMiddleware.js';
import restrictMiddleware from '../middleware/restrictMiddleware.js';

const router = express.Router();

// Sign Up router
router.post('/signup', signUp);
// Sign In router
router.post('/signin', signIn);
router.post('/forgetpassword', forgetPassword);
router.patch('/resetpassword/:token', resetPassword);

//Method 1
// router.use(protectMiddleware)
// all routers after this line are protected and neet to be authenticated to perform actions

//method2
router.get('/me', protectMiddleware, getMe, getUser);
router.route('/').get(protectMiddleware, getAllUsers);
router.patch('/updatepassword/', protectMiddleware, updatePassword);
router.patch('/updateme', protectMiddleware, updateMe);
router.delete('/deleteme', protectMiddleware, deleteMe);

//method1
//router.use(restrictMiddleware("admin"))
// all routers after this line are restricted to be admin

//method2
router
  .route('/:id')
  .get(protectMiddleware, restrictMiddleware('admin'), getUser)
  .patch(protectMiddleware, restrictMiddleware('admin'), updateUser)
  .delete(protectMiddleware, restrictMiddleware('admin'), deleteUser);

export default router;
