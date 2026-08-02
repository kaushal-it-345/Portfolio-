# Level 2 vs Level 3: Response Examples

## Overview

This document shows side-by-side comparisons of API responses at Level 2 (HTTP Verbs) and Level 3 (HATEOAS).

---

## 1. GET /api/tasks (Get All Tasks)

### Level 2 Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Learn Express",
      "description": "Study Express.js fundamentals",
      "completed": false
    },
    {
      "id": 2,
      "title": "Build Task API",
      "description": "Create REST endpoints for tasks",
      "completed": false
    }
  ],
  "count": 2
}
```

### Level 3 Response
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
        "self": {
          "href": "/api/tasks/1",
          "method": "GET",
          "title": "Get this task"
        },
        "update": {
          "href": "/api/tasks/1",
          "method": "PUT",
          "title": "Update this task"
        },
        "delete": {
          "href": "/api/tasks/1",
          "method": "DELETE",
          "title": "Delete this task"
        },
        "mark_complete": {
          "href": "/api/tasks/1",
          "method": "PUT",
          "title": "Mark as complete",
          "body": { "completed": true }
        },
        "mark_incomplete": {
          "href": "/api/tasks/1",
          "method": "PUT",
          "title": "Mark as incomplete",
          "body": { "completed": false }
        },
        "collection": {
          "href": "/api/tasks",
          "method": "GET",
          "title": "Get all tasks"
        }
      }
    },
    {
      "id": 2,
      "title": "Build Task API",
      "description": "Create REST endpoints for tasks",
      "completed": false,
      "_links": {
        "self": {
          "href": "/api/tasks/2",
          "method": "GET",
          "title": "Get this task"
        },
        "update": {
          "href": "/api/tasks/2",
          "method": "PUT",
          "title": "Update this task"
        },
        "delete": {
          "href": "/api/tasks/2",
          "method": "DELETE",
          "title": "Delete this task"
        },
        "mark_complete": {
          "href": "/api/tasks/2",
          "method": "PUT",
          "title": "Mark as complete",
          "body": { "completed": true }
        },
        "mark_incomplete": {
          "href": "/api/tasks/2",
          "method": "PUT",
          "title": "Mark as incomplete",
          "body": { "completed": false }
        },
        "collection": {
          "href": "/api/tasks",
          "method": "GET",
          "title": "Get all tasks"
        }
      }
    }
  ],
  "count": 2,
  "_links": {
    "self": {
      "href": "/api/tasks",
      "method": "GET",
      "title": "Get all tasks"
    },
    "create": {
      "href": "/api/tasks",
      "method": "POST",
      "title": "Create a new task",
      "schema": {
        "type": "object",
        "required": ["title"],
        "properties": {
          "title": { "type": "string", "description": "Task title" },
          "description": { "type": "string", "description": "Task description (optional)" }
        }
      }
    },
    "api-root": {
      "href": "/",
      "method": "GET",
      "title": "API root and documentation"
    }
  }
}
```

### Differences

| Aspect | Level 2 | Level 3 |
|--------|---------|---------|
| Task count | 2 | 2 |
| Response size | ~250 bytes | ~2 KB |
| Includes `_links` | ❌ No | ✅ Yes |
| Shows available actions | ❌ No | ✅ Yes |
| Collection links | ❌ No | ✅ Yes |

---

## 2. GET /api/tasks/:id (Get Single Task)

### Level 2 Response
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

### Level 3 Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Learn Express",
    "description": "Study Express.js fundamentals",
    "completed": false,
    "_links": {
      "self": {
        "href": "/api/tasks/1",
        "method": "GET",
        "title": "Get this task"
      },
      "update": {
        "href": "/api/tasks/1",
        "method": "PUT",
        "title": "Update this task"
      },
      "delete": {
        "href": "/api/tasks/1",
        "method": "DELETE",
        "title": "Delete this task"
      },
      "mark_complete": {
        "href": "/api/tasks/1",
        "method": "PUT",
        "title": "Mark as complete",
        "body": { "completed": true }
      },
      "mark_incomplete": {
        "href": "/api/tasks/1",
        "method": "PUT",
        "title": "Mark as incomplete",
        "body": { "completed": false }
      },
      "collection": {
        "href": "/api/tasks",
        "method": "GET",
        "title": "Get all tasks"
      }
    }
  }
}
```

### What the Client Knows

**Level 2 (Hardcoded Knowledge):**
- "I need to PUT to `/api/tasks/1` to update"
- "I need to DELETE `/api/tasks/1` to delete"
- "I need to GET `/api/tasks` to see all"

**Level 3 (From Links):**
- Task links tell me exactly what I can do
- I don't need to know URL structure
- Server can change URLs and I still work

---

## 3. POST /api/tasks (Create Task)

### Level 2 Response
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 4,
    "title": "Learn Docker",
    "description": "Containerize the application",
    "completed": false
  }
}
```

