import express from 'express';
import {
  getAllTours,
  createTour,
  updateTour,
  getTour,
  deleteTour,
  getTourStatistics,
  getMonthlyPlan,
  getTourWithin,
  getDistances,
} from '../controllers/tourController';
import reviewRouter from './reviewRouter';

import aliasTop5CheapTours from '../middleware/aliasTop5CheapTours';
import protectMiddleware from '../middleware/protectMiddleware';
import restrictMiddleware from '../middleware/restrictMiddleware';

const router = express.Router();
//Nested route: Post the specified tour's review by tourId;
//Only authenticated user can post a tour's review
//method 2: use mergeParams
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap-tours').get(aliasTop5CheapTours, getAllTours);
router.route('/get-tour-statistics').get(getTourStatistics);

/**URL for get tours-within certain location and distance
 * method 1: use req.params
 * /tours-within/400/center/34.066486, -118.204371/unit/mi
 */
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getTourWithin);

/**Method 2 : use req.query */
// router
//   .route("/?distance=23&&center=-40,45&unit=mi")
//   .get(getTourWithin);

//GetDistance router
router.route('/distances/:latlng/unit/:unit').get(getDistances);
router
  .route('/get-monthly-tour-plan/:year')
  .get(
    protectMiddleware,
    restrictMiddleware('admin', 'guide', 'lead-guide'),
    getMonthlyPlan
  );
//method 1
router
  .route('/')
  .get(getAllTours)
  .post(
    protectMiddleware,
    restrictMiddleware('admin', 'lead-guide'),
    createTour
  );

//method 2
// router.post("/", checkBody, createTour)
// router.get("/", getAllTours)

router
  .route('/:id')
  .get(getTour)
  .patch(
    protectMiddleware,
    restrictMiddleware('admin', 'lead-guide'),
    updateTour
  )
  .delete(
    protectMiddleware,
    restrictMiddleware('admin', 'lead-guide'),
    deleteTour
  );

//Nested route: Post the specified tour's review by tourId;
//Only authenticated user can post a tour's review
//method 1
// router
//   .route("/:tourId/reviews")
//   .post(protectMiddleware, restrictMiddleware("user"), createReview);
export default router;
