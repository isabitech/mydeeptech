import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import { useDTUserDashboard } from '../../../hooks/User/useDTUserDashboard';



const UserHeader = () => {
   const { data, getDashboardData } = useDTUserDashboard();
   const location = useLocation();
 
   // Fetch dashboard data on component mount
   useEffect(() => {
     getDashboardData();
   }, [getDashboardData]);

   // Determine title based on current route
   const getTitle = () => {
     // Check if we're on the overview page (dashboard root)
     if (location.pathname === '/dashboard' || location.pathname === '/dashboard/' || location.pathname === '/dashboard/overview') {
       return `Welcome back, ${data?.userProfile?.fullName ?? ""}`;
     }

     // For other pages, extract the page name from the URL
     const pathSegments = location.pathname.split('/').filter(Boolean);
     const lastSegment = pathSegments[pathSegments.length - 1];

     // Convert URL segment to proper title case
     if (lastSegment && lastSegment !== 'dashboard') {
       return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
     }

     // Default fallback
     return `Welcome back, ${data?.userProfile?.fullName ?? ""}`;
   };

  return  <Header title={getTitle()} />
}

export default UserHeader