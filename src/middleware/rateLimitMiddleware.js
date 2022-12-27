import rateLimit from 'express-rate-limit';

const rateLimitMiddleware = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP address, please try again in an hour!',
});

export default rateLimitMiddleware;
