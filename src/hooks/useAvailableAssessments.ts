import { useState } from 'react';
import { apiGet, getErrorMessage } from '../service/apiUtils';

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: 'multimedia' | 'english_proficiency' | 'general';
  numberOfTasks: number;
  estimatedDuration: number; // in minutes
  timeLimit: number; // in minutes
  passingScore: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  isActive: boolean;
  userStatus?: 'not_started' | 'in_progress' | 'completed' | 'passed' | 'failed';
  lastAttempt?: {
    id: string;
    score?: number;
    completedAt?: string;
    status: string;
    canRetake: boolean;
  };
  maxAttempts?: number;
  currentAttempts?: number;
  instructions?: string;
  prerequisites?: string[];
}

interface AvailableAssessmentsResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Assessment[];
}

export const useAvailableAssessments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  // Get all available assessments for the user
  const getAvailableAssessments = async (): Promise<AvailableAssessmentsResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiGet('/api/assessments/available');
      
      if (response.success) {
        setAssessments(response.data || []);
        return {
          success: true,
          message: response.message,
          data: response.data
        };
      } else {
        const errorMessage = response.message || 'Failed to fetch available assessments';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Reset hook state
  const resetState = () => {
    setLoading(false);
    setError(null);
    setAssessments([]);
  };

  return {
    loading,
    error,
    assessments,
    getAvailableAssessments,
    resetState
  };
};