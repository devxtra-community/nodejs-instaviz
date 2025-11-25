import rateLimit from 'express-rate-limit'

// rate limiter per request
export const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});