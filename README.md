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
5. [Practical 5: MongoDB Integration and Schema Design with Mongoose](#-practical-5-mongodb-integration-and-schema-design-with-mongoose)
6. [Practical 6: Full Stack Integration React + Node + MongoDB](#-practical-6-full-stack-integration-react--node--mongodb)
7. [Richardson Maturity Model Evaluation (RMM Levels 0–3)](#-richardson-maturity-model-evaluation-rmm-levels-03)
8. [Conceptual Analysis & Viva Questions](#-conceptual-analysis--viva-questions)
9. [Setup & Running Locally](#-setup--running-locally)

---

## 🌟 Overview
This repository contains the complete laboratory implementations for **Advanced Web Development Frameworks** (ITUE301):
- **Frontend (Port 5173):** React 19 SPA built with Vite, React Router v7, custom light/dark theme variables, optimistic UI updates, Toast notifications, and full-stack API clients.
- **Backend (Port 5000):** RESTful Task Management server built with Node.js, Express, Mongoose ODM, MongoDB schema validation, CORS configuration, and Richardson Maturity Model evaluation.

---

## 🗺️ Practical 2: State Management and Routing in React
- **Client-Side Routing:** Multi-page routing (`/`, `/tasks`, `/projects`, `/contact`, `*`) without full-page reloads.
- **State Management:** Controlled inputs with real-time feedback, live character count, help tooltip visibility toggle, and dark/light theme switching.

---

## 🌐 Practical 3: API Integration and Data Rendering in React
- **Asynchronous Data Fetching:** Consumes public GitHub REST API (`octocat/repos`) on component mount via `useEffect`.
- **Request States:** Handles `loading` with `<LoadingSpinner />` and `error` with `<ErrorMessage />`.
- **Supplementary Features:** Search filter input, star count (`stargazers_count`) display, retry mechanism, and error simulation toggle.

---

## 🚀 Practical 4: Building a RESTful API with Node.js and Express
- **Express Middleware Pipeline:** Global request logging, JSON body parsing, and centralized error handling.
- **CRUD Operations:** Complete RESTful endpoints for task resources.
- **Supplementary Middleware:**
  - Content-Type enforcement (`415 Unsupported Media Type` if missing `application/json` on `POST`/`PUT`).
  - Route-specific task ID format validation (`400 Bad Request`).
  - Structured JSON 404 handler for undefined routes.

---

## 🍃 Practical 5: MongoDB Integration and Schema Design with Mongoose
- **Mongoose Schema Design:** Required `title`, default `completed: false` and `createdAt: Date.now`.
- **Supplementary Constraints:** `priority` restricted to enum `['low', 'medium', 'high']`.
- **Pre-Save Lifecycle Hook:** Automatically trims whitespace from the `title` field.
- **Structured Error Handling:** Formats `ValidationError` and `CastError` into clean JSON payloads without leaking internal stack traces.

---

## 🔗 Practical 6: Full Stack Integration React + Node + MongoDB

### Objective
To wire the React frontend to the Node/Express/MongoDB backend into a fully functional, production-ready full-stack application with state synchronization.

### Architecture & End-to-End Flow
```
React Frontend (http://localhost:5173)
  │
  ├── Form Input / Action (Create / Toggle / Edit / Delete)
  │
  ├── Central API Client (src/api.js) via fetch
  │
  ▼
Express Backend (http://localhost:5000)
  │
  ├── CORS Middleware (allows cross-origin requests from 5173)
  ├── Request Logging & Content-Type Validator
  ├── Mongoose ODM (models/Task.js)
  │
  ▼
MongoDB Database (tasks collection)
  │
  ▼
JSON Response → React UI updates state & renders Toast notification
```

### Full-Stack CRUD Workflow
1. **CREATE (POST `/tasks`):**
   - User submits new task title, description, and priority.
   - **Optimistic UI Update:** Immediately renders the task with a temporary ID in the list, then confirms with the backend response.
2. **READ (GET `/tasks`):**
   - Automatically loads tasks on mount using `useEffect` and `getTasks()`.
   - Displays real-time statistics (Total, Completed, Pending).
3. **UPDATE (PUT `/tasks/:id`):**
   - Toggle completion status with instant checkbox state sync.
   - Inline edit mode allows modifying title, description, and priority directly in the card.
4. **DELETE (DELETE `/tasks/:id`):**
   - **Confirmation Dialog Modal:** Displays a confirmation prompt before deleting any task.
   - On confirmation, permanently removes document from MongoDB and updates UI state.
5. **Toast Notifications:**
   - Floating `<Toast />` component provides immediate visual feedback (success/error) after each operation.

---

## 🏆 Richardson Maturity Model Evaluation (RMM Levels 0–3)
Documented in detail in [MATURITY.md](file:///e:/SEM-5/AWDF/Portfolio-/MATURITY.md).
- **Level 0 (Swamp of POX):** Surpassed via resource-specific endpoints.
- **Level 1 (Resources):** Satisfied via `/tasks` and `/tasks/:id`.
- **Level 2 (HTTP Verbs & Status Codes):** Satisfied using standard `GET`, `POST`, `PUT`, `DELETE` with `200`, `201`, `400`, `404`, `415`, `500`.
- **Level 3 (HATEOAS):** Full hypermedia response structures documented with `_links` (`self`, `update`, `delete`, `collection`).

---

## 🧠 Conceptual Analysis & Viva Questions

### 1. What changes are required on the backend (CORS) to allow the React dev server to call the Express API?
By default, web browsers enforce the **Same-Origin Policy**, which blocks web pages on `http://localhost:5173` from making HTTP requests to `http://localhost:5000` because the ports differ. On the Express backend, the `cors` middleware must be registered (`const cors = require('cors'); app.use(cors());`). This sends the `Access-Control-Allow-Origin: *` (or specific origin) and `Access-Control-Allow-Methods` response headers during CORS preflight checks (`OPTIONS`), permitting the browser to complete the fetch request.

### 2. Why should the UI re-fetch or update local state after a successful POST/PUT/DELETE rather than assuming success silently?
Assuming success without state synchronization leads to UI/server state drift. Updating local state from the backend's response (or re-fetching) ensures:
- The UI acquires server-generated values (e.g., auto-generated MongoDB `_id`, default timestamps, sanitized fields).
- Any server-side business rules, triggers, or validation modifications are accurately reflected in the user's view.
- If the write operation failed on the backend, the user is alerted immediately rather than discovering data loss upon page refresh.

### 3. What is the risk of not handling errors on write operations (POST/PUT/DELETE) the same way as read operations (GET)?
If read operations fail, the user merely sees a failed fetch. But if write operations fail unhandled:
- The user may falsely believe their data was saved, leading to catastrophic data loss.
- The UI might enter an inconsistent or broken state where actions are performed on non-existent records.
- In optimistic UI updates, failure to handle errors leaves "ghost" items on screen that were rejected by the database.

---

## 🛠️ Setup & Running Locally (Two Dev Servers)

### Terminal 1: Backend (Express + MongoDB)
```bash
cd backend
npm install
npm start
```
> Server running at: **[http://localhost:5000/](http://localhost:5000/)**  
> Endpoints: `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`

### Terminal 2: Frontend (React SPA)
```bash
# In project root
npm install
npm run dev
```
> Frontend running at: **[http://localhost:5173/](http://localhost:5173/)**  
> Navigate to **Tasks** tab to interact with the live full-stack CRUD system.

### Automated Verification
```bash
cd backend
node verify-api.js
```
