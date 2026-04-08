import { useNavigate } from 'react-router-dom';
import { useUserInfoActions } from '../store/useAuthStore';

type UserType = 'admin' | 'user';

interface UseLogoutOptions {
  userType?: UserType;
}

export const useLogout = (options?: UseLogoutOptions) => {
  const navigate = useNavigate();
  const { clearUserInfo } = useUserInfoActions();

  const logout = (userType?: UserType) => {
    // Clear session storage
    sessionStorage.removeItem('ACCESS_TOKEN');
    sessionStorage.removeItem('userInfo');

    // Clear local storage
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('userInfo');
    
    // Clear all session storage to ensure complete logout
    sessionStorage.clear();

    // Clear all local storage to ensure complete logout
    localStorage.clear();
    
    // Clear user info from zustand store
    clearUserInfo();

    // Determine redirect path based on userType
    // const finalUserType = userType || options?.userType;
    const redirectPath = options?.userType === "user" ? "/login"  : '/auth/admin-login'
    
    // Navigate to appropriate login page
    navigate(redirectPath, { replace: true });
  };

  return logout;
};

export default useLogout;