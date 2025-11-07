# Visual Form Builder - API Specification

**Version**: 1.0
**Date**: November 1, 2025
**Base URL**: `https://api.formbuilder.dev/api`
**Authentication**: JWT Bearer Token

---

## 1. Authentication Endpoints

### POST /auth/signup
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-user-id",
  "email": "user@example.com",
  "name": "John Doe",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email or weak password
- `409 Conflict` - Email already registered

---

### POST /auth/login
Authenticate and get JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "uuid-user-id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials

---

### POST /auth/logout
Invalidate current session

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content)**

---

## 2. Template Endpoints

### GET /templates
List user's templates with filtering

**Query Parameters:**
```
?domain=forms&category=registration&search=contact&page=1&limit=20&sort=recent
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "uuid-template-id",
      "name": "Contact Form - Medical Practice",
      "description": "Basic contact information form for new patients",
      "domain": "forms",
      "category": "registration",
      "tags": ["medical", "contact", "patient"],
      "thumbnail": "https://cdn.formbuilder.dev/templates/abc123.png",
      "metadata": {
        "componentCount": 8,
        "requiredFields": 4,
        "pages": 1,
        "horizontalLayouts": 1,
        "estimatedTime": 5
      },
      "createdAt": "2025-10-28T10:00:00Z",
      "updatedAt": "2025-10-30T15:30:00Z",
      "usedCount": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "pages": 3
  }
}
```

---

### GET /templates/:id
Get full template with form structure

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-template-id",
  "name": "Contact Form - Medical Practice",
  "description": "Basic contact information form for new patients",
  "domain": "forms",
  "category": "registration",
  "tags": ["medical", "contact", "patient"],
  "formStructure": {
    "formId": "form-abc123",
    "name": "Contact Form - Medical Practice",
    "domain": "forms",
    "version": "1.0",
    "pages": [
      {
        "pageId": "page-1",
        "title": "Contact Information",
        "components": [
          {
            "type": "heading",
            "id": "comp-1",
            "fieldId": "",
            "label": "Contact Information",
            "required": false,
            "validation": {},
            "properties": { "level": "h2" }
          },
          {
            "type": "horizontal_layout",
            "id": "row-1",
            "fieldId": "",
            "label": "Row Layout",
            "required": false,
            "children": [
              {
                "type": "text_input",
                "id": "comp-2",
                "fieldId": "first_name",
                "label": "First Name",
                "required": true,
                "validation": { "minLength": 1, "maxLength": 50 },
                "properties": { "placeholder": "Enter first name" }
              },
              {
                "type": "text_input",
                "id": "comp-3",
                "fieldId": "last_name",
                "label": "Last Name",
                "required": true,
                "validation": { "minLength": 1, "maxLength": 50 },
                "properties": { "placeholder": "Enter last name" }
              }
            ],
            "layoutConfig": {
              "distribution": "equal",
              "spacing": "normal",
              "alignment": "top"
            }
          }
        ]
      }
    ]
  },
  "metadata": {
    "componentCount": 8,
    "requiredFields": 4,
    "pages": 1,
    "horizontalLayouts": 1,
    "estimatedTime": 5
  },
  "createdAt": "2025-10-28T10:00:00Z",
  "updatedAt": "2025-10-30T15:30:00Z",
  "createdBy": {
    "id": "uuid-user-id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "usedCount": 12
}
```

**Error Responses:**
- `404 Not Found` - Template doesn't exist
- `403 Forbidden` - No permission to access template

---

### POST /templates
Create new template

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Contact Form - Medical Practice",
  "description": "Basic contact information form for new patients",
  "domain": "forms",
  "category": "registration",
  "tags": ["medical", "contact", "patient"],
  "formStructure": {
    "formId": "form-abc123",
    "name": "Contact Form - Medical Practice",
    "domain": "forms",
    "version": "1.0",
    "pages": [ /* form structure */ ]
  },
  "thumbnail": "base64-encoded-image-or-url"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-template-id",
  "name": "Contact Form - Medical Practice",
  "description": "Basic contact information form for new patients",
  "domain": "forms",
  "category": "registration",
  "tags": ["medical", "contact", "patient"],
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-01T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid form structure
- `413 Payload Too Large` - Template exceeds size limit (10MB)

---

### PUT /templates/:id
Update existing template

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Form Name",
  "description": "Updated description",
  "category": "new-category",
  "tags": ["updated", "tags"],
  "formStructure": { /* updated form */ }
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-template-id",
  "name": "Updated Form Name",
  "updatedAt": "2025-11-01T10:30:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Template doesn't exist
- `403 Forbidden` - No permission to update

---

### DELETE /templates/:id
Delete template permanently

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204 No Content)**

**Error Responses:**
- `404 Not Found` - Template doesn't exist
- `403 Forbidden` - No permission to delete

---

### GET /templates/:id/preview
Get template preview data (lightweight version)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-template-id",
  "name": "Contact Form - Medical Practice",
  "description": "Basic contact information form for new patients",
  "domain": "forms",
  "tags": ["medical", "contact", "patient"],
  "preview": {
    "componentCount": 8,
    "requiredFields": 4,
    "pages": 1,
    "layout": "mixed" /* or: simple, complex */
  },
  "stats": {
    "createdAt": "2025-10-28T10:00:00Z",
    "usedCount": 12,
    "createdBy": "John Doe"
  }
}
```

