import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setGlobalNavigate } from '../service/axiosApi';
import { setAuthStoreNavigate } from '../store/useAuthStore';

/**
 * Hook to set up global navigation for auth redirects
 * This prevents page refreshes when authentication fails or user logs out
 * Sets up navigation for both axios interceptors and auth store
 * 
 * Usage: Add this to your App.tsx or root component:
 * 
 * ```tsx
 * import { useGlobalNavigation } from './hooks/useGlobalNavigation';
 * 
 * function App() {
 *   useGlobalNavigation(); // Set up global navigation
 *   
 *   return (
 *     <BrowserRouter>
 *       Your app components here
 *     </BrowserRouter>
 *   );
 * }
 * ```
 */
export const useGlobalNavigation = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Set the global navigate callback for axios auth redirects
    setGlobalNavigate((path: string, options?: { replace?: boolean }) => {
      navigate(path, options);
    });
    
    // Set the auth store navigate callback for logout redirects
    setAuthStoreNavigate((path: string, options?: { replace?: boolean }) => {
      navigate(path, options);
    });
    
    // Cleanup function to remove the callbacks when component unmounts
    return () => {
      setGlobalNavigate(null);
      setAuthStoreNavigate(null);
    };
  }, [navigate]);
};

// Alternative: Component version if you prefer
export const GlobalNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useGlobalNavigation();
  return <>{children}</>;
};