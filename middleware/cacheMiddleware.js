const cache = new Map();

const TTL = 60 * 1000; // One minute.

let version = 0;

// Used on GET routes.
function cacheMiddleware(req, res, next) {
  const key = req.originalUrl;

  const entry = cache.get(key);

  // Serve a fresh cached response.
  if (entry && Date.now() - entry.createdAt < TTL) {
    res.set('X-Cache', 'HIT');

    return res.json(entry.data);
  }

  // Missing or expired cache entry.
  cache.delete(key);

  res.set('X-Cache', 'MISS');

  const requestVersion = version;

  const originalJson = res.json.bind(res);

  // Save the response when the controller calls res.json().
  res.json = function (data) {
    if (
      res.statusCode === 200 &&
      requestVersion === version
    ) {
      cache.set(key, {
        data,
        createdAt: Date.now(),
      });
    }

    return originalJson(data);
  };

  next();
}

// Used on POST, PUT, PATCH and DELETE routes.
function invalidateCacheMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // Clear the cache only when the operation succeeds.
    if (res.statusCode >= 200 && res.statusCode < 300) {
      cache.clear();

      version += 1;
    }

    return originalJson(data);
  };

  next();
}

module.exports = {
  cacheMiddleware,
  invalidateCacheMiddleware,
};