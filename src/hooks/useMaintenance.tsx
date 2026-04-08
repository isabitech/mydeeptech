import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MAINTENANCE_CONFIG, 
  isMaintenanceActive, 
  canBypassMaintenance, 
  isRouteRestricted 
} from '../config/maintenance';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  canAccess: boolean;
  maintenanceConfig: typeof MAINTENANCE_CONFIG;
  refreshMaintenanceStatus: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

interface MaintenanceProviderProps {
  children: ReactNode;
  userRole?: string;
}

export const MaintenanceProvider: React.FC<MaintenanceProviderProps> = ({ 
  children, 
  userRole 
}) => {
  const [maintenanceMode, setMaintenanceMode] = useState(isMaintenanceActive());
  const location = useLocation();

  const refreshMaintenanceStatus = () => {
    setMaintenanceMode(isMaintenanceActive());
  };

  // Auto-refresh maintenance status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMaintenanceStatus();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Determine if user can access the current route during maintenance
  const canAccess = !maintenanceMode || 
                   canBypassMaintenance(userRole) || 
                   !isRouteRestricted(location.pathname);

  const value = {
    isMaintenanceMode: maintenanceMode,
    canAccess,
    maintenanceConfig: MAINTENANCE_CONFIG,
    refreshMaintenanceStatus,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
};

// Hook to use maintenance context
export const useMaintenance = (): MaintenanceContextType => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};

// Hook to check if maintenance mode is preventing access
export const useMaintenanceCheck = (userRole?: string) => {
  const location = useLocation();
  const isMaintenanceModeActive = isMaintenanceActive();
  const canUserBypass = canBypassMaintenance(userRole);
  const isCurrentRouteRestricted = isRouteRestricted(location.pathname);

  return {
    isMaintenanceActive: isMaintenanceModeActive,
    shouldShowMaintenance: isMaintenanceModeActive && !canUserBypass && isCurrentRouteRestricted,
    canBypass: canUserBypass,
    isRouteRestricted: isCurrentRouteRestricted,
  };
};