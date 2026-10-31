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
6. [Richardson Maturity Model Evaluation (RMM Levels 0–3)](#-richardson-maturity-model-evaluation-rmm-levels-03)
7. [Conceptual Analysis & Viva Questions](#-conceptual-analysis--viva-questions)
8. [Setup & Running Locally](#-setup--running-locally)

---

## 🌟 Overview
This repository contains progressive laboratory implementations for the **Advanced Web Development Frameworks** course:
- **Frontend:** A responsive Single Page Application built with React 19, Vite, React Router v7, dark mode, and GitHub REST API integration.
- **Backend:** A RESTful Task Management system built with Node.js, Express, and MongoDB/Mongoose schema validation, evaluated against the Richardson Maturity Model.

---

## 🗺️ Practical 2: State Management and Routing in React
- **Client-Side Routing:** Multi-page routing (`/`, `/projects`, `/contact`, `*`) without full-page reloads.
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

### Objective
To connect a MongoDB database to an Express server and enforce data validation through a Mongoose schema.

### Architecture & Data Flow
```
Express App
  │
  ▼
Mongoose ODM (models/Task.js)
  │  ├── Schema Validation (required title, priority enum, default completed & createdAt)
  │  └── Pre-save Hook (automatic whitespace trimming on title)
  ▼
MongoDB Database
  └── tasks collection { title, description, completed, priority, createdAt }
```

### Mongoose Task Schema (`backend/models/Task.js`)
```javascript
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority. Priority must be low, medium, or high.'
    },
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to trim whitespace from title
taskSchema.pre('save', function (next) {
  if (this.title && typeof this.title === 'string') {
    this.title = this.title.trim();
  }
  if (typeof next === 'function') next();
});
```

### Supplementary Problems Implemented
1. **Priority Field with Enum:** Restricted to `['low', 'medium', 'high']` with default `'medium'`; invalid values trigger clean `400 Validation Error`.
2. **Pre-Save Trimming Hook:** Mongoose `pre('save')` hook automatically trims leading and trailing whitespace from the `title` field before persistence.
3. **Structured Error Handling:** Replaces raw Mongoose error objects with clean JSON payloads (`ValidationError` and `CastError` return structured `400` status).
4. **Environment Isolation:** Database connection string managed securely through `.env` (`MONGO_URI`) and documented via `.env.example`.

---

## 🏆 Richardson Maturity Model Evaluation (RMM Levels 0–3)
Documented in detail in [MATURITY.md](file:///e:/SEM-5/AWDF/Portfolio-/MATURITY.md).
- **Level 0 (Swamp of POX):** Surpassed via resource-specific endpoints.
- **Level 1 (Resources):** Satisfied via `/tasks` and `/tasks/:id`.
- **Level 2 (HTTP Verbs & Status Codes):** Satisfied using standard `GET`, `POST`, `PUT`, `DELETE` with `200`, `201`, `400`, `404`, `415`, `500`.
- **Level 3 (HATEOAS):** Full hypermedia response structures documented with `_links` (`self`, `update`, `delete`, `collection`).

---

## 🧠 Conceptual Analysis & Viva Questions

### 1. What is the purpose of a schema in a NoSQL database like MongoDB, given that MongoDB itself is schema-less?
While MongoDB provides flexible, document-level schema-less storage, production applications require consistent data integrity, predictability, and business constraints. Mongoose schemas provide an **application-level contract** that defines expected types, enforces mandatory fields, applies default values, sanitizes inputs, and runs pre/post lifecycle hooks before data ever touches the database.

### 2. Why is it important to define required fields and default values at the schema level rather than relying on frontend validation alone?
Frontend validation can be bypassed by anyone using tools like Postman, curl, or direct API calls. Schema-level validation acts as the definitive source of truth and the final security barrier for data integrity, ensuring that corrupt or incomplete documents are never committed to storage regardless of the client used.

### 3. What happens internally when a document fails Mongoose validation where is the request stopped?
When an operation like `Task.create()` or `document.validate()` is called, Mongoose executes validation rules synchronously or asynchronously in memory **before** initiating a MongoDB wire protocol command. If any field constraint fails, Mongoose halts execution, creates a `ValidationError` containing individual field failure messages, and immediately rejects the Promise or invokes the catch block. The request is stopped in the Node.js application process without sending any network packet to the MongoDB server.

---

## 🛠️ Setup & Running Locally

### 1. Frontend
```bash
npm install
npm run dev
```
Runs at [http://localhost:5173/](http://localhost:5173/).

### 2. Backend
```bash
cd backend
npm install
npm start
```
Runs at [http://localhost:5000/](http://localhost:5000/).

### 3. Automated Verification Tests
```bash
cd backend
node verify-api.js
```
Runs the full automated test suite verifying Mongoose schema defaults, required validation, priority enum restrictions, pre-save hook trimming, and HTTP error handlers.
