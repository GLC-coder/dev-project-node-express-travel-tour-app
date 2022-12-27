/* eslint-disable no-useless-return */
import Tour from '../models/TourModel';
import APIFeatures from '../utils/apiFeatures-model';
import ErrorModel from '../utils/errorModel';

export const createTour = async (req, res, next) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    const err = new ErrorModel(error.message, 404);
    next(err);
  }
  return;
};

export const getAllTours = async (req, res, next) => {
  try {
    // method1: gather all api features together
    //Build the query
    //1: Basic filetring
    // const queryObj = { ...req.query };
    // const excluedFileds = ["page", "sort", "limit", "fields"];

    // excluedFileds.forEach((el) => delete queryObj[el]);

    // //2:Advanced filtering (gt/gte/le/lte)
    // let queryString = JSON.stringify(queryObj);
    // queryString = queryString.replace(
    //   /\b(gt|gte|lt|lte)\b/g,
    //   (match) => `$${match}`
    // );

    // let query = Tour.find(JSON.parse(queryString));

    //3: Sorting
    // if (req.query.sort) {
    //   const queryBy = req.query.sort.split(",").join(" ");
    //   query = query.sort(queryBy);
    // } else {
    //   //if sort is not specified, sort by createdAt as decending order as default!
    //   query = query.sort("-createdAt");
    // }

    //4: fields limiting
    // if (req.query.fields) {
    //   const selectBy = req.query.fields.split(",").join(" ");
    //   query = query.select(selectBy);
    // } else {
    //   //Field "__v" can not be shown at any search requie
    //   query = query.select("-__v");
    // }

    //5:pagination with page and limit
    // const page = req.query.page * 1 || 1;
    // const limit = +req.query.limit * 1 || 10;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);

    // if (req.query.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) {
    //     throw new Error("This page does not exist!");
    //   }
    // }
    // const tours = await query;

    // Method 2: outsource out apiFeature as a class in middleware folder
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const tours = await features.query;
    // Sent the response
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    const err = new ErrorModel(error.message, 404);
    next(err);
  }
  // // eslint-disable-next-line no-useless-return
  return;
};

export const getTour = async (req, res, next) => {
  try {
    const tour = await Tour.findById(req.params.id);
    //const tour = await Tour.findOne({_id: req.params.id})
    if (!tour) {
      next(new ErrorModel(`No tour found by that ID ${req.params.id}`, 404));
      return;
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    const err = new ErrorModel(error.message, 404);
    next(err);
  }
  return;
};

export const updateTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tour) {
      next(new ErrorModel(`No tour found by that ID ${req.params.id}`, 404));
      return;
    }
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    const err = new ErrorModel(error.message, 404);
    next(err);
  }
  return;
};

export const deleteTour = async (req, res, next) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      next(new ErrorModel(`No tour found by that ID ${req.params.id}`, 404));
      return;
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    const err = new ErrorModel(error.message, 404);
    next(err);
  }
};

export const getTourStatistics = async (req, res, next) => {
  try {
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
  } catch (error) {
    const err = new ErrorModel(error.message, 404);
    next(err);
  }
};

export const getMonthlyPlan = async (req, res, next) => {
  try {
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
  } catch (error) {
    const err = new ErrorModel(error.message, 404);
    next(err);
  }
};
