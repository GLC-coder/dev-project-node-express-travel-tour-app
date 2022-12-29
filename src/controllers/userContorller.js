import User from '../models/UserModel.js';
import catchAsyncError from '../utils/catchAsyncError.js';
import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

//Only admin has the permission to update a user Except update the user password
export const updateUser = updateOne(User);

//Only admin has the permission to delete a user
export const deleteUser = deleteOne(User);

//This is for admin only
export const getAllUsers = getAll(User);

export const getUser = getOne(User);

export const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined! Please use /signup instead!',
  });
};
//User update hiself/ herself data except updateing the password
const filterObj = (obj, ...args) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (args.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};
export const updateMe = catchAsyncError(async (req, res, next) => {
  //Create an error if user try to update password here
  if (req.body.password || req.body.passwordConfirm) {
    return next(new Error('Can not update password here', 400));
  }

  //Filter the body if user trys to update the not allowed fields
  const filteredBody = filterObj(req.body, 'name', 'email');
  console.log('first');
  //Update the user date
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      active: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  console.log(req.params.id);
  next();
};

/**Get all users */
// export const getAllUsers = catchAsyncError(async (req, res) => {
//   //Don't return the "__v" to the client by using select("-__v")
//   const users = await User.find().select("-__v");
//   res.status(200).json({
//     status: "success",
//     data: {
//       users,
//     },
//   });
// });
