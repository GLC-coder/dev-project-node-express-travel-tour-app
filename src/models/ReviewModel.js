import mongoose from 'mongoose';
import Tour from './TourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user!'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// unique compound index
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name",
  // });
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});
/*Create a static method for calculating the averagedRating and total rating number 
after the review posted by a user and updating the averagedRating and rating number
to related tour
*/
/**
 * Static method will be called by the Model itself/class, and this in this method
 * always points to the Model
 */
reviewSchema.statics.calcAverageRating = async function (tourId) {
  // This points to the current model-Review
  const ratingStatistic = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        averRating: { $avg: '$rating' },
      },
    },
  ]);

  if (ratingStatistic.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: ratingStatistic[0].averRating,
      ratingsQuantity: ratingStatistic[0].nRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
reviewSchema.post('save', async function () {
  //This here points to the current document: new review
  await this.constructor.calcAverageRating(this.tour);
});

/*update and delete the review averageRating and rating number for a tour
Fristly: find the current review document by the current query
this here points to the current query for current review
*/
reviewSchema.pre(/^findOneAnd/, async function (next) {
  //this.review here points to the current review document
  this.review = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calcAverageRating(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
