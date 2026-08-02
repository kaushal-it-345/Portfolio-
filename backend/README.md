# Task Management Backend API

A simple Node.js/Express backend for managing tasks with REST endpoints, request logging, and comprehensive error handling.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, Delete tasks
- ✅ **Request Logging Middleware**: Logs HTTP method, URL, and timestamp for every request
- ✅ **Global Error Handling**: Centralized error handling middleware
- ✅ **HTTP Status Codes**: Proper status codes (200, 201, 404, 400, 500)
- ✅ **CORS Support**: Cross-Origin Resource Sharing enabled
- ✅ **In-Memory Storage**: Tasks stored in memory (no database)

## Setup

### Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### Get All Tasks
```
GET /api/tasks
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Learn Express",
      "description": "Study Express.js fundamentals",
      "completed": false
    }
  ],
  "count": 1
}
```

### Get Task by ID
```
GET /api/tasks/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Learn Express",
    "description": "Study Express.js fundamentals",
    "completed": false
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Task with ID 999 not found"
}
```

### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 4,
    "title": "New Task",
    "description": "Task description",
    "completed": false
  }
}
```

**Response (400):**
```json
{
  "success": false,
  "error": "Title is required and must be a non-empty string"
}
```

### Update Task
```
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "completed": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Title",
    "description": "Updated description",
    "completed": true
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Task with ID 999 not found"
}
```

### Delete Task
```
DELETE /api/tasks/:id
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": 1,
    "title": "Learn Express",
    "description": "Study Express.js fundamentals",
    "completed": false
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Task with ID 999 not found"
}
```

### Health Check
```
GET /health
```

**Response (200):**
```json
{
  "status": "Server is running"
}
```

## HTTP Status Codes Used

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, DELETE operations |
| 201 | Created | Successful POST (task creation) |
| 400 | Bad Request | Invalid input (missing/invalid title, wrong data type) |
| 404 | Not Found | Task ID doesn't exist |
| 500 | Internal Server Error | Unexpected server errors |

## Middleware

### Request Logging Middleware
Every incoming request is logged with:
- **Timestamp** (ISO format)
- **HTTP Method** (GET, POST, PUT, DELETE)
- **URL** (request path and query parameters)

Example log output:
```
[2024-01-15T10:30:45.123Z] GET /api/tasks
[2024-01-15T10:30:50.456Z] POST /api/tasks
[2024-01-15T10:31:00.789Z] PUT /api/tasks/1
[2024-01-15T10:31:05.012Z] DELETE /api/tasks/2
```

### Global Error Handling Middleware
- Catches all errors from route handlers
- Returns standardized error response with HTTP 500 status
- Logs error details to console for debugging

## Data Model

```javascript
{
  id: number,           // Auto-generated unique ID
  title: string,        // Required, non-empty
  description: string,  // Optional
  completed: boolean    // Default: false
}
```

## Testing with cURL

```bash
# Get all tasks
curl http://localhost:5000/api/tasks

# Get task by ID
curl http://localhost:5000/api/tasks/1

# Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'

# Update task
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete task
curl -X DELETE http://localhost:5000/api/tasks/1
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Task categories/tags
- [ ] Task due dates and reminders
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Rate limiting

## License

ISC
