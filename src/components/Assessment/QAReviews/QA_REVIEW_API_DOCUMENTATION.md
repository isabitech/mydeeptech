# QA Review System API Documentation

## Authentication
All endpoints require JWT token: `Authorization: Bearer {token}`

## QA Review Endpoints

### 1. Get Pending Submissions
```
GET /api/qa/submissions/pending
```
**Query Parameters:**
```
?page=1&limit=20&sortBy=submittedAt&sortOrder=desc&filterBy=all
```
**Filter Options:**
- `all` - All submitted assessments
- `priority` - Submissions older than 24 hours
- `recent` - Submissions within last 6 hours  
- `retakes` - Only retake attempts (attemptNumber > 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "_id": "submissionId",
        "userId": "userId",
        "userName": "John Doe",
        "userEmail": "john@example.com",
        "assessmentTitle": "Multimedia Assessment",
        "submittedAt": "2025-12-28T10:00:00Z",
        "avgScore": 7.5,
        "completionTime": 3600000,
        "waitingTime": 86400000,
        "attemptNumber": 1,
        "tasksCompleted": 3,
        "totalTasks": 3,
        "status": "submitted"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. Get Submission Details for Review
```
GET /api/qa/submissions/{submissionId}/review
```
**Response:**
```json
{
  "success": true,
  "data": {
    "submission": {
      "_id": "submissionId",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assessmentId": {
        "title": "Multimedia Assessment",
        "description": "Assessment description",
        "scoringWeights": {}
      },
      "tasks": [
        {
          "taskNumber": 1,
          "conversation": {
            "turns": [],
            "totalDuration": 120.5
          },
          "score": 8,
          "qaScore": null,
          "qaFeedback": null,
          "qualityRating": null
        }
      ],
      "metrics": {
        "totalScore": 24,
        "averageScore": 8.0,
        "completionTime": 3600000,
        "tasksCompleted": 3,
        "conversationsCreated": 3
      }
    },
    "qaReview": null,
    "isReviewed": false
  }
}
```

### 3. Review Individual Task
```
POST /api/qa/submissions/review-task
```
**Payload:**
```json
{
  "submissionId": "submissionId",
  "taskIndex": 0,
  "score": 8.5,
  "feedback": "Good conversation flow and relevant responses",
  "qualityRating": "Good",
  "notes": "Minor improvements needed in video segment timing"
}
```
**Field Requirements:**
- `taskIndex`: Integer ≥ 0 (task position in array)
- `score`: Number 0-10
- `qualityRating`: "Excellent" | "Good" | "Fair" | "Poor"
- `feedback`: String max 1000 chars (optional)
- `notes`: String max 2000 chars (optional)

**Response:**
```json
{
  "success": true,
  "message": "Task reviewed successfully",
  "data": {
    "taskReview": {
      "taskIndex": 0,
      "score": 8.5,
      "feedback": "Good conversation flow",
      "qualityRating": "Good",
      "notes": "Minor improvements needed",
      "reviewedAt": "2025-12-28T10:30:00Z"
    },
    "totalTasksReviewed": 1
  }
}
```

### 4. Submit Final Review
```
POST /api/qa/submissions/final-review
```
**Payload:**
```json
{
  "submissionId": "submissionId",
  "overallScore": 8.2,
  "overallFeedback": "Solid performance with good conversation skills",
  "decision": "Approve",
  "privateNotes": "Ready for approval - meets all criteria"
}
```
**Field Requirements:**
- `overallScore`: Number 0-10
- `decision`: "Approve" | "Reject" | "Request Revision"
- `overallFeedback`: String max 2000 chars (optional)
- `privateNotes`: String max 2000 chars (optional)

**Response:**
```json
{
  "success": true,
  "message": "Assessment approved successfully",
  "data": {
    "decision": "Approve",
    "overallScore": 8.2,
    "submissionStatus": "approved",
    "userStatus": "approved",
    "emailSent": true
  }
}
```

### 5. Batch Review Multiple Submissions
```
POST /api/qa/submissions/batch-review
```
**Payload:**
```json
{
  "submissionIds": ["id1", "id2", "id3"],
  "decision": "Approve",
  "overallFeedback": "Batch approved - all meet criteria"
}
```
**Limits:** 1-50 submissions per batch

### 6. QA Reviewer Dashboard
```
GET /api/qa/dashboard
```
Returns reviewer statistics and pending work summary.

### 7. QA Analytics
```
GET /api/qa/analytics
```
Returns system-wide QA analytics and submission statistics.

## Status Flow
1. **submitted** → QA review pending
2. **approved** → User passes assessment
3. **rejected** → User fails (can retake after cooldown)
4. **revision_requested** → User must revise and resubmit

## Key Features
- **Email Notifications:** Automatic emails sent on final decisions
- **User Status Updates:** Syncs with user's multimedia assessment status
- **Task-Level Scoring:** Individual task review before final decision
- **Retake Handling:** Failed users can retake after 24h cooldown
- **Batch Processing:** Handle multiple submissions efficiently