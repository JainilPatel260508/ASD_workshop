const router = require('express').Router();

const controller = require('../controllers/productController');

const {
  cacheMiddleware,
  invalidateCacheMiddleware,
} = require('../middleware/cacheMiddleware');

// Cached GET endpoints.
router.get(
  '/',
  cacheMiddleware,
  controller.getProducts
);

router.get(
  '/:id',
  cacheMiddleware,
  controller.getProduct
);

// Mutations invalidate the cache after success.
router.post(
  '/',
  invalidateCacheMiddleware,
  controller.createProduct
);

router.put(
  '/:id',
  invalidateCacheMiddleware,
  controller.replaceProduct
);

router.patch(
  '/:id',
  invalidateCacheMiddleware,
  controller.updateProduct
);

router.delete(
  '/:id',
  invalidateCacheMiddleware,
  controller.deleteProduct
);

module.exports = router;