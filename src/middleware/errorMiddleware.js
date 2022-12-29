import ErrorModel from '../utils/errorModel.js';

const handleCastError = (error) => {
  const message = `Invalid ${error.path} : ${error.value}`;
  return new ErrorModel(message, 400);
};

const handleDuplicatedError = (error) => {
  const message = `Duplicated field value : ${error.keyValue.name} has existed, please enter another again !`;
  return new ErrorModel(message, 400);
};

const handleValidationError = (error) => new ErrorModel(error.message, 400);

const handleJWTError = (error) =>
  new ErrorModel(
    `${error.message},please log in again to get the permission!`,
    401
  );

const handlerTokenExpiredError = (error) =>
  new ErrorModel(
    'Your Token has expired, please log in again to get the permission!',
    401
  );

const sendErrorDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorPro = (error, res) => {
  //Operatinal error: send message to the client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
    //Programmal error or other error: Don't leak error details
  } else {
    //log error to the console
    console.error('ERROR:😩', error);
    //send the error message to client
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const errorMiddleware = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (error.name === 'CastError') {
      error = handleCastError(error);
    }
    if (error.name === 'MongoError' || error.code === 11000) {
      error = handleDuplicatedError(error);
    }
    if (error.name === 'ValidationError') {
      error = handleValidationError(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(error);
    }
    if (error.name === 'TokenExpiredError') {
      error = handlerTokenExpiredError(error);
    }
    sendErrorPro(error, res);
  }
};
export default errorMiddleware;