### Level 3 Response
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 4,
    "title": "Learn Docker",
    "description": "Containerize the application",
    "completed": false,
    "_links": {
      "self": {
        "href": "/api/tasks/4",
        "method": "GET",
        "title": "Get this task"
      },
      "update": {
        "href": "/api/tasks/4",
        "method": "PUT",
        "title": "Update this task"
      },
      "delete": {
        "href": "/api/tasks/4",
        "method": "DELETE",
        "title": "Delete this task"
      },
      "mark_complete": {
        "href": "/api/tasks/4",
        "method": "PUT",
        "title": "Mark as complete",
        "body": { "completed": true }
      },
      "collection": {
        "href": "/api/tasks",
        "method": "GET",
        "title": "Get all tasks"
      }
    }
  },
  "_links": {
    "all-tasks": {
      "href": "/api/tasks",
      "method": "GET",
      "title": "View all tasks"
    },
    "api-root": {
      "href": "/",
      "method": "GET",
      "title": "Back to API root"
    }
  }
}
```

### What This Means

**Level 2:**
- Client receives new task ID
- Client must hardcode "go to `/api/tasks/1`" next
- Client must know it can update the new task

**Level 3:**
- Links tell client exactly what it can do next
- Client can follow "update" link immediately
- Client knows all available options

---

## 4. PUT /api/tasks/:id (Update Task)

### Level 2 Response
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Completed: Learn Express",
    "description": "Study Express.js fundamentals",
    "completed": true
  }
}
```

### Level 3 Response
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "title": "Completed: Learn Express",
    "description": "Study Express.js fundamentals",
    "completed": true,
    "_links": {
      "self": {
        "href": "/api/tasks/1",
        "method": "GET",
        "title": "Get this task"
      },
      "update": {
        "href": "/api/tasks/1",
        "method": "PUT",
        "title": "Update this task"
      },
      "delete": {
        "href": "/api/tasks/1",
        "method": "DELETE",
        "title": "Delete this task"
      },
      "mark_complete": {
        "href": "/api/tasks/1",
        "method": "PUT",
        "title": "Mark as complete",
        "body": { "completed": true }
      },
      "mark_incomplete": {
        "href": "/api/tasks/1",
        "method": "PUT",
        "title": "Mark as incomplete",
        "body": { "completed": false }
      },
      "collection": {
        "href": "/api/tasks",
        "method": "GET",
        "title": "Get all tasks"
      }
    }
  },
  "_links": {
    "all-tasks": {
      "href": "/api/tasks",
      "method": "GET",
      "title": "View all tasks"
    },
    "api-root": {
      "href": "/",
      "method": "GET",
      "title": "Back to API root"
    }
  }
}
```

---

## 5. DELETE /api/tasks/:id (Delete Task)

### Level 2 Response
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": 3,
    "title": "Add Error Handling",
    "description": "Implement global error handler",
    "completed": false
  }
}
```

