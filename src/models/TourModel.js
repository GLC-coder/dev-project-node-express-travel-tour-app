import mongoose from 'mongoose';
// import validator from "validator";
import slugify from 'slugify';

// new a tourSchema
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less or equal then 40 characters'],
      minlength: [10, 'A  tour must have more or equal than 10 characters!'],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
      //This is a validate using the validator library
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          "{VALUE} is not a valid difficulty value, please choose from 'easy', 'medium', 'difficult'",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (value) => Math.round(value * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      //Note!!! This validator works only on creating a new document, is not available on updating document
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'This discount price ({VALUE}) is not less than the price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a imageCover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secreteTour: {
      type: Boolean,
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
//Compound Index for price, ratingaverage
tourSchema.index({ price: 1, ratingsAverage: -1 });
//Index for slug
tourSchema.index({ slug: 1 });
//Index for a geospatial location-this is very special for geospatial index on earth
tourSchema.index({ startLocation: '2dsphere' });

//virtual property
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//virtual populate for tour' review field
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//Mongoose document middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre('save', (next) => {
  console.log('Add a new schema value');
  next();
});
tourSchema.post('save', (doc, next) => {
  next();
});

//Mongoose query middleware
// tourSchema.pre("find", function (next) {
//   this.find({ secreteTour: { $ne: true } });
//   next();
// });
// tourSchema.pre("findOne", function (next) {
//   this.findOne({ secreteTour: { $ne: true } });
//   next();
// });
// query middleware :method 2: for find all or findOne

//Create embedded guide user documents into a tour document,

// Note, this works only on creating a new tour, not works on updating the tour
// tourSchema.pre("save", async function (next) {
//   const guidesPromise = this.guides.map(
//     async (id) => await User.findById({ _id: id })
//   );
//   console.log(guidesPromise[0]);
//   this.guides = await Promise.all(guidesPromise);

//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.find({ secreteTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});

tourSchema.post(/^find/, (_docs, next) => {
  next();
});
//aggregation middleware
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secreteTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });
//transfor the schema to model, so we can use it, model is a bit like the class in Javascript
const Tour = mongoose.model('Tour', tourSchema);

export default Tour;
