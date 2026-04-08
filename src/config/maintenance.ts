// Maintenance Mode Configuration
// Set this to true to enable maintenance mode across the entire application

// Helper function to parse environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  return value === 'true' ? true : value === 'false' ? false : defaultValue;
};

const getEnvArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = import.meta.env[key];
  return value ? value.split(',').map((item: string) => item.trim()) : defaultValue;
};

export const MAINTENANCE_CONFIG = {
  // Toggle maintenance mode on/off (can be overridden by VITE_MAINTENANCE_ENABLED)
  enabled: getEnvBoolean('VITE_MAINTENANCE_ENABLED', false),
  
  // Maintenance message displayed to users
  title: getEnvVar('VITE_MAINTENANCE_TITLE', "We'll be back soon!"),
  message: getEnvVar('VITE_MAINTENANCE_MESSAGE', "We're currently performing scheduled maintenance to improve your experience. Thank you for your patience."),
  
  // Estimated completion time (optional) - can be overridden by VITE_MAINTENANCE_COMPLETION
  estimatedCompletion: getEnvVar('VITE_MAINTENANCE_COMPLETION') || null, // e.g., "2024-03-30T14:00:00Z" for ISO string or null to hide
  
  // Contact information for urgent matters
  contact: {
    email: getEnvVar('VITE_MAINTENANCE_CONTACT_EMAIL', 'support@deeptech.com'),
    phone: getEnvVar('VITE_MAINTENANCE_CONTACT_PHONE') || null, // e.g., "+1-555-123-4567" or null to hide
  },
  
  // Social media links (optional)
  socialLinks: {
    twitter: getEnvVar('VITE_MAINTENANCE_TWITTER', 'https://twitter.com/deeptech'),
    linkedin: getEnvVar('VITE_MAINTENANCE_LINKEDIN', 'https://linkedin.com/company/deeptech'),
    website: getEnvVar('VITE_MAINTENANCE_WEBSITE', 'https://deeptech.com')
  },
  
  // Allow specific user roles to bypass maintenance mode (optional)
  bypassRoles: getEnvArray('VITE_MAINTENANCE_BYPASS_ROLES', ["admin"]), // ["admin", "developer"] or [] to disable
  
  // Show maintenance page for specific routes only (empty array = all routes)
  restrictedRoutes: getEnvArray('VITE_MAINTENANCE_RESTRICTED_ROUTES', []), // ["/dashboard", "/admin"] or [] for all routes
};

// Utility function to check if maintenance mode should be active
export const isMaintenanceActive = (): boolean => {
  return MAINTENANCE_CONFIG.enabled;
};

// Utility function to check if user can bypass maintenance mode
export const canBypassMaintenance = (userRole?: string): boolean => {
  if (!userRole || MAINTENANCE_CONFIG.bypassRoles.length === 0) {
    return false;
  }
  return MAINTENANCE_CONFIG.bypassRoles.includes(userRole);
};

// Utility function to check if route is restricted during maintenance
export const isRouteRestricted = (path: string): boolean => {
  if (MAINTENANCE_CONFIG.restrictedRoutes.length === 0) {
    return true; // All routes restricted if array is empty
  }
  return MAINTENANCE_CONFIG.restrictedRoutes.some(route => path.startsWith(route));
};