### Level 3 Response
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "data": {
    "id": 3,
    "title": "Add Error Handling",
    "description": "Implement global error handler",
    "completed": false
  },
  "_links": {
    "all-tasks": {
      "href": "/api/tasks",
      "method": "GET",
      "title": "View all tasks"
    },
    "create-task": {
      "href": "/api/tasks",
      "method": "POST",
      "title": "Create a new task"
    },
    "api-root": {
      "href": "/",
      "method": "GET",
      "title": "Back to API root"
    }
  }
}
```

---

## 6. Error Responses

### 404 Not Found - Level 2
```json
{
  "success": false,
  "error": "Task with ID 999 not found"
}
```

### 404 Not Found - Level 3
```json
{
  "success": false,
  "error": "Task with ID 999 not found",
  "_links": {
    "all-tasks": {
      "href": "/api/tasks",
      "method": "GET",
      "title": "View all tasks"
    },
    "create-task": {
      "href": "/api/tasks",
      "method": "POST",
      "title": "Create a new task"
    }
  }
}
```

### 400 Bad Request - Level 2
```json
{
  "success": false,
  "error": "Title is required and must be a non-empty string"
}
```

### 400 Bad Request - Level 3
```json
{
  "success": false,
  "error": "Title is required and must be a non-empty string",
  "_links": {
    "all-tasks": {
      "href": "/api/tasks",
      "method": "GET",
      "title": "View all tasks"
    },
    "api-root": {
      "href": "/",
      "method": "GET",
      "title": "Back to API root"
    }
  }
}
```

---

## 7. API Root - NEW in Level 3

### Level 3 Only: GET /

```json
{
  "success": true,
  "message": "Task Management API - Richardson Maturity Model Level 3 (HATEOAS)",
  "version": "2.0.0",
  "maturityLevel": 3,
  "description": "Fully RESTful API with hypermedia-driven resources",
  "_links": {
    "tasks": {
      "href": "/api/tasks",
      "method": "GET",
      "title": "Get all tasks"
    },
    "create-task": {
      "href": "/api/tasks",
      "method": "POST",
      "title": "Create a new task"
    },
    "health": {
      "href": "/health",
      "method": "GET",
      "title": "Health check"
    },
    "documentation": {
      "href": "/docs",
      "method": "GET",
      "title": "API Documentation"
    }
  }
}
```

### Level 3 Only: GET /docs

```json
{
  "success": true,
  "title": "Task Management API Documentation",
  "maturityLevel": "Level 3 (HATEOAS)",
  "baseUrl": "http://localhost:5000",
  "endpoints": {
    "GET /api/tasks": {
      "description": "Retrieve all tasks",
      "statusCode": 200,
      "response": { "success": true, "data": "array", "count": "number", "_links": "object" }
    },
    "GET /api/tasks/:id": {
      "description": "Retrieve a specific task",
      "statusCode": 200,
      "response": { "success": true, "data": "object with _links" }
    },
    "POST /api/tasks": {
      "description": "Create a new task",
      "statusCode": 201,
      "body": { "title": "string (required)", "description": "string (optional)" },
      "response": { "success": true, "message": "string", "data": "object with _links" }
    },
    "PUT /api/tasks/:id": {
      "description": "Update a task",
      "statusCode": 200,
      "body": { "title": "string (optional)", "description": "string (optional)", "completed": "boolean (optional)" },
      "response": { "success": true, "message": "string", "data": "object with _links" }
    },
    "DELETE /api/tasks/:id": {
      "description": "Delete a task",
      "statusCode": 200,
      "response": { "success": true, "message": "string", "data": "object" }
    }
  },
  "_links": {
    "api-root": { "href": "/", "method": "GET", "title": "Back to API root" },
    "tasks": { "href": "/api/tasks", "method": "GET", "title": "View all tasks" }
  }
}
```

---

## Key Takeaways

### Level 2 Advantages
- Simpler responses
- Smaller payload sizes
- Meets REST HTTP requirements
- Sufficient for many use cases

### Level 3 Advantages
- Self-documenting API
- API discovery from root endpoint
- Clients don't hardcode URLs
- Server can evolve without breaking clients
- Better developer experience
- Full REST compliance (HATEOAS requirement)
- Production-ready maturity

### Size Comparison
| Response Type | Level 2 | Level 3 | Overhead |
|---|---|---|---|
| Get all tasks | ~250 bytes | ~2 KB | ~7x |
| Get single task | ~150 bytes | ~800 bytes | ~5x |
| Create task | ~150 bytes | ~1 KB | ~6x |
| Error response | ~100 bytes | ~300 bytes | ~3x |

**Network Impact:** Negligible for typical APIs with reasonable link counts.

---

## When to Use Each Level

### Use Level 2 When:
- Building internal APIs quickly
- Response size is critical
- Clients will be updated infrequently
- Team understands API by convention

### Use Level 3 When:
- Building public APIs
- API will evolve over time
- Multiple clients need to integrate
- Want to avoid URL coupling
- Need production-grade maturity
- Building a platform/ecosystem

---

## Conclusion

Level 3 (HATEOAS) is worth the minimal overhead for:
- Better client experience
- API flexibility
- True REST compliance
- Future-proofing against changes

The improved API provides both versions, allowing gradual migration!