---

## 3. Form Endpoints

### POST /forms
Create a new form (for saving in-progress work)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "My Custom Contact Form",
  "domain": "forms",
  "formStructure": {
    /* complete form definition */
  },
  "baseTemplateId": "uuid-optional-template-id"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid-form-id",
  "name": "My Custom Contact Form",
  "domain": "forms",
  "createdAt": "2025-11-01T10:00:00Z"
}
```

---

### GET /forms/:id
Get form details

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": "uuid-form-id",
  "name": "My Custom Contact Form",
  "domain": "forms",
  "formStructure": { /* full structure */ },
  "createdAt": "2025-11-01T10:00:00Z",
  "updatedAt": "2025-11-01T10:00:00Z",
  "version": 1
}
```

---

### PUT /forms/:id
Update form

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "name": "Updated Form Name",
  "formStructure": { /* updated structure */ }
}
```

**Response (200 OK):**
```json
{
  "id": "uuid-form-id",
  "name": "Updated Form Name",
  "updatedAt": "2025-11-01T10:30:00Z",
  "version": 2
}
```

---

### POST /forms/:id/export
Export form as JSON

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?format=json&includeMetadata=true&minify=false
```

**Response (200 OK):**
```json
{
  "formId": "uuid-form-id",
  "name": "My Custom Contact Form",
  "domain": "forms",
  "version": "1.0",
  "exportedAt": "2025-11-01T10:00:00Z",
  "exportedBy": "user@example.com",
  "pages": [ /* full form structure */ ]
}
```

---

## 4. Error Response Format

All error responses follow this standard format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Email format invalid"
    },
    "timestamp": "2025-11-01T10:00:00Z",
    "requestId": "req-abc123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_REQUEST | 400 | Malformed request |
| VALIDATION_ERROR | 400 | Validation failed |
| UNAUTHORIZED | 401 | Missing/invalid authentication |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| TOO_LARGE | 413 | Payload exceeds limit |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

## 5. Rate Limiting

All endpoints enforce rate limiting:

**Headers in Response:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2025-11-01T11:00:00Z
```

**Limits:**
- Authenticated users: 1000 requests/hour
- Template creation: 100 templates/day
- Form submissions: 10,000/day

---

## 6. Webhook Events (Future)

When implemented, the following events will be available:

- `template.created` - New template created
- `template.updated` - Template modified
- `template.deleted` - Template deleted
- `form.submitted` - Form submission received
- `user.signup` - New user registered

---

## 7. Pagination

All list endpoints support pagination:

**Query Parameters:**
```
?page=1&limit=20&sort=-createdAt
```

**Sort Options:**
- `createdAt` - Sort by creation date (ascending)
- `-createdAt` - Sort by creation date (descending)
- `name` - Sort alphabetically
- `usedCount` - Sort by usage popularity

---

## 8. CORS Configuration

**Allowed Origins:**
```
https://formbuilder.dev
https://app.formbuilder.dev
http://localhost:3000 (development only)
```

**Allowed Methods:**
```
GET, POST, PUT, DELETE, OPTIONS
```

**Allowed Headers:**
```
Content-Type, Authorization, X-Requested-With
```

---

## 9. API Versioning

Current API version: `v1`

Future versions will be accessible at:
```
https://api.formbuilder.dev/api/v2/...
```

Deprecated endpoints will be supported for 6 months before removal.

---

**This specification is implementation-ready and follows REST best practices.**
