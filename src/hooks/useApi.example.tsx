import React from 'react';
import { useAxiosApi, createMultimediaAssessmentApi } from '../service/axiosApi';

// Example component showing how to use the new hook
const ExampleApiComponent: React.FC = () => {
  // Use the hook to get axios instance with React Router navigation
  const { axiosInstance, apiRequest, logoutUser } = useAxiosApi();

  // Create API functions that use the hook's axios instance
  const api = createMultimediaAssessmentApi(axiosInstance);

  const handleApiCall = async () => {
    try {
      // Example API call
      const result = await api.getAvailableAssessments();
      console.log('Assessment data:', result);
    } catch (error) {
      // Error handling - if it's a 401, the user will be redirected automatically
      console.error('API call failed:', error);
    }
  };

  const handleManualLogout = () => {
    // You can also trigger logout manually
    logoutUser('User logged out manually');
  };

  return (
    <div>
      <button onClick={handleApiCall}>
        Make API Call
      </button>
      <button onClick={handleManualLogout}>
        Logout
      </button>
    </div>
  );
};

// Alternative approach: Use the hook to create a custom API hook
export const useMultimediaApi = () => {
  const { axiosInstance } = useAxiosApi();
  return createMultimediaAssessmentApi(axiosInstance);
};

// Even cleaner usage in components
const AnotherExampleComponent: React.FC = () => {
  const api = useMultimediaApi();

  const fetchAssessments = async () => {
    try {
      const assessments = await api.getAvailableAssessments();
      // Handle success
    } catch (error) {
      // Error handling - 401s will automatically redirect
    }
  };

  return (
    <button onClick={fetchAssessments}>
      Fetch Assessments
    </button>
  );
};

export default ExampleApiComponent;