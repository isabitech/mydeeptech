# QA Management System - Complete API Documentation

## Overview
The QA (Quality Assurance) Management System allows administrators to manage user QA status with a simplified 3-category approach.

## QA Status Categories

### 1. **pending** (Default)
- **Description**: User registered but not yet reviewed for QA work
- **Default Status**: All new users get this status automatically
- **Next Actions**: Admin can approve or reject

### 2. **approved** (Admin Approved)  
- **Description**: User has been approved by admin for QA work
- **Access Level**: Can participate in QA tasks and projects
- **Set By**: Admin using QA approval endpoint

### 3. **rejected** (Admin Rejected)
- **Description**: User has been rejected for QA work
- **Access Level**: Limited access to QA features
- **Set By**: Admin using QA rejection endpoint

---

## API Endpoints

### 1. Get All QA Users
**URL:** `GET /api/admin/qa-users`

**Authentication:** Admin JWT required

**Query Parameters:**
- `qaStatus` (optional): Filter by status - "pending", "approved", "rejected"
- `page` (optional): Page number (default: 1)
- `limit` (optional): Users per page (default: 50)
- `search` (optional): Search by name or email

**Example Request:**
```http
GET /api/admin/qa-users?qaStatus=pending&page=1&limit=20&search=john
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Retrieved 20 QA users successfully",
  "data": {
    "qaUsers": [
      {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "qaStatus": "pending",
        "annotatorStatus": "active",
        "microTaskerStatus": "active",
        "phoneNumber": "+1234567890",
        "country": "USA",
        "createdAt": "2024-01-10T10:30:45.123Z",
        "updatedAt": "2024-01-15T14:22:33.456Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 23,
      "totalUsers": 450,
      "usersPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statusCounts": {
      "pending": 420,
      "approved": 25,
      "rejected": 5,
      "total": 450
    },
    "filters": {
      "qaStatus": "pending",
      "search": "john"
    }
  }
}
```

### 2. Approve User for QA
**URL:** `PATCH /api/admin/dtusers/:userId/qa-approve`

**Authentication:** Admin JWT required

**URL Parameters:**
- `userId` (required): MongoDB ObjectId of user to approve

**Example Request:**
```http
PATCH /api/admin/dtusers/60f7b3b3b3b3b3b3b3b3b3b3/qa-approve
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "QA status approved successfully for John Doe",
  "data": {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "John Doe", 
    "email": "john.doe@example.com",
    "previousQAStatus": "pending",
    "newQAStatus": "approved",
    "annotatorStatus": "active",
    "microTaskerStatus": "active",
    "updatedAt": "2024-01-15T10:30:45.123Z",
    "approvedBy": "admin@company.com"
  }
}
```

### 3. Reject User for QA
**URL:** `PATCH /api/admin/dtusers/:userId/qa-reject`

**Authentication:** Admin JWT required

**URL Parameters:**
- `userId` (required): MongoDB ObjectId of user to reject

**Request Body (Optional):**
```json
{
  "reason": "Does not meet minimum QA requirements"
}
```

**Example Request:**
```http
PATCH /api/admin/dtusers/60f7b3b3b3b3b3b3b3b3b3b3/qa-reject
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "reason": "Insufficient experience in quality assurance"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "QA status rejected for John Doe",
  "data": {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "John Doe",
    "email": "john.doe@example.com", 
    "previousQAStatus": "pending",
    "newQAStatus": "rejected",
    "annotatorStatus": "active",
    "microTaskerStatus": "active",
    "updatedAt": "2024-01-15T10:30:45.123Z",
    "rejectedBy": "admin@company.com",
    "reason": "Insufficient experience in quality assurance"
  }
}
```

---

## Error Responses

### 400 Bad Request - Invalid User ID
```json
{
  "success": false,
  "message": "Invalid user ID format"
}
```

### 400 Bad Request - Status Already Set
```json
{
  "success": false,
  "message": "User is already approved for QA status",
  "data": {
    "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "currentQAStatus": "approved"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. Admin authentication required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error updating QA status",
  "error": "Detailed error message"
}
```

---

## Database Schema

### DTUser Model - qaStatus Field
```javascript
qaStatus: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending",
  required: true
}
```

### Migration Information
- **Migration Script**: `scripts/updateQaStatusToThreeCategories.js`
- **NPM Command**: `npm run update-qa-categories`
- **Previous Values**: "submitted", "verified" → converted to "pending"
- **Current Users**: 450 users with "pending" status

---

## Usage Examples

