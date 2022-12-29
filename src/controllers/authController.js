import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

import User from '../models/UserModel.js';
import catchAsyncError from '../utils/catchAsyncError.js';
import ErrorModel from '../utils/errorModel.js';
import sendEmail from '../utils/sendEmail.js';

//Create the token
const createToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
//SentTokenAndResponse
const sendResponseAndToken = (user, statusCode, res) => {
  //Create token
  const token = createToken(user._id);

  //Create cookie and then save the token to the cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);

  //Don't show the password to client when create a new user document
  user.password = undefined;

  //Send token to response body
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

//new user sign up and create a token for the user
export const signUp = catchAsyncError(async (req, res, next) => {
  // const newUser = await User.create({
  //   name: req.body.name,
  //   email: req.body.email,
  //   password: req.body.password,
  //   passwordConfirm: req.body.passwordConfirm,
  // });
  const newUser = await User.create(req.body);

  sendResponseAndToken(newUser, 201, res);
});

//user sign in and create a token for the user
//eslint-disable-next-line consistent-return
export const signIn = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //Check if the email and password is provided
  if (!email || !password) {
    next(new ErrorModel('Please enter your email or password!', 401));
    return;
  }

  //Check if the email and password is correct
  //Make sure return the email and password to the client by using select("+password") when do the sign in activity
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    next(new ErrorModel('Incorrect email or password!', 401));
    return;
  }
  //If everything is ok, send token to the client

  sendResponseAndToken(user, 201, res);
});

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new ErrorModel('Can not find user of thie email addresss.', 404)
    );

  //Create a reset password token
  const resetToken = user.createResetPasswordToken();

  //as we update the document in creating the password token,we need to save it to database
  await user.save({ validateBeforeSave: false });

  //3)Send the reset password token to user's email address
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/vi/users/resetpassword/${resetToken}`;
  const message = `Forgot your password? Submit a patch request with your new password and passwordConfirm to ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;
  const options = {
    email: user.email,
    subject: 'Your password reset token(valid for 10 mins)!',
    message,
  };
  try {
    await sendEmail(options);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ErrorModel(
        'There was an error sending the email, please try again later!',
        500
      )
    );
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email successfully!',
  });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  //1): Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorModel('Token is invalid or has expired', 400));
  }

  //2) If the token has not expired, and there is user, set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();

  //3)Update changedPasswordAt property for the user
  //4)Log the user in and send back the JWT TOKEN

  sendResponseAndToken(user, 201, res);
});

//Update the password during logging in instead of forgetting the password
export const updatePassword = catchAsyncError(async (req, res, next) => {
  //1)Get the user from the collection
  const user = await User.findById(req.user._id).select('+password');

  //Check if postedCurrent password is correct
  if (!(await user.correctPassword(req.body.curPassword, user.password))) {
    return next(new ErrorModel('Your current password is incorrect', 401));
  }
  //If so ,update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //Create and send back the JWT
  sendResponseAndToken(user, 200, res);
});
