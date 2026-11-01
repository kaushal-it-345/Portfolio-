const NodeCache = require('node-cache');

/**
 * Practical 9: In-Memory Caching using node-cache
 * 
 * - Default TTL: 60 seconds (stdTTL: 60)
 * - checkperiod: 120 seconds (automatic background eviction of expired keys)
 * - useClones: true (prevents mutation of cached objects in memory)
 * - Hit/Miss counter tracking for debug and performance analysis
 */
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: true
});

// Cache hit/miss metrics (Supplementary Problem 2)
let hitCount = 0;
let missCount = 0;

cache.trackHit = () => {
  hitCount++;
};

cache.trackMiss = () => {
  missCount++;
};

cache.getMetrics = () => {
  const total = hitCount + missCount;
  return {
    hits: hitCount,
    misses: missCount,
    totalRequests: total,
    hitRatio: total === 0 ? '0.0%' : `${((hitCount / total) * 100).toFixed(1)}%`,
    keys: cache.keys(),
    keyCount: cache.keys().length,
    stdTTL: cache.options.stdTTL,
    nodeCacheStats: cache.getStats()
  };
};

cache.resetMetrics = () => {
  hitCount = 0;
  missCount = 0;
  cache.flushAll();
};

module.exports = cache;
