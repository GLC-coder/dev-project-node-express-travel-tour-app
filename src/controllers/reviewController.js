import Review from '../models/ReviewModel.js';
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from './handlerFactory.js';
// import catchAsyncError from "../utils/catchAsyncError.js";

//create a new review by create factory, if use factory,
export const createReview = createOne(Review);

//Get review by get factory
export const getReview = getOne(Review);

//Only admin can Delete a review by id
export const deleteReview = deleteOne(Review);

//Only admin can Update a review by id
export const updateReview = updateOne(Review);

export const getAllReviews = getAll(Review);

/*Method 2: Create a new review*/
// export const createReview = catchAsyncError(async (req, res, next) => {
//   //Allow nested routes, so user can manually specify the useId and tourId
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user._id;
//   const newReview = await Review.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: {
//       review: newReview,
//     },
//   });
// });

/*Method 2:Get all reviews*/
// export const getAllReviews = catchAsyncError(async (req, res, next) => {
//   //if there is a request getting reviews by tourId, then req.params.tourId should be true
//   //if there is not a req.params.tourId, then it will get all tours
//   //Thanks to mergeParams
//   let filter = {};
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//   const reviews = await Review.find(filter).select("-__v");

//   res.status(200).json({
//     status: "success",
//     data: {
//       reviews,
//     },
//   });
// });
