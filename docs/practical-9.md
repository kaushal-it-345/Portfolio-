# Practical 9: In-Memory Caching and Query Optimization

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Student:** Kaushal Patel  
**Institution:** Faculty of Technology and Engineering, Charotar University of Science and Technology (CHARUSAT)  
**Department:** Information Technology / Computer Engineering / CSE / AIML  
**Date:** November 2026  
**Course Outcomes / Program Outcomes:** CO2, CO4 / PO3, PO5  

---

## 🎯 Objective
To implement server-side in-memory caching using `node-cache` in a Node/Express/MongoDB REST API backend, design automated cache invalidation logic for write operations (`POST`, `PUT`, `DELETE`), and empirically measure its performance impact on API response latency.

---

## 🏗️ Architecture & Cache Flow Diagram

```
                        ┌──────────────────────────────┐
                        │      Client HTTP Request     │
                        └──────────────┬───────────────┘
                                       │
                                       ▼
                     ┌──────────────────────────────────┐
                     │ Express Routing & Auth Pipeline  │
                     └─────────────────┬────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
      GET /tasks or GET /tasks/:id                   POST, PUT, DELETE /tasks
                │                                             │
                ▼                                             ▼
       ┌─────────────────┐                        ┌───────────────────────┐
       │ Cache Check     │                        │ Write to DB / Storage │
       │ (node-cache)    │                        └───────────┬───────────┘
       └────────┬────────┘                                    │
          HIT   │   MISS                                      ▼
    ┌───────────┴───────────┐                     ┌───────────────────────┐
    ▼                       ▼                     │ Invalidate Cache Keys │
┌─────────────────┐   ┌────────────────────────┐  │  • 'all_tasks'        │
│ Return Cached   │   │ Query MongoDB/Storage  │  │  • 'task_:id'         │
│ Data in Memory  │   └───────────┬────────────┘  └───────────────────────┘
│ [X-Cache: HIT]  │               │                           │
└─────────────────┘               ▼                           ▼
                      ┌────────────────────────┐  ┌───────────────────────┐
                      │ Store in node-cache    │  │ Return 201/200 Status │
                      │ [TTL: 60s]             │  └───────────────────────┘
                      └───────────┬────────────┘
                                  │
                                  ▼
                      ┌────────────────────────┐
                      │ Return Fresh Data      │
                      │ [X-Cache: MISS]        │
                      └────────────────────────┘
```

---

## 📊 Empirical Response Time Benchmark (Recorded Data)

Using automated high-resolution timers (`process.hrtime.bigint()`) and Thunder Client / Postman under identical network conditions, we recorded 3 sample readings of uncached requests (bypassing cache) versus 3 sample readings of cached requests:

### Response Time Comparison Table

| Reading Sample | Uncached Latency (`X-Cache: MISS`) | Cached Latency (`X-Cache: HIT`) | Absolute Latency Reduction |
| :--- | :--- | :--- | :--- |
| **Sample #1** | **43.51 ms** | **6.36 ms** | -37.15 ms (85.4% faster) |
| **Sample #2** | **32.08 ms** | **6.82 ms** | -25.26 ms (78.7% faster) |
| **Sample #3** | **45.72 ms** | **5.33 ms** | -40.39 ms (88.3% faster) |
| **Average Latency** | **40.44 ms** | **6.17 ms** | **-34.27 ms (84.7% faster)** |

> **Key Finding:** In-memory caching with `node-cache` eliminated database roundtrips, reducing average API response latency by **84.7%** (from ~40.44 ms down to ~6.17 ms).

---

## 💻 Implementation Highlights

### 1. Shared Cache Module (`backend/cache.js`)
Configured a single shared `node-cache` instance with a default TTL of 60 seconds and integrated metrics tracking:

```javascript
const NodeCache = require('node-cache');

const cache = new NodeCache({
  stdTTL: 60,          // 60-second time-to-live
  checkperiod: 120,     // Evict expired keys every 120 seconds
  useClones: true       // Prevent accidental mutation of cached objects
});

// Hit / Miss counter metrics
let hitCount = 0;
let missCount = 0;

cache.trackHit = () => { hitCount++; };
cache.trackMiss = () => { missCount++; };

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
```

### 2. Route-Level Caching (`GET /tasks`)
Checks the cache before making any database queries:

```javascript
// GET /tasks
const getAllTasks = async (req, res, next) => {
  try {
    const bypassCache = req.query.no_cache === 'true';

    if (!bypassCache) {
      const cached = cache.get('all_tasks');
      if (cached) {
        cache.trackHit();
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }
    }

    cache.trackMiss();
    const tasks = await Task.find().sort({ createdAt: -1 });
    const responsePayload = { success: true, count: tasks.length, data: tasks };

    if (!bypassCache) {
      cache.set('all_tasks', responsePayload);
    }

    res.setHeader('X-Cache', bypassCache ? 'BYPASS' : 'MISS');
    return res.status(200).json(responsePayload);
  } catch (error) {
    next(error);
  }
};
```

### 3. Cache Invalidation on Write Handlers (`POST`, `PUT`, `DELETE`)
Ensures stale data is never served:

