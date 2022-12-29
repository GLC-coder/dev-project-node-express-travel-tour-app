import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel.js';
import catchAsyncError from '../utils/catchAsyncError.js';
import ErrorModel from '../utils/errorModel.js';

const protectMiddleware = catchAsyncError(async (req, res, next) => {
  // 1)Check if the token is exsited
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorModel('You must log in to get the permisssion!', 401));
  }

  // 2)Check if the token is valid or unexpired
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3)Check if the user is still exsited after the token issued
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new ErrorModel('The user of the token has deleted', 401));
  }
  // 4)Check if the user change the password after the token issued
  //Create a schema instance for checking if the password has been changed after it was issued
  if (currentUser.changePasswordAfter(decoded.iat)) {
    return next(
      new ErrorModel(
        'The password has been changed after it was issued! please log in again!',
        401
      )
    );
  }
  req.user = currentUser;
  console.log(req.user);
  next();
});

export default protectMiddleware;
