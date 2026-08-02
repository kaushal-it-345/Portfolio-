# HATEOAS Implementation Guide (Level 3)

## Overview

This guide explains the improvements made to reach Richardson Maturity Model **Level 3 (HATEOAS)** and how to use the enhanced API.

---

## What Changed?

### Original API (Level 2)
- ✅ Correct resource URLs
- ✅ Proper HTTP verbs and status codes
- ❌ No hypermedia links
- ❌ Clients must hardcode URLs

### Improved API (Level 3)
- ✅ All Level 2 features
- ✅ **Hypermedia links (_links)** in every response
- ✅ Self-describing resources
- ✅ API discovery endpoints
- ✅ Clients can navigate via links

---

## Key Improvements

### 1. Helper Functions

#### `addTaskLinks(task)`
Adds HATEOAS links to individual tasks:

```javascript
{
  id: 1,
  title: "Learn Express",
  completed: false,
  _links: {
    self: { href: '/api/tasks/1', method: 'GET', title: 'Get this task' },
    update: { href: '/api/tasks/1', method: 'PUT', title: 'Update this task' },
    delete: { href: '/api/tasks/1', method: 'DELETE', title: 'Delete this task' },
    mark_complete: { href: '/api/tasks/1', method: 'PUT', title: 'Mark as complete', body: { completed: true } },
    collection: { href: '/api/tasks', method: 'GET', title: 'Get all tasks' }
  }
}
```

#### `addCollectionLinks(taskList)`
Adds HATEOAS links to the task collection:

```javascript
{
  success: true,
  data: [/* tasks with links */],
  count: 3,
  _links: {
    self: { href: '/api/tasks', method: 'GET', title: 'Get all tasks' },
    create: { href: '/api/tasks', method: 'POST', title: 'Create a new task', schema: {...} },
    'api-root': { href: '/', method: 'GET', title: 'API root and documentation' }
  }
}
```

### 2. API Discovery Endpoints

#### GET / - API Root
Entry point for discovering available resources:

```bash
curl http://localhost:5000/
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task Management API - Richardson Maturity Model Level 3 (HATEOAS)",
  "version": "2.0.0",
  "maturityLevel": 3,
  "_links": {
    "tasks": { "href": "/api/tasks", "method": "GET", "title": "Get all tasks" },
    "create-task": { "href": "/api/tasks", "method": "POST", "title": "Create a new task" },
    "documentation": { "href": "/docs", "method": "GET", "title": "API Documentation" }
  }
}
```

#### GET /docs - API Documentation
Detailed API documentation with endpoint descriptions:

```bash
curl http://localhost:5000/docs
```

### 3. HATEOAS Links in Responses

Every response now includes `_links` that tell the client what it can do next.

#### Example: GET /api/tasks (All Tasks)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Learn Express",
      "description": "Study Express.js fundamentals",
      "completed": false,
      "_links": {
        "self": { "href": "/api/tasks/1", "method": "GET" },
        "update": { "href": "/api/tasks/1", "method": "PUT" },
        "delete": { "href": "/api/tasks/1", "method": "DELETE" },
        "mark_complete": { "href": "/api/tasks/1", "method": "PUT" },
        "collection": { "href": "/api/tasks", "method": "GET" }
      }
    },
    /* more tasks... */
  ],
  "count": 3,
  "_links": {
    "self": { "href": "/api/tasks", "method": "GET" },
    "create": { "href": "/api/tasks", "method": "POST" },
    "api-root": { "href": "/", "method": "GET" }
  }
}
```

#### Example: GET /api/tasks/:id (Single Task)
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Learn Express",
    "description": "Study Express.js fundamentals",
    "completed": false,
    "_links": {
      "self": { "href": "/api/tasks/1", "method": "GET", "title": "Get this task" },
      "update": { "href": "/api/tasks/1", "method": "PUT", "title": "Update this task" },
      "delete": { "href": "/api/tasks/1", "method": "DELETE", "title": "Delete this task" },
      "mark_complete": { "href": "/api/tasks/1", "method": "PUT", "title": "Mark as complete" },
      "collection": { "href": "/api/tasks", "method": "GET", "title": "Get all tasks" }
    }
  }
}
```

#### Example: POST /api/tasks (Create Task)
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 4,
    "title": "New Task",
    "description": "",
    "completed": false,
    "_links": {
      "self": { "href": "/api/tasks/4", "method": "GET" },
      "update": { "href": "/api/tasks/4", "method": "PUT" },
      "delete": { "href": "/api/tasks/4", "method": "DELETE" },
      "mark_complete": { "href": "/api/tasks/4", "method": "PUT" },
      "collection": { "href": "/api/tasks", "method": "GET" }
    }
  },
  "_links": {
    "all-tasks": { "href": "/api/tasks", "method": "GET" },
    "api-root": { "href": "/", "method": "GET" }
  }
}
```

#### Example: Error Response (404)
```json
{
  "success": false,
  "error": "Task with ID 999 not found",
  "_links": {
    "all-tasks": { "href": "/api/tasks", "method": "GET", "title": "View all tasks" },
    "create-task": { "href": "/api/tasks", "method": "POST", "title": "Create a new task" }
  }
}
```

---

## Using the API with Links

### Traditional Approach (Hardcoded URLs)
```javascript
const taskId = 1;
// Client MUST know the URL structure
fetch(`/api/tasks/${taskId}`, { method: 'PUT', body: ... })
```

### HATEOAS Approach (Follow Links)
```javascript
// 1. Get all tasks
const tasksResponse = await fetch('/api/tasks');
const tasksData = await tasksResponse.json();

