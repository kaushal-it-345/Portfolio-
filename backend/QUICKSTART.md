# Quick Start Guide

## Installation

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
Task Management API Server running on http://localhost:5000
Health Check: http://localhost:5000/health
Tasks Endpoint: http://localhost:5000/api/tasks
```

## Testing the API

### Option 1: Using cURL (Built-in)

```bash
# Test health check
curl http://localhost:5000/health

# Get all tasks
curl http://localhost:5000/api/tasks

# Get a specific task
curl http://localhost:5000/api/tasks/1

# Create a new task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\": \"Complete project\", \"description\": \"Finish backend\"}"

# Update a task
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"completed\": true}"

# Delete a task
curl -X DELETE http://localhost:5000/api/tasks/1
```

### Option 2: Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new collection
3. Add requests with the endpoints from the README.md

### Option 3: Using REST Client (VS Code Extension)

1. Install "REST Client" extension in VS Code
2. Create a file called `test.http` in the backend folder
3. Add your requests and click "Send Request"

Example `test.http`:
```http
### Health Check
GET http://localhost:5000/health

### Get All Tasks
GET http://localhost:5000/api/tasks

### Get Single Task
GET http://localhost:5000/api/tasks/1

### Create Task
POST http://localhost:5000/api/tasks
Content-Type: application/json

{
  "title": "Learn Docker",
  "description": "Containerize the application"
}

### Update Task
PUT http://localhost:5000/api/tasks/1
Content-Type: application/json

{
  "completed": true,
  "description": "Task is now complete"
}

### Delete Task
DELETE http://localhost:5000/api/tasks/1
```

## Understanding the Code

### Key Features

1. **Request Logging Middleware** (Line 34-38)
   - Logs every incoming request with timestamp, method, and URL
   - Runs on every request before the route handlers

2. **CRUD Routes**
   - `GET /api/tasks` - Fetch all tasks
   - `GET /api/tasks/:id` - Fetch a specific task
   - `POST /api/tasks` - Create a new task
   - `PUT /api/tasks/:id` - Update a task
   - `DELETE /api/tasks/:id` - Delete a task

3. **Error Handling** (Line 187-198)
   - Global error handler at the end of middleware chain
   - Catches all errors from route handlers
   - Returns standardized error response
   - Logs errors to console for debugging

4. **HTTP Status Codes**
   - 200: Successful GET, PUT, DELETE
   - 201: Successful POST (resource created)
   - 400: Bad request (validation error)
   - 404: Resource not found
   - 500: Server error (global error handler)

## Connecting Frontend to Backend

In your React app, update API calls to point to the backend:

```javascript
// Before (hardcoded data)
// const tasks = [...]

// After (API calls)
const fetchTasks = async () => {
  const response = await fetch('http://localhost:5000/api/tasks');
  const data = await response.json();
  return data.data;
};

const createTask = async (title, description) => {
  const response = await fetch('http://localhost:5000/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description })
  });
  return response.json();
};
```

## Server Logs Example

When running, you'll see logs like:
```
Task Management API Server running on http://localhost:5000
[2024-01-15T10:30:45.123Z] GET /api/tasks
[2024-01-15T10:30:50.456Z] POST /api/tasks
[2024-01-15T10:31:00.789Z] PUT /api/tasks/1
[2024-01-15T10:31:05.012Z] DELETE /api/tasks/2
```

## Troubleshooting

### Port Already in Use
If port 5000 is already in use:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

Or use a different port:
```bash
PORT=3001 npm run dev
```

### Nodemon Not Found
If you get an error about nodemon:
```bash
npm install --save-dev nodemon
```

### CORS Errors in Frontend
The backend has CORS enabled, but make sure:
1. Backend is running on `http://localhost:5000`
2. Frontend is making requests to the correct backend URL

## Next Steps

- [ ] Add authentication
- [ ] Connect to a real database (MongoDB)
- [ ] Add request validation library
- [ ] Implement pagination
- [ ] Add API documentation with Swagger
- [ ] Write unit tests
- [ ] Deploy to production server
