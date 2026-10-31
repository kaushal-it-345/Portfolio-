# Advanced Web Development Frameworks (ITUE301) - Lab Portfolio

**Student:** Kaushal Patel  
**Institution:** Faculty of Technology and Engineering, Charotar University of Science and Technology (CHARUSAT)  
**Department:** Information Technology / Computer Engineering / CSE / AIML  

---

## 📑 Table of Contents
1. [Overview](#-overview)
2. [Practical 2: State Management and Routing in React](#-practical-2-state-management-and-routing-in-react)
3. [Practical 3: API Integration and Data Rendering in React](#-practical-3-api-integration-and-data-rendering-in-react)
4. [Practical 4: Building a RESTful API with Node.js and Express](#-practical-4-building-a-restful-api-with-nodejs-and-express)
5. [Richardson Maturity Model Evaluation (RMM Levels 0–3)](#-richardson-maturity-model-evaluation-rmm-levels-03)
6. [Conceptual Analysis & Viva Questions](#-conceptual-analysis--viva-questions)
7. [Setup & Running Locally](#-setup--running-locally)

---

## 🌟 Overview
This repository contains the progressive laboratory implementations for the **Advanced Web Development Frameworks** course, featuring:
- **Frontend:** A modern, responsive React 19 SPA built with Vite, React Router v7, custom themes, and live GitHub REST API feeds.
- **Backend:** A RESTful Task Management API built with Node.js, Express, middleware pipelines, and evaluation against the Richardson Maturity Model.

---

## 🗺️ Practical 2: State Management and Routing in React

### Objective
To implement reactive state management using `useState` and multi-page client-side navigation using React Router without full page reloads.

### Routes Implemented
| Path | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page featuring Header, About Me, and Skills showcase |
| `/projects` | `Projects.jsx` | Dynamic project showcase fetching repositories via GitHub REST API |
| `/contact` | `Contact.jsx` | Interactive contact form with real-time input capture and character counter |
| `*` | `NotFound.jsx` | Custom 404 error page for undefined routes with return navigation |

---

## 🌐 Practical 3: API Integration and Data Rendering in React

### Objective
To consume a public REST API in React and handle asynchronous data with loading, success, and error states.

### Architecture & Data Flow
```
Projects.jsx
├── useEffect() → triggers fetch on component mount
├── useState: repositories, loading, error, searchTerm
├── [loading]  → <LoadingSpinner />
├── [error]    → <ErrorMessage message={error} onRetry={fetchRepositories} />
└── [success]  → Filtered Repository Cards (Name, ⭐ Stars, URL, Language)
```

---

## 🚀 Practical 4: Building a RESTful API with Node.js and Express

### Objective
To design and implement a RESTful backend server with complete CRUD endpoints using Express middleware pipelines.

### Architecture / Diagram
```
Client (Postman / Browser / Thunder Client)
  │
  ▼
[Request Logging Middleware]  (logs method, url, timestamp)
  │
  ▼
[Content-Type Validation Middleware]  (enforces application/json on POST/PUT -> 415)
  │
  ▼
Express Router (/tasks and /api/tasks)
  ├── GET    /tasks           → getAllTasks (200 OK)
  ├── GET    /tasks/:id       → [validateTaskId] → getTaskById (200 OK / 404 Not Found)
  ├── POST   /tasks           → createTask (201 Created / 400 Bad Request)
  ├── PUT    /tasks/:id       → [validateTaskId] → updateTask (200 OK / 404 Not Found)
  └── DELETE /tasks/:id       → [validateTaskId] → deleteTask (200 OK / 404 Not Found)
  │
  ▼
[Custom JSON 404 Handler]  (intercepts undefined endpoints)
  │
  ▼
[Global Error Handling Middleware]  (final middleware: returns 500 without leaking stack traces)
```

### Endpoints Implemented
| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/tasks` | Retrieves all tasks | `200 OK` |
| `GET` | `/tasks/:id` | Retrieves a specific task by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/tasks` | Creates a new task | `201 Created`, `400 Bad Request`, `415 Unsupported Media Type` |
| `PUT` | `/tasks/:id` | Updates an existing task | `200 OK`, `400 Bad Request`, `404 Not Found`, `415 Unsupported Media Type` |
| `DELETE` | `/tasks/:id` | Deletes a task by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |

### Supplementary Problems Implemented
1. **Content-Type Validation Middleware:** Rejects `POST`/`PUT` requests without `Content-Type: application/json` with status code `415 Unsupported Media Type`.
2. **Route-Specific Task ID Validation Middleware:** Validates `:id` parameters ensuring they are positive integers before reaching the controller; returns `400 Bad Request` if invalid.
3. **Structured JSON 404 Handler:** Catches all undefined paths and returns `{ success: false, error: "Cannot <METHOD> <URL>: Route not found" }` with status code `404`.

---

## 🏆 Richardson Maturity Model Evaluation (RMM Levels 0–3)

Full details are documented in [MATURITY.md](file:///e:/SEM-5/AWDF/Portfolio-/MATURITY.md) and [backend/MATURITY.md](file:///e:/SEM-5/AWDF/Portfolio-/backend/MATURITY.md).

### Summary Table
| Level | Criterion | Status | Evidence |
|---|---|:---:|---|
| **Level 0: Swamp of POX** | Single URI, single HTTP verb (RPC tunneling) | Surpassed | Resource-based architecture with distinct endpoints. |
| **Level 1: Resources** | Unique URIs for individual resources | Satisfied | `/tasks` for collection, `/tasks/:id` for individual items. |
| **Level 2: Verbs & Status Codes** | Correct HTTP verbs & standard status codes | Satisfied | `GET`, `POST`, `PUT`, `DELETE` with `200`, `201`, `400`, `404`, `415`, `500`. |
| **Level 3: Hypermedia (HATEOAS)** | Self-describing responses with navigational `_links` | Awareness Level | Documented complete schema with `_links` (`self`, `update`, `delete`, `collection`) and reference `server-level3.js`. |

---

## 🧠 Conceptual Analysis & Viva Questions

### 1. Why must the error handling middleware be defined last in the middleware chain?
Express executes middleware sequentially in the order registered via `app.use()`. The error-handling middleware has four arguments `(err, req, res, next)`. If an error occurs in any route or preceding middleware (triggered via `next(err)` or an unhandled exception), Express skips all remaining standard middleware and jumps straight to the next error-handling middleware. If the error handler was placed before the routes, it would never be reachable when a route encounters an error.

### 2. What is the difference between `app.use()` and a route-specific middleware?
- **`app.use()` (Global Middleware):** Runs on every incoming request matching the path prefix across all HTTP verbs (e.g., logging, CORS, body parsing).
- **Route-Specific Middleware:** Attached directly to specific route definitions (e.g., `router.get('/:id', validateTaskId, getTaskById)`). It runs only for that exact route and method, allowing fine-grained authorization or parameter validation without adding overhead to unrelated routes.

### 3. Why is it considered bad practice to send raw error stack traces to the client?
Sending raw error stack traces leaks critical internal architectural details (e.g., server file paths, database schemas, framework versions, and code structure) to potential attackers. This enables reconnaissance for security vulnerabilities. Instead, servers should log full stack traces internally for debugging and return safe, structured JSON error messages to clients.

### 4. Why is `useEffect` required for data fetching instead of calling `fetch` in the component body?
Calling `fetch` in the component body runs on every render. Because setting state triggers another render, this creates an **infinite render loop**. `useEffect` with `[]` runs the network side-effect once on component mount.

### 5. Why do most production APIs stop at Level 2 of the Richardson Maturity Model?
Level 2 provides the greatest ROI (standard caching, idempotency, status codes). Level 3 (HATEOAS) introduces substantial payload size overhead (30–60%), lacks universally agreed client-side hypermedia parsers, and is largely superseded by modern compile-time typed schema tooling like OpenAPI (Swagger) and GraphQL SDKs.

---

## 🛠️ Setup & Running Locally

### 1. Frontend (Student Portfolio)
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Runs at [http://localhost:5173/](http://localhost:5173/).

### 2. Backend (Task Management API)
```bash
cd backend

# Install dependencies
npm install

# Run with Node or Nodemon
npm start
# or npm run dev
```
Runs at [http://localhost:5000/](http://localhost:5000/).

### 3. Run Automated API Tests
Use the included [`backend/test.http`](file:///e:/SEM-5/AWDF/Portfolio-/backend/test.http) file with the VS Code REST Client or Thunder Client extension to test all CRUD operations, middleware rejections, and error states.
