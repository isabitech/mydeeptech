# Project Management System Implementation

## Overview
This implementation provides a complete project management system for annotation tasks where admins can create projects, users can apply, and automated email notifications handle the workflow.

## Features Implemented

### Admin Features
1. **Project Management**
   - Create, read, update, delete projects
   - Rich project details with categories, pay rates, deadlines
   - Filter and search projects
   - View project statistics

2. **Application Management**
   - View all applications with filtering
   - Approve/reject applications with review notes
   - Email notifications to users
   - Application statistics and summaries

### User Features
1. **Browse Available Projects**
   - Filter by category, difficulty, pay rate
   - Search projects
   - View detailed project information
   - Apply to projects with cover letters

2. **Active Projects**
   - View approved and active projects
   - Track project progress
   - Access project work areas

3. **Pending Applications**
   - View submitted applications awaiting review
   - Track application status

## File Structure

```
src/
├── types/
│   └── project.types.ts                    # TypeScript definitions
├── hooks/
│   └── Auth/
│       ├── Admin/
│       │   └── Projects/
│       │       ├── useAdminProjects.ts     # Admin project management
│       │       └── useAdminApplications.ts # Admin application management
│       └── User/
│           └── Projects/
│               ├── useUserProjects.ts      # User project browsing
│               └── useUserActiveProjects.ts # User active projects
├── pages/
│   └── Dashboard/
│       ├── Admin/
│       │   └── projectmgt/
│       │       ├── NewProjectManagement.tsx    # Admin project management UI
│       │       └── ApplicationManagement.tsx   # Admin application management UI
│       └── User/
│           └── projects/
│               ├── Projects.tsx             # Main projects container
│               ├── AvailableProjects.tsx    # Browse available projects
│               ├── ActiveProjects.tsx       # View active projects
│               └── PendingProjects.tsx      # View pending applications
└── store/
    └── api/
        └── endpoints.ts                     # API endpoint definitions
```

## API Integration

### Admin Endpoints
- `POST /admin/projects` - Create new project
- `GET /admin/projects` - Get all projects with filtering
- `PATCH /admin/projects/:id` - Update project
- `DELETE /admin/projects/:id` - Delete project
- `GET /admin/applications` - Get all applications
- `PATCH /admin/applications/:id/approve` - Approve application
- `PATCH /admin/applications/:id/reject` - Reject application

### User Endpoints
- `GET /auth/projects` - Browse available projects
- `POST /auth/projects/:id/apply` - Apply to project
- `GET /auth/activeProjects/:userId` - Get user's active projects

## Component Features

### NewProjectManagement.tsx
- Comprehensive project creation/editing forms
- Rich filtering and search capabilities
- Project statistics cards
- Detailed project view modals
- Bulk operations support

### ApplicationManagement.tsx
- Application filtering by status and project
- Approve/reject workflows with review notes
- Email notification integration
- Detailed applicant information views

### AvailableProjects.tsx
- Project browsing with advanced filters
- Project application workflow
- Real-time availability checking
- Responsive grid layout

### ActiveProjects.tsx
- Progress tracking for active projects
- Project work area access
- Legacy assessment integration
- Statistics dashboard

### PendingProjects.tsx
- Application status tracking
- Detailed application information
- Admin review status updates

## Usage

### Admin Workflow
1. Create projects with detailed specifications
2. Monitor applications as they come in
3. Review and approve/reject applications
4. Track project progress and statistics

### User Workflow
1. Browse available projects with filters
2. Apply to interesting projects with cover letters
3. Track application status
4. Work on approved projects

## Configuration

### Environment Variables Required
```bash
VITE_API_URL=your-api-base-url
```

### Dependencies Added
- moment - Date handling
- @ant-design/icons - UI icons
- Various Ant Design components

## Key Features

### Project Categories
- Text Annotation
- Image Annotation
- Audio Annotation
- Video Annotation
- Data Labeling
- Content Moderation
- Transcription
- Translation
- Sentiment Analysis
- Entity Recognition
- Classification
- Object Detection
- Semantic Segmentation
- Survey Research
- Data Entry
- Quality Assurance
- Other

### Pay Rate Types
- Per Task
- Per Hour
- Per Project
- Per Annotation

### Difficulty Levels
- Beginner
- Intermediate
- Advanced
- Expert

### Application Workflow
1. User applies with cover letter and availability
2. Admin receives notification
3. Admin reviews and approves/rejects
4. User receives email notification
5. If approved, project becomes active for user

## Navigation Updates

### Admin Sidebar
- Added "Applications" menu item
- Links to `/admin/applications`

### Routes Updated
- Added ApplicationManagement route
- Updated ProjectManagement to use new component

## Error Handling
- Comprehensive error states
- Loading indicators
- Retry mechanisms
- User-friendly error messages

## Responsive Design
- Mobile-friendly layouts
- Responsive grid systems
- Adaptive filtering controls
- Touch-friendly interactions

## Future Enhancements
- Real-time notifications
- Project progress tracking
- Advanced analytics dashboard
- Bulk application processing
- Project templates
- Integration with external tools

This implementation provides a solid foundation for a comprehensive annotation project management system with room for future expansion.