### Postman Collection
```javascript
// Get all pending QA users
pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/api/admin/qa-users?qaStatus=pending",
    method: "GET",
    header: {
        "Authorization": "Bearer " + pm.environment.get("adminToken")
    }
}, function(err, res) {
    pm.expect(res.code).to.equal(200);
    pm.expect(res.json().data.qaUsers).to.be.an('array');
});

// Approve user for QA
pm.sendRequest({
    url: pm.environment.get("baseUrl") + "/api/admin/dtusers/" + pm.environment.get("testUserId") + "/qa-approve",
    method: "PATCH",
    header: {
        "Authorization": "Bearer " + pm.environment.get("adminToken"),
        "Content-Type": "application/json"
    }
}, function(err, res) {
    pm.expect(res.code).to.equal(200);
    pm.expect(res.json().data.newQAStatus).to.equal("approved");
});
```

### cURL Examples
```bash
# Get all QA users
curl -X GET \
  "https://api.yourapp.com/api/admin/qa-users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Approve user for QA
curl -X PATCH \
  "https://api.yourapp.com/api/admin/dtusers/USER_ID/qa-approve" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Reject user for QA with reason
curl -X PATCH \
  "https://api.yourapp.com/api/admin/dtusers/USER_ID/qa-reject" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Does not meet QA requirements"}'
```

---

## Security Features

### Authentication & Authorization
- ✅ Admin JWT token required for all endpoints
- ✅ User ID validation (MongoDB ObjectId format)
- ✅ Proper error handling and validation
- ✅ Audit logging with admin email tracking

### Data Validation
- ✅ Enum validation on qaStatus field (database level)
- ✅ Prevents duplicate status changes
- ✅ Input sanitization for search queries
- ✅ Proper pagination limits

### Logging & Audit Trail
- ✅ All QA status changes logged with admin email
- ✅ Previous and new status tracking
- ✅ Operation timestamps and user identification
- ✅ Error tracking and debugging information

---

## Status Transition Rules

### Valid Transitions
- `pending` → `approved` ✅
- `pending` → `rejected` ✅
- `approved` → `rejected` ✅
- `rejected` → `approved` ✅

### Duplicate Prevention
- ✅ Approving already approved user returns 400 error
- ✅ Rejecting already rejected user returns 400 error
- ✅ Status change validation before database update

---

## Integration with Frontend

### DTUser Login Response (Updated)
The `qaStatus` field is now included in all DTUser authentication responses:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "qaStatus": "approved",  // ← QA status included
      "annotatorStatus": "active",
      "microTaskerStatus": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Frontend Usage
```javascript
// Check if user is approved for QA work
if (user.qaStatus === 'approved') {
  // Show QA features and tasks
  enableQAFeatures();
} else if (user.qaStatus === 'pending') {
  // Show pending message
  showPendingMessage();
} else if (user.qaStatus === 'rejected') {
  // Show rejection message
  showRejectionMessage();
}
```

---

## Performance Considerations

### Pagination
- Default limit: 50 users per page
- Maximum recommended limit: 100 users per page  
- Efficient MongoDB queries with proper indexing

### Database Indexing
Recommended indexes:
```javascript
// Compound index for efficient filtering and sorting
db.dtusers.createIndex({ "qaStatus": 1, "updatedAt": -1, "createdAt": -1 })

// Text search index for name/email search
db.dtusers.createIndex({ 
  "fullName": "text", 
  "email": "text" 
}, {
  "weights": { "fullName": 10, "email": 5 }
})
```

### Query Optimization
- ✅ Selective field projection to reduce data transfer
- ✅ Efficient aggregation for status counts
- ✅ Proper sort order (newest first)
- ✅ Skip and limit for pagination

---

## Future Enhancements

### Planned Features
- 📧 **Email Notifications**: Automated emails on status changes
- 📊 **Advanced Analytics**: QA status change history and trends
- 🔄 **Bulk Operations**: Approve/reject multiple users at once
- 📝 **Status Comments**: Allow detailed notes on status changes
- ⏰ **Status Expiry**: Automatic status review after time periods

### API Versioning
- Current version: v1
- Future versions will maintain backward compatibility
- Deprecation notices will be provided 6 months in advance

---

## Migration History

### December 21, 2024 - QA Status Simplification
- **Previous Values**: `["pending", "submitted", "verified", "approved", "rejected"]`
- **New Values**: `["pending", "approved", "rejected"]`
- **Migration Result**: 450 users updated, 0 data loss
- **Backward Compatibility**: All existing "submitted" and "verified" converted to "pending"

---

## Support & Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check admin JWT token validity
2. **400 Invalid ID**: Ensure userId is valid MongoDB ObjectId
3. **404 User Not Found**: Verify user exists in database
4. **400 Already Approved/Rejected**: Check current user status first

### Debugging
- Enable console logging for admin operations
- Check MongoDB connection and user permissions  
- Verify admin authentication middleware
- Review request/response format matching documentation

### Contact
For API support and questions:
- **Documentation**: This file and related API docs
- **Logs**: Check server console for detailed error information
- **Database**: Verify user data and status integrity

---

Created: December 21, 2024  
Last Updated: December 21, 2024  
API Version: v1