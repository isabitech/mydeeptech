import React from 'react';
import { useLocation } from 'react-router-dom';
import MaintenancePage from '../pages/Maintenance/MaintenancePage';
import { useMaintenanceCheck } from '../hooks/useMaintenance';

interface MaintenanceGuardProps {
  children: React.ReactNode;
  userRole?: string;
  fallback?: React.ComponentType;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ 
  children, 
  userRole,
  fallback: CustomMaintenancePage
}) => {
  const { shouldShowMaintenance } = useMaintenanceCheck(userRole);

  if (shouldShowMaintenance) {
    const MaintenanceComponent = CustomMaintenancePage || MaintenancePage;
    return <MaintenanceComponent onRetry={() => window.location.reload()} />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;