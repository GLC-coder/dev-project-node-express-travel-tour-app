import ErrorModel from '../utils/errorModel';

//Only "admin" or "lead-guide" have the permission to delete a tour
const restrictMiddleware =
  (...role) =>
  (req, res, next) => {
    if (!role.includes(req.user.role)) {
      console.log('role wrong');
      return next(
        new ErrorModel(
          'You do not have permission to perform this action!',
          403
        )
      );
    }
    console.log('role right');

    next();
  };
export default restrictMiddleware;
