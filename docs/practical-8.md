# Practical 8: Performance Optimization and Lazy Loading in React

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Student:** Kaushal Patel  
**Institution:** Faculty of Technology and Engineering, Charotar University of Science and Technology (CHARUSAT)  
**Department:** Information Technology / Computer Engineering / CSE / AIML  
**Date:** November 2026  

---

## 🎯 Objective
To improve frontend performance in a multi-route React application using route-based and component-based code splitting, dynamic imports (`React.lazy()`), `<Suspense>` boundary fallbacks, and build-time optimization metrics.

---

## 🏗️ Architecture & Code Splitting Diagram

### 1. Before Optimization (Single Monolithic Bundle)
All route components (`Home`, `Projects`, `Contact`, `NotFound`, `TaskAnalyticsChart`) and their subcomponents were bundled into a single monolithic bundle. When a user visited the root URL (`/`), the browser was forced to download, parse, and evaluate JavaScript code for every page upfront before displaying anything.

```
Initial Visit to "/"
      │
      ▼
┌────────────────────────────────────────────────────────────────────────┐
│ main.bundle.js (287.85 kB / 87.68 kB gzip)                             │
│ ┌───────────────┬───────────────────┬───────────────┬────────────────┐ │
│ │ Home (3.8 kB) │ Projects (22.2kB) │ Contact(12.8k)│ Analytics(9.9k)│ │
│ └───────────────┴───────────────────┴───────────────┴────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. After Optimization (Route-Based & Component-Based Code Splitting)
Dynamic `import()` promises enable Vite/Rollup to separate each route and heavy component into on-demand chunks. Only the critical core shell and the actively requested route are downloaded on initial page load. Subsequent routes and heavy charts are downloaded asynchronously only when accessed.

```
Initial Visit to "/"
      │
      ▼
┌───────────────────────────────┐
│ index-[hash].js (250.99 kB)   │ ──► Core vendor, router, shell
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ Home-[hash].js (3.80 kB)      │ ──► Loads only on "/"
└───────────────────────────────┘

User Navigates to "/tasks" or "/projects"
      │
      ▼
┌───────────────────────────────┐
│ Projects-[hash].js (22.18 kB) │ ──► Downloaded on demand via Suspense
└───────────────┬───────────────┘
                │
                │ User clicks "View Task Analytics (Lazy Chunk)"
                ▼
┌─────────────────────────────────┐
│ TaskAnalyticsChart-[hash].js    │ ──► Supplementary heavy chart chunk (9.90 kB)
└─────────────────────────────────┘

User Navigates to "/contact"
      │
      ▼
┌───────────────────────────────┐
│ Contact-[hash].js (12.86 kB)  │ ──► Downloaded on demand via Suspense
└───────────────────────────────┘

User Enters Undefined Route (404)
      │
      ▼
┌───────────────────────────────┐
│ NotFound-[hash].js (1.45 kB)  │ ──► Downloaded only when 404 occurs
└───────────────────────────────┘
```

---

## 📊 Recorded Build & Bundle Size Metrics

### Build Comparison Table (Vite Output)

| Metric / Asset Chunk | Before Optimization (Single Bundle) | After Optimization (Code-Split) | Difference / Savings |
| :--- | :--- | :--- | :--- |
| **Initial JS Bundle (`index.js`)** | **287.85 kB** (87.68 kB gzip) | **250.99 kB** (79.86 kB gzip) | **-36.86 kB (-12.8%)** *(Critical path reduction)* |
| **`Home.js` chunk** | Monolithic (in index.js) | **3.80 kB** (1.46 kB gzip) | Downloaded on demand |
| **`Projects.js` chunk** | Monolithic (in index.js) | **22.18 kB** (5.85 kB gzip) | Downloaded on demand |
| **`Contact.js` chunk** | Monolithic (in index.js) | **12.86 kB** (4.09 kB gzip) | Downloaded on demand |
| **`TaskAnalyticsChart.js` chunk**| Monolithic (in index.js) | **9.90 kB** (3.26 kB gzip) | Downloaded on demand (Supplementary) |
| **`NotFound.js` chunk** | Monolithic (in index.js) | **1.45 kB** (0.80 kB gzip) | Downloaded on demand |
| **Total CSS (`index.css`)** | 5.37 kB (1.79 kB gzip) | 6.89 kB (2.19 kB gzip) | +1.52 kB (Skeleton shimmer styles) |
| **HTML (`index.html`)** | 0.77 kB (0.43 kB gzip) | 0.77 kB (0.43 kB gzip) | Unchanged |

---

## 💻 Implementation Highlights

### 1. Route-Level Code Splitting (`src/App.jsx`)
Route components are imported dynamically through `React.lazy()`:
```jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import RouteFallback from './components/RouteFallback';
import { lazyWithDelay } from './utils/lazyWithDelay';

// Practical 8: Route-based code splitting
const Home = lazyWithDelay(() => import('./components/Home'), 300);
const Projects = lazyWithDelay(() => import('./components/Projects'), 300);
const Contact = lazyWithDelay(() => import('./components/Contact'), 300);
const NotFound = lazy(() => import('./components/NotFound'));
```

### 2. Meaningful Fallback UI (`src/components/RouteFallback.jsx`)
While a lazy route chunk downloads across the network, React displays the `<RouteFallback />` component wrapped inside `<Suspense>`:
```jsx
<Suspense fallback={<RouteFallback message="Loading page..." />}>
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
    </Routes>