// 2. Find a task
const task = tasksData.data[0];

// 3. Get the "update" link from the response
const updateLink = task._links.update;

// 4. Use the link to update (client doesn't hardcode URL!)
const updateResponse = await fetch(updateLink.href, {
  method: updateLink.method,
  body: JSON.stringify({ completed: true })
});
```

**Benefit:** If the server changes `/api/tasks/1` to `/v2/tasks/1`, the client continues working because it follows the link!

---

## Link Structure

Each link object contains:

```javascript
{
  "href": "/api/tasks/1",        // URL to follow
  "method": "GET|POST|PUT|DELETE", // HTTP method to use
  "title": "Get this task",       // Human-readable description
  "body": { /* optional */ }      // Suggested request body (for POST/PUT)
}
```

### Link Relation Names

| Relation | Purpose | Method |
|----------|---------|--------|
| `self` | Current resource | GET |
| `update` | Modify this resource | PUT |
| `delete` | Remove this resource | DELETE |
| `mark_complete` | Mark task as done | PUT |
| `mark_incomplete` | Mark task as pending | PUT |
| `collection` | Parent resource (all tasks) | GET |
| `create` | Create new resource | POST |
| `api-root` | API entry point | GET |

---

## Switching Between Versions

### Use Level 2 API
```bash
npm start  # Uses server.js (Level 2)
```

### Use Level 3 API (HATEOAS)
```bash
# Option 1: Replace the default
cp server-level3.js server.js
npm start

# Option 2: Point to level 3 directly
node server-level3.js

# Option 3: Update package.json
# Change "start": "node server-level3.js"
npm start
```

---

## Benefits of Level 3 (HATEOAS)

### 1. **Self-Documenting API**
- Responses include available actions
- Clients know what they can do without external documentation

### 2. **URL Independence**
- Server can change URLs without breaking clients
- Clients follow links, not hardcoded paths

### 3. **Better Client Experience**
- Clients discover available actions dynamically
- Reduces errors from incorrect URLs

### 4. **API Evolution**
- Add new links without breaking existing clients
- Clients adapt naturally to new capabilities

### 5. **True REST Compliance**
- Follows REST architectural style completely
- Implements all 4 constraints of REST

---

## Comparison: API Maturity Levels

### Level 0: RPC
```javascript
// Tunnel everything through HTTP
POST /api?action=getTasks
POST /api?action=createTask&title=...
POST /api?action=updateTask&id=1&title=...
```

### Level 1: Resources
```javascript
// Use multiple endpoints, still wrong HTTP verbs
GET /getTasks
POST /createTask
POST /updateTask?id=1
POST /deleteTask?id=1
```

### Level 2: HTTP Verbs
```javascript
// Correct verbs and status codes
GET /api/tasks         // 200
POST /api/tasks        // 201
PUT /api/tasks/1       // 200
DELETE /api/tasks/1    // 200
```

### Level 3: HATEOAS
```javascript
// Add hypermedia links for navigation
GET /api/tasks
{
  "data": [...],
  "_links": {
    "create": { "href": "/api/tasks", "method": "POST" },
    ...
  }
}
```

---

## Testing Examples

### 1. Start from API Root
```bash
curl http://localhost:5000/
# Follow the links in the response
```

### 2. Navigate via Links
```bash
# Get all tasks
curl http://localhost:5000/api/tasks

# Extract the "create" link and use it
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task"}'

# Extract the "update" link from response and use it
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### 3. Using Links in Client Code
```javascript
async function apiNavigationExample() {
  // Start at API root
  let response = await fetch('http://localhost:5000/');
  let data = await response.json();
  
  // Follow 'tasks' link
  response = await fetch(data._links.tasks.href);
  data = await response.json();
  
  // Get first task and follow its 'update' link
  const task = data.data[0];
  response = await fetch(task._links.update.href, {
    method: task._links.update.method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  
  const updated = await response.json();
  console.log('Task updated via HATEOAS link!', updated);
}
```

---

## Migration Guide

### From Level 2 to Level 3

1. **Replace server.js:**
   ```bash
   cp server-level3.js server.js
   npm start
   ```

2. **No breaking changes:**
   - All existing endpoints work the same
   - Response status codes unchanged
   - Only added `_links` to responses

3. **Update client code (optional):**
   - Can still hardcode URLs (backward compatible)
   - Can gradually adopt HATEOAS links
   - No urgent changes needed

---

## Conclusion

The improved Level 3 API provides:
- ✅ Full REST compliance (HATEOAS)
- ✅ Self-describing responses
- ✅ Better API discoverability
- ✅ Backward compatibility with Level 2 clients
- ✅ Foundation for future API evolution

Start with the API root (`GET /`) and follow the links to explore all available resources!

