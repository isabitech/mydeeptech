# User Role Management System

## Overview
This module provides a comprehensive user role management system for the MyDeepTech platform. It allows administrators to manage user roles, view role permissions, and control access to different parts of the system.

## Features

### 1. User Role Management Tab
- View all users in a comprehensive table format
- Display role statistics with visual indicators
- Edit user roles with confirmation modals
- Reason tracking for role changes
- Real-time role updates

### 2. Role Permissions Tab
- Visual permission matrix showing what each role can access
- Role overview cards with descriptions
- Categorized permissions (access, management, content, system)

## Available Roles

### Administrator (`admin`)
- **Description**: Full system access and management capabilities
- **Permissions**: Complete access to all system features
- **Icon**: Crown
- **Color**: Red
- **Editable**: No (system role)

### Regular User (`user`)
- **Description**: Standard user with basic access to the platform
- **Permissions**: Basic dashboard access
- **Icon**: User
- **Color**: Blue
- **Editable**: Yes

### Annotator (`annotator`)
- **Description**: Can perform annotation tasks and access projects
- **Permissions**: Dashboard access + annotation capabilities
- **Icon**: Edit
- **Color**: Green
- **Editable**: Yes

### Moderator (`moderator`)
- **Description**: Can moderate content and manage user interactions
- **Permissions**: Dashboard access + moderation tools + analytics
- **Icon**: Shield
- **Color**: Orange
- **Editable**: Yes

### QA Reviewer (`qa_reviewer`)
- **Description**: Can review and approve annotation work
- **Permissions**: Dashboard access + review capabilities + reports
- **Icon**: Eye
- **Color**: Purple
- **Editable**: Yes

## Navigation
Access the role management system through:
- **Admin Dashboard** → **User Roles** (sidebar menu)
- **Route**: `/admin/users`

## Components Structure
```
src/pages/Dashboard/Admin/usermgt/
├── UserManagement.tsx              # Main entry point
├── ComprehensiveRoleManagement.tsx # Tab container
├── RoleManagement.tsx              # User role management
├── RolePermissions.tsx             # Permission matrix
└── README.md                       # This file
```

## Services
- **roleManagementService.ts**: API service for role management operations
- Located at: `src/services/roleManagementService.ts`

## Types
- **user.types.ts**: TypeScript interfaces for users, roles, and permissions
- Located at: `src/types/user.types.ts`

## Backend Integration
The system expects the following API endpoints:

### User Management
- `GET /auth/getAllUsers` - Fetch all users
- `PUT /admin/users/:userId/role` - Update user role
- `GET /auth/users/:userId` - Get single user

### Role Management (Future)
- `GET /admin/roles` - Get all roles
- `POST /admin/roles` - Create new role
- `PUT /admin/roles/:roleId` - Update role
- `DELETE /admin/roles/:roleId` - Delete role

## Usage Example

### Updating a User Role
1. Navigate to Admin Dashboard → User Roles
2. Click "Edit Role" button for the desired user
3. Select new role from dropdown
4. Optionally provide a reason for the change
5. Click "OK" to confirm

### Viewing Permissions
1. Switch to "Role Permissions" tab
2. Review the permission matrix
3. See which roles have access to specific features

## Styling
The components use:
- **Ant Design** components for UI consistency
- **Tailwind CSS** for custom styling
- **Gilroy font family** (match your existing design)

## Future Enhancements
1. **Custom Role Creation**: Allow admins to create custom roles
2. **Permission Management**: Fine-grained permission editing
3. **Role History**: Track role change history
4. **Bulk Operations**: Bulk role assignments
5. **Role Templates**: Pre-defined role templates
6. **Audit Logging**: Comprehensive audit trail

## Troubleshooting

### Common Issues
1. **Users not loading**: Check API endpoint and network connectivity
2. **Role updates failing**: Verify backend API implementation
3. **Permission denied**: Ensure current user has admin privileges

### Development Notes
- The system currently uses mock permission data
- API calls are handled through the roleManagementService
- Error handling includes user-friendly notifications
- Components are responsive and mobile-friendly