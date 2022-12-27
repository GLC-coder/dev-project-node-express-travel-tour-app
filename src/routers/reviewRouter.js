import express from 'express';

import {
  getAllReviews,
  createReview,
  deleteReview,
  getReview,
  updateReview,
} from '../controllers/reviewController';
import protectMiddleware from '../middleware/protectMiddleware';
import restrictMiddleware from '../middleware/restrictMiddleware';
import setTourUserIds from '../middleware/setTourUserIds';

const router = express.Router({ mergeParams: true });

//from this line all request for review need to be protected
router.use(protectMiddleware);
router
  .route('/')
  .get(getAllReviews)
  .post(restrictMiddleware('user'), setTourUserIds, createReview);
// .post(protectMiddleware, restrictMiddleware("user"), createReview);
// the last post is used to route without using createFactory
//only regular user can create a review, and create a new review by userid, tourid on the req.body

router
  .route('/:id')
  .get(getReview)
  .delete(restrictMiddleware('admin', 'user'), deleteReview)
  .patch(restrictMiddleware('admin', 'user'), updateReview);
export default router;
