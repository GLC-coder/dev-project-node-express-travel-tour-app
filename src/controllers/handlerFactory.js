/* eslint-disable no-useless-return */
import catchAsyncError from '../utils/catchAsyncError.js';
import ErrorModel from '../utils/errorModel.js';
import APIFeatures from '../utils/apiFeatures-model.js';

export const deleteOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      next(new ErrorModel(`No ${doc} found by that ID ${req.params.id}`, 404));
      return;
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
    return;
  });

export const updateOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      next(new ErrorModel(`No ${doc} found by that ID ${req.params.id}`, 404));
      return;
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    return;
  });

export const createOne = (Model) =>
  catchAsyncError(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
    return;
  });

export const getOne = (Model, populateOptions) =>
  catchAsyncError(async (req, res, next) => {
    let query = Model.findById(req.params.id).select('-__v');
    if (populateOptions) query = query.populate(populateOptions);
    const doc = await query;

    //const tour = await Tour.findOne({_id: req.params.id})
    if (!doc) {
      next(new ErrorModel(`No ${doc} found by that ID ${req.params.id}`, 404));
      return;
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });

    return;
  });

export const getAll = (Model) =>
  catchAsyncError(async (req, res, next) => {
    //if there is a request getting reviews by tourId, then req.params.tourId should be true
    //if there is not a req.params.tourId, then it will get all tours
    //Thanks to mergeParams. this is allowed for nested routes to get review
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const doc = await features.query;
    // Sent the response
    res.status(200).json({
      status: 'success',
      requestTime: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
    return;
  });
