import * as dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import errorMiddleware from './middleware/errorMiddleware';
import ErrorModel from './utils/errorModel';
import rateLimitMiddleware from './middleware/rateLimitMiddleware';

import tourRouter from './routers/tourRouter';
import userRouter from './routers/userRouter';
import reviewRouter from './routers/reviewRouter';

dotenv.config();
const app = express();

app.use(cors());
//Set Security Headers
app.use(helmet());
//Body parser
app.use(express.json({ limit: '10kb' }));
//Data sanilization against NoSQL Query Injection
app.use(mongoSanitize());
//Data sanilization against XSS
app.use(xss());
//preventing parameters pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  })
);
//Set limit requests from same IP address
app.use('/api', rateLimitMiddleware);
//Development logging
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

//server static files from a folder instead of routers.
app.use(express.static('./public'));

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//wrong router error handling
app.all('*', (req, res, next) => {
  //method 1
  // const error = new Error(`Can't find${req.originalUrl} on this router`);
  // error.statusCode = 404;
  // error.status = "fail";
  // next(error);
  //method 2: new an error via erroModel class ;
  const error = new ErrorModel(
    `Can't find${req.originalUrl} on this router`,
    404
  );
  next(error);
});

//use the global error middleware
app.use(errorMiddleware);

export default app;
