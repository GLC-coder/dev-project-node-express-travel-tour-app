import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';

import Tour from '../../src/models/TourModel';
import Review from '../../src/models/ReviewModel';
import User from '../../src/models/UserModel';

dotenv.config();
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('database connect successfully!'));

const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours.json', 'utf-8')
);

const users = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8')
);

//import all data once
const importData = async () => {
  try {
    await Tour.create(tours);
    // await User.create(users, { validateBeforeSave: false }); this is used for disabling the validation for passwordConfirm
    await User.create(users);
    await Review.create(reviews);
    console.log('ImportData successfully!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

//delete all data once
const clearData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--clear') {
  clearData();
}
