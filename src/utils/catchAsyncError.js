const catchAsyncError = (fc) => (req, res, next) =>
  fc(req, res, next).catch((error) => {
    next(error);
  });

export default catchAsyncError;
