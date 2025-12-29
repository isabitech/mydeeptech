# Multimedia Assessment API - Frontend Integration

## Authentication
All endpoints require JWT token in header: `Authorization: Bearer {token}`

## Core Workflow

### 1. Start Assessment
```
POST /api/assessments/multimedia/{assessmentId}/start
{assessmentId: 'sfdsgerye434354'}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "676c123abc456def789",
    "availableReels": [
      {
        "id": "reel123",
        "youtubeUrl": "https://youtube.com/embed/abc123",
        "title": "Video Title",
        "niche": "cooking"
      }
    ],
    "timeLimit": 3600,
    "tasksRequired": 3
  }
}
```

### 2. Get Session Status
```
GET /api/assessments/multimedia/session/{submissionId}
```

### 3. Save Task Progress
```
POST /api/assessments/multimedia/{submissionId}/save-progress
```
**Payload:**
```json
{
  "taskNumber": 1,
  "conversation": {
    "originalVideoId": "reel123",
    "startingPoint": "video",
    "turns": [
      {
        "turnNumber": 1,
        "userPrompt": "What is happening here?",
        "aiResponse": {
          "responseText": "I can see a cooking demonstration...",
          "videoSegment": {
            "startTime": 45.5,
            "endTime": 52.3,
            "segmentUrl": "https://youtube.com/embed/abc123?start=45&end=52",
            "content": "Person demonstrates chopping vegetables with proper knife technique"
          }
        }
      }
    ]
  }
}
```

### 4. Submit Task
```
POST /api/assessments/multimedia/{submissionId}/submit-task/{taskNumber}
```
**Requirements:** Minimum 3 conversation turns per task

### 5. Submit Final Assessment
```
POST /api/assessments/multimedia/{submissionId}/submit
```
**Requirements:** All tasks must be completed

## Timer Controls
```
POST /api/assessments/multimedia/{submissionId}/timer
```
**Payload:**
```json
{
  "action": "start" | "pause" | "resume"
}
```

## Key Rules
- **Minimum Turns:** Each task needs ≥3 conversation turns
- **Video Segments:** AI responses must include startTime/endTime
- **Auto-Save:** Save progress frequently during conversation
- **Sequential:** Complete tasks in order: Progress → Submit Task → Final Submit
- **Unlimited Retakes:** No attempt limits (24h cooldown after failures)

## Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "incompleteTasks": [1, 2] // if applicable
}
```

## Status Codes
- `200` - Success
- `400` - Validation error
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error