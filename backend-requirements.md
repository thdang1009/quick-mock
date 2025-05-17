# QuickMock Backend Requirements

This document outlines the requirements for implementing the QuickMock backend service.

## API Endpoints

### 1. Create Mock Endpoint
- **URL**: `https://dangtrinh.site/mock`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "id": "unique-endpoint-id",
    "jsonResponse": "{\"data\": {\"example\": \"value\"}}",
    "method": "GET",
    "statusCode": 200,
    "delay": 0,
    "headers": {
      "Content-Type": "application/json"
    },
    "createdAt": 1234567890,
    "expiresAt": 1234599999
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "id": "unique-endpoint-id",
    "url": "https://dangtrinh.site/mock/unique-endpoint-id"
  }
  ```

### 2. Serve Mock Response
- **URL**: `https://dangtrinh.site/mock/:endpointId`
- **Method**: Any (matches the specified method in the endpoint configuration)
- **Response**: 
  - Returns the stored JSON response with the configured status code and headers
  - Delays the response by the specified milliseconds
  - Returns 404 if the endpoint does not exist or has expired

### 3. List User's Endpoints (Optional)
- **URL**: `https://dangtrinh.site/mock/list`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "endpoints": [
      {
        "id": "endpoint-id-1",
        "method": "GET",
        "path": "/api/users",
        "createdAt": 1234567890,
        "expiresAt": 1234599999
      },
      {
        "id": "endpoint-id-2",
        "method": "POST",
        "path": "/api/orders",
        "createdAt": 1234567890,
        "expiresAt": 1234599999
      }
    ]
  }
  ```

### 4. Delete Endpoint (Optional)
- **URL**: `https://dangtrinh.site/mock/:endpointId`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Endpoint deleted successfully"
  }
  ```

## Technical Requirements

1. **Performance**:
   - Response time should be under 200ms (excluding intentional delays)
   - Should handle at least 1000 requests per minute

2. **Storage**:
   - Endpoints can be stored in a database (MongoDB, PostgreSQL) or in-memory with persistence
   - Implement TTL (Time-To-Live) mechanism for automatic expiration

3. **Security**:
   - Validate and sanitize all user inputs
   - Implement rate limiting to prevent abuse
   - No authentication required for MVP, but should be designed to add it later

4. **Scalability**:
   - Design should allow for horizontal scaling
   - Consider using serverless functions for cost-efficiency

5. **Monitoring**:
   - Log all endpoint creations and accesses
   - Implement basic usage analytics

## Implementation Suggestions

1. **Technology Stack**:
   - Node.js with Express.js or Fastify
   - MongoDB with TTL indexes or Redis for temporary storage
   - Deploy on Vercel, Netlify, or AWS Lambda

2. **Code Organization**:
   - Use a controller/service/repository pattern
   - Implement proper error handling and logging
   - Use TypeScript for better type safety

3. **Testing**:
   - Unit tests for core functionality
   - Integration tests for API endpoints
   - Load testing to ensure performance requirements are met 