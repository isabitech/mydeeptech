# Maintenance Mode System

This system provides a comprehensive maintenance mode functionality for the application that can be easily toggled on/off and configured for different scenarios.

## Quick Start

To enable maintenance mode across the entire application:

1. Open `src/config/maintenance.ts`
2. Set `enabled: true`
3. Customize the message and other settings as needed

```typescript
export const MAINTENANCE_CONFIG = {
  enabled: true, // Change this to enable/disable maintenance mode
  title: "We'll be back soon!",
  message: "We're performing scheduled maintenance...",
  // ... other config options
};
```

## Features

### ✅ Easy Toggle
- Single configuration file to enable/disable maintenance mode
- No code deployment required for toggling (if using environment variables)

### ✅ Flexible Routing
- Block all routes or specific routes only
- Bypass maintenance for specific user roles (e.g., admins)

### ✅ Rich UI
- Professional maintenance page with company branding
- Shows estimated completion time with live countdown
- Contact information and social links
- Responsive design matching your app's style

### ✅ User Experience
- Automatic refresh checks every 30 seconds
- Manual refresh button
- Shows current time for user reference

## Configuration Options

### `src/config/maintenance.ts`

```typescript
export const MAINTENANCE_CONFIG = {
  // Main toggle
  enabled: false,
  
  // User-facing content
  title: "We'll be back soon!",
  message: "Custom maintenance message...",
  
  // Optional estimated completion time
  estimatedCompletion: "2024-03-30T14:00:00Z", // ISO string or null
  
  // Contact information
  contact: {
    email: "support@deeptech.com",
    phone: "+1-555-123-4567", // or null
  },
  
  // Social links
  socialLinks: {
    twitter: "https://twitter.com/deeptech",
    linkedin: "https://linkedin.com/company/deeptech",
    website: "https://deeptech.com"
  },
  
  // User roles that can bypass maintenance
  bypassRoles: ["admin"], // or [] to disable
  
  // Restrict only specific routes (empty = all routes)
  restrictedRoutes: ["/dashboard", "/admin"], // or [] for all
};
```

## Usage Examples

### 1. Full Site Maintenance
```typescript
{
  enabled: true,
  restrictedRoutes: [], // Empty = all routes blocked
  bypassRoles: ["admin"], // Only admins can access
}
```

### 2. Dashboard Maintenance Only
```typescript
{
  enabled: true,
  restrictedRoutes: ["/dashboard", "/admin"],
  bypassRoles: [], // No bypass allowed
}
```

### 3. Scheduled Maintenance with Timeline
```typescript
{
  enabled: true,
  estimatedCompletion: "2024-03-30T14:00:00Z",
  title: "Scheduled Maintenance",
  message: "We're upgrading our servers to serve you better!",
}
```

## Components

### MaintenanceGuard
Wraps your app or specific routes to show maintenance page when needed:

```tsx
import { MaintenanceGuard } from './components/MaintenanceGuard';

// Wrap entire app
<MaintenanceGuard userRole={currentUser?.role}>
  <App />
</MaintenanceGuard>

// Or wrap specific routes
<Route path="/dashboard" element={
  <MaintenanceGuard userRole="user">
    <Dashboard />
  </MaintenanceGuard>
} />
```

### MaintenancePage
The actual maintenance page component. Automatically used by MaintenanceGuard:

```tsx
import MaintenancePage from './pages/Maintenance/MaintenancePage';

// Use directly if needed
<MaintenancePage onRetry={() => window.location.reload()} />
```

### Hooks

#### useMaintenance()
Access maintenance state and config:

```tsx
import { useMaintenance } from './hooks/useMaintenance';

function MyComponent() {
  const { 
    isMaintenanceMode, 
    canAccess, 
    maintenanceConfig,
    refreshMaintenanceStatus 
  } = useMaintenance();

  // Use in your component logic
}
```

#### useMaintenanceCheck()
Check maintenance status for current route:

```tsx
import { useMaintenanceCheck } from './hooks/useMaintenance';

function MyComponent() {
  const { 
    isMaintenanceActive,
    shouldShowMaintenance,
    canBypass,
    isRouteRestricted 
  } = useMaintenanceCheck(userRole);
}
```

## Environment Variables (Optional)

For production deployments, you can override config with environment variables:

```bash
# In your .env file
VITE_MAINTENANCE_ENABLED=true
VITE_MAINTENANCE_TITLE="Emergency Maintenance"
VITE_MAINTENANCE_MESSAGE="We're fixing a critical issue..."
VITE_MAINTENANCE_COMPLETION="2024-03-30T14:00:00Z"
```

Then update your config:

```typescript
export const MAINTENANCE_CONFIG = {
  enabled: import.meta.env.VITE_MAINTENANCE_ENABLED === 'true',
  title: import.meta.env.VITE_MAINTENANCE_TITLE || "We'll be back soon!",
  // ... other overrides
};
```

## Customization

### Custom Maintenance Page
Create your own maintenance component:

```tsx
import { MaintenanceGuard } from './components/MaintenanceGuard';
import CustomMaintenancePage from './CustomMaintenancePage';

<MaintenanceGuard fallback={CustomMaintenancePage}>
  <App />
</MaintenanceGuard>
```

### Styling
The maintenance page uses Tailwind CSS and matches your app's design system:
- Gilroy fonts (defined in index.css)
- Primary/secondary color scheme (from tailwind.config.ts)
- Ant Design components for consistency

## Testing

Test different maintenance scenarios:

```typescript
// In browser console or test file
import { MAINTENANCE_CONFIG } from './config/maintenance';

// Enable maintenance mode
MAINTENANCE_CONFIG.enabled = true;

// Test role bypass
localStorage.setItem('userRole', 'admin');

// Test route restrictions
MAINTENANCE_CONFIG.restrictedRoutes = ['/dashboard'];
```

## Production Deployment

### Option 1: Environment Variables
Use environment variables to control maintenance without code changes.

### Option 2: Configuration API
Extend the system to read from a backend API:

```typescript
// In maintenance.ts
const fetchMaintenanceConfig = async () => {
  const response = await fetch('/api/maintenance-config');
  return response.json();
};

export const MAINTENANCE_CONFIG = await fetchMaintenanceConfig();
```

### Option 3: Admin Dashboard
Add maintenance controls to your admin dashboard:

```tsx
function MaintenanceToggle() {
  const toggleMaintenance = async (enabled: boolean) => {
    await fetch('/api/maintenance', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  };

  return (
    <Switch onChange={toggleMaintenance}>
      Maintenance Mode
    </Switch>
  );
}
```

## Troubleshooting

### Maintenance page not showing
1. Check `MAINTENANCE_CONFIG.enabled` is `true`
2. Verify user role bypass settings
3. Check route restrictions
4. Ensure MaintenanceGuard is properly wrapped

### Page keeps refreshing
The page auto-checks every 30 seconds. Disable with:
```typescript
// In useMaintenance.tsx
// Comment out the setInterval in useEffect
```

### Custom styling not working
Ensure Tailwind classes are included in your build. Check `tailwind.config.ts` includes the maintenance component paths.

---

## Integration Checklist

- [x] Maintenance config file created
- [x] Maintenance page component created  
- [x] Maintenance guard component created
- [x] Hooks for maintenance state created
- [x] App.tsx updated with maintenance integration
- [x] Documentation completed

The maintenance system is ready to use! Simply toggle `enabled: true` in the config file to activate it.