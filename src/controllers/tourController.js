/* eslint-disable no-useless-return */
import Tour from '../models/TourModel';
import catchAsyncError from '../utils/catchAsyncError';
import {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} from './handlerFactory';
import ErrorModel from '../utils/errorModel';
// import APIFeatures from "../utils/apiFeatures-model.js";

/*use handlerFactorry */
export const createTour = createOne(Tour);

export const updateTour = updateOne(Tour);

export const deleteTour = deleteOne(Tour);

export const getTour = getOne(Tour, 'reviews');

export const getAllTours = getAll(Tour);

export const getTourStatistics = catchAsyncError(async (req, res, next) => {
  const tourStatistics = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        //_id: null,
        //_id: "$difficulty",
        // _id: "$ratingsAverage",
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // { $match: { _id: { $ne: "EASY" } } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      tourStatistics,
    },
  });
  return;
});

export const getMonthlyPlan = catchAsyncError(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { numTourStarts: -1 } },
    { $limit: 12 },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
  return;
});

/**Geospatial Data query from req.params
 *  /tours-within/400/center/34.066486, -118.204371/unit/mi
 */
export const getTourWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;

  /*here is using earth special methods to find the unit is equol to "mi" 
  or "kilometers"
  */
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      ErrorModel(
        'Please provide latitute and longtitude i the format: lat, lng.',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

/**Get the distance for all tours to a certain location */
export const getDistances = catchAsyncError(async (req, res, next) => {
  const { latlng, unit } = req.params;
  // 1 meter = 0.000621371 mile
  const multipler = unit === 'mi' ? 0.000621371 : 0.001;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      ErrorModel(
        'Please provide latitute and longtitude i the format: lat, lng.',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    {
      /**
       *  For geospatial aggregate, the $geoNear MUST be  Always the first stage ;
       *  if the tour has an aggregate middleware in other place it also will affect it
       */
      $geoNear: {
        near: {
          /**For geospatial aggregate, use the near fileld require at least one geospatial index
           * has been defined: here is the startLocation defined befor
           */
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multipler, //This is used to tranform meters to kilometers
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',

    data: {
      data: distances,
    },
  });
});
/*Method 2: create, delete, update, getOne, getAll tour*/
/**Create a new tour */

// export const createTour = catchAsyncError(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);
//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour,
//     },
//   });
//   return;
// });

/*Update a tour */

// export const updateTour = catchAsyncError(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!tour) {
//     next(new ErrorModel(`No tour found by that ID ${req.params.id}`, 404));
//     return;
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   return;
// });

/**delete a tour by tourid */

// export const deleteTour = catchAsyncError(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     next(new ErrorModel(`No tour found by that ID ${req.params.id}`, 404));
//     return;
//   }
//   res.status(204).json({
//     status: "success",
//     data: null,
//   });
//   return;
// });

/*Get a tour */

// export const getTour = catchAsyncError(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id)
//     .select("-__v")
//     .populate("reviews");

//   //const tour = await Tour.findOne({_id: req.params.id})
//   if (!tour) {
//     next(new ErrorModel(`No tour found by that ID ${req.params.id}`, 404));
//     return;
//   }
//   res.status(200).json({
//     status: "success",
//     data: {
//       tour,
//     },
//   });
//   return;
// });

/**Get all tour */

// export const getAllTours = catchAsyncError(async (req, res, next) => {
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .pagination();

//   const tours = await features.query;
//   // Sent the response
//   res.status(200).json({
//     status: "success",
//     requestTime: req.requestTime,
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });
//   // // eslint-disable-next-line no-useless-return
//   return;
// });
