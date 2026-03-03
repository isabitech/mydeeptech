import { useEffect } from 'react'
import Header from './Header'
import { useDTUserDashboard } from '../../../hooks/User/useDTUserDashboard';



const UserHeader = () => {

   const { data, getDashboardData } = useDTUserDashboard();
 
   // Fetch dashboard data on component mount
   useEffect(() => {
     getDashboardData();
   }, [getDashboardData]);

  return  <Header title={`Welcome back, ${data?.userProfile?.fullName ?? ""}`} />
}

export default UserHeader