</Suspense>
```
The fallback features:
- Animated dual-ring brand spinner
- Dynamic linear gradient skeleton shimmer bars
- WCAG-compliant live regions (`role="status"`, `aria-live="polite"`, `aria-busy="true"`)
- Full support for both light and dark themes

---

## 🌟 Supplementary Problems Solved

### Supplementary Problem 1: Lazy-Loading Heavy Third-Party / Analytical Component
In `src/components/Projects.jsx`, an interactive analytics visualizer (`TaskAnalyticsChart.jsx`) was decoupled from the main project bundle:
```jsx
// src/components/Projects.jsx
const TaskAnalyticsChart = lazy(() => import('./TaskAnalyticsChart'));

// Loaded only when requested by the user:
{showAnalytics && (
    <Suspense fallback={<LoadingSpinner message="Fetching heavy Task Analytics chunk on-demand..." />}>
        <TaskAnalyticsChart tasks={tasks} />
    </Suspense>
)}
```
**Outcome:** Generates a separate **9.90 kB** chunk (`TaskAnalyticsChart-*.js`) that is never downloaded unless the user actively chooses to view analytics.

### Supplementary Problem 2: Minimum-Delay Fallback to Prevent UI Flicker
On fast lab networks or high-speed broadband, chunks can resolve in 10–25 milliseconds. This causes fallback spinners to flash abruptly for a fraction of a frame, producing jarring visual stutter.  
To prevent this, `src/utils/lazyWithDelay.js` implements a minimum-delay promise wrapper:
```javascript
export function lazyWithDelay(factory, minDelay = 300) {
    return lazy(() =>
        Promise.all([
            factory(),
            new Promise((resolve) => setTimeout(resolve, minDelay))
        ]).then(([moduleExports]) => moduleExports)
    );
}
```
**Outcome:** Fallback transitions are rendered smoothly with a stable, predictable transition phase.

### Supplementary Problem 3: React DevTools Profiler Investigation & Re-Render Elimination
1. **Identified Issue:**  
   In `Projects.jsx`, typing into search filter (`searchTerm`) or adding task titles triggered continuous re-evaluations of the task filtering predicate (`tasks.filter(...)`) and re-rendered the entire collection of cards and statistics counters.
2. **Optimization Applied:**  
   - Memoized computed task lists using `useMemo`:
     ```javascript
     const filteredTasks = useMemo(() => {
         return tasks.filter(task => { ... });
     }, [tasks, searchTerm, statusFilter, priorityFilter]);
     ```
   - Memoized derived numerical statistics (`completedCount`, `pendingCount`) with `useMemo`.
   - Protected API fetching callback inside `useCallback`.
3. **Profiling Result:**  
   Eliminated redundant re-renders on independent input strokes, stabilizing component tree updates to only the elements whose state actually changed.

---

## 🧠 Key Questions / Analytical Review

### 1. What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?
- **Initial Bundle (`index.js`):** Downloaded synchronously during the critical page-load phase (initial HTTP request). The browser cannot paint the first meaningful frame until this bundle is downloaded, parsed, and executed.
- **Lazy-Loaded Chunk (`Projects.js`, `Contact.js`):** Downloaded asynchronously on-demand only when an event or condition occurs (such as client-side route navigation or user interaction). If a user never visits `/contact`, the `Contact.js` chunk is never downloaded or parsed, saving mobile bandwidth and device memory.

### 2. Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?
Perceived performance depends heavily on initial metrics:
- **First Contentful Paint (FCP)** and **Largest Contentful Paint (LCP):** Because the initial JavaScript payload is significantly smaller, the browser finishes downloading and parsing JavaScript much sooner, allowing the first view to paint earlier.
- **Time to Interactive (TTI):** The main thread has less JavaScript to compile and execute upfront, meaning the user can click, scroll, and interact sooner.
- **Selective Consumption:** In real-world user journeys, users rarely visit every single page in one session. Transferring code only for pages actually visited reduces total network bandwidth for the majority of users.

### 3. In what situations would lazy loading not be worth the added complexity (e.g., a very small app)?
- **Small Applications (< 100 kB total JS):** The HTTP overhead of additional TCP/TLS handshakes or multiplexed request headers can exceed the negligible time saved splitting a tiny bundle.
- **Critical Linear Flows:** In onboarding flows where step 2 is guaranteed to be reached within 2 seconds of step 1, splitting causes unwanted network delays or spinners between steps.
- **Offline / PWA Use Cases:** When complete offline functionality is required upfront, pre-caching a single bundle or prefetching chunks is often preferred.
- **Added Code & State Complexity:** Requires error boundaries, Suspense fallbacks, and handling potential dynamic import chunk loading failures (e.g., during new deployments).

---

## 🛠️ Verification & Testing Guide

### 1. Verifying Route Chunks in Browser Network Tab
1. Run local preview or dev server:
   ```bash
   npm run build
   npm run preview
   ```
2. Open DevTools (`F12`), switch to the **Network** tab, and filter by **JS**.
3. Reload at `http://localhost:4173/`:
   - Observe only `index-[hash].js` and `Home-[hash].js` are loaded.
4. Click on **Tasks** in the navigation bar:
   - Observe `Projects-[hash].js` is fetched immediately.
5. Click **"View Task Analytics (Lazy Chunk)"**:
   - Observe `TaskAnalyticsChart-[hash].js` is fetched dynamically.
6. Click **Contact**:
   - Observe `Contact-[hash].js` is fetched on first visit.

### 2. Simulating Slow Network (Slow 3G)
1. In Chrome / Edge DevTools **Network** tab, set throttling to **Slow 3G**.
2. Navigate between routes.
3. Observe the `<RouteFallback />` skeleton UI and spinner displaying smoothly before the route resolves.