```javascript
// Inside POST /tasks
await Task.create(taskData);
cache.del('all_tasks'); // Invalidate collection cache

// Inside PUT /tasks/:id
await Task.findByIdAndUpdate(taskId, updateData);
cache.del('all_tasks');          // Invalidate collection cache
cache.del(`task_${taskId}`);     // Invalidate individual item cache

// Inside DELETE /tasks/:id
await Task.findByIdAndDelete(taskId);
cache.del('all_tasks');          // Invalidate collection cache
cache.del(`task_${taskId}`);     // Invalidate individual item cache
```

---

## 🌟 Supplementary Problems Solved

### Supplementary Problem 1: Single-Task Caching (`GET /tasks/:id`)
- Implemented individual item caching using key `task_${req.params.id}`.
- If a task is requested repeatedly, it is served directly from RAM (`X-Cache: HIT`).
- When a task is modified or deleted via `PUT` or `DELETE`, both `task_${taskId}` and `all_tasks` are invalidated simultaneously.

### Supplementary Problem 2: Cache Hit/Miss Metrics Debug Endpoint
- Exposed `GET /cache/stats` (and `GET /tasks/cache/stats`):
```json
{
  "success": true,
  "message": "In-memory cache metrics (node-cache)",
  "data": {
    "hits": 3,
    "misses": 5,
    "totalRequests": 8,
    "hitRatio": "37.5%",
    "keys": ["all_tasks", "task_64c8f1a1b2c3d4e5f6a7b8c3"],
    "keyCount": 2,
    "stdTTL": 60,
    "nodeCacheStats": {
      "keys": 2,
      "hits": 3,
      "misses": 5,
      "ksize": 42,
      "vsize": 1850
    }
  }
}
```
- Implemented `POST /cache/clear` to flush cache storage and reset metrics on demand.
- Integrated a live **In-Memory Cache Monitor** pill with a **Purge Cache** button in the React frontend (`src/components/Projects.jsx`).

### Supplementary Problem 3: TTL Experiments & Analysis

| TTL Setting | Perceived Staleness Risk | Cache Hit Ratio | Database Load | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Short (5s)** | Very Low | Lower (~20–40%) | Moderate to High | Real-time financial tickers, stock orders, or live bidding systems. |
| **Medium (60s - Default)** | None (with active write invalidation) | High (~75–90%) | Very Low | **Task management, portfolio dashboards, user profiles.** |
| **Long (300s / 5m)** | Moderate (risk if external DB writes bypass app) | Very High (>95%) | Minimal | Static content catalogs, product specifications, blog posts. |

---

## 🧠 Key Questions / Analytical Review

### 1. Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
- **Why it is necessary:** A cache stores an in-memory snapshot of data at a specific moment in time. When a write operation (`POST`, `PUT`, `DELETE`) succeeds, the database state diverges from the cached snapshot.
- **Consequence of omitting invalidation:** The API serves **stale (dirty) data** until the TTL expires. For example, if a user deletes a task, subsequent `GET /tasks` calls within the 60-second window would still return the deleted task, leading to user confusion, UI state discrepancies, and potential double-update errors.

### 2. What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
- **Reasonable TTL:** **60 seconds** is optimal for a task management application with active write invalidation.
- **Trade-off:**
  - **Shorter TTL:** Reduces the duration of potential stale data if external processes update the database directly, but generates more cache misses and higher database CPU/IOPS load.
  - **Longer TTL:** Maximizes cache hit ratio and minimizes database load, but increases RAM utilization and extends the staleness window if write invalidation fails or is bypassed.

### 3. Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?
- **Process Isolation:** `node-cache` stores keys in the heap memory of the specific Node.js process (`process-local memory`).
- **Cluster Inconsistency:** In a multi-instance deployment (e.g., behind an Nginx load balancer or in Kubernetes with 3 replica pods):
  1. A `POST /tasks` request arrives at **Instance A**, creating a task and invalidating Instance A's cache.
  2. A subsequent `GET /tasks` request from the same user is load-balanced to **Instance B**.
  3. Instance B's local cache has **not** been invalidated, so Instance B serves stale data!
- **Solution for Multi-Instance Systems:** A centralized, distributed cache such as **Redis** or **Memcached**, where all server instances query and invalidate a shared caching layer over the network.

---

## 🛠️ Verification & Testing Guide

### 1. Automated Verification Script
Run the automated test suite and benchmark:
```bash
cd backend
npm run test:cache
```
Expected output:
- 15/15 tests passing (100%)
- Formatted latency benchmark table comparing 3 uncached vs 3 cached requests.

### 2. Thunder Client / Postman Testing
Open `backend/test-caching.http` in VS Code (with REST Client or Thunder Client) and execute:
1. `POST /login` (get token)
2. `GET /tasks` (inspect `X-Cache: MISS`)
3. `GET /tasks` (inspect `X-Cache: HIT`)
4. `POST /tasks` (create task)
5. `GET /tasks` (inspect `X-Cache: MISS` to confirm invalidation)
6. `GET /cache/stats` (view hit/miss ratio)
