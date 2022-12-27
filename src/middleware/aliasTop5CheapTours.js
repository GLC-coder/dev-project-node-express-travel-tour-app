const aliasTop5CheapTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage, summary,difficulty';
  next();
};

export default aliasTop5CheapTours;
