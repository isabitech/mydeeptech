import { useState, useCallback } from 'react';
import { multimediaAssessmentApi } from '../../service/axiosApi';

interface SubmissionStats {
  pending: number;
  approved: number;
  rejected: number;
  inReview: number;
}

interface UseSubmissionStatsReturn {
  stats: SubmissionStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useGetSubmissionStats = (): UseSubmissionStatsReturn => {
  const [stats, setStats] = useState<SubmissionStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    inReview: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to use the dedicated stats endpoint first
      const response = await multimediaAssessmentApi.getSubmissionStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        // Fallback: Get counts from individual endpoints
        const [pendingResp, approvedResp, rejectedResp] = await Promise.allSettled([
          multimediaAssessmentApi.getPendingSubmissions({ limit: 1 }),
          multimediaAssessmentApi.getApprovedSubmissions({ limit: 1 }),
          multimediaAssessmentApi.getRejectedSubmissions({ limit: 1 })
        ]);

        const pendingCount = pendingResp.status === 'fulfilled' && pendingResp.value?.success ? 
          (pendingResp.value.data?.pagination?.total || 0) : 0;
        
        const approvedCount = approvedResp.status === 'fulfilled' && approvedResp.value?.success ? 
          (approvedResp.value.data?.pagination?.total || 0) : 0;
        
        const rejectedCount = rejectedResp.status === 'fulfilled' && rejectedResp.value?.success ? 
          (rejectedResp.value.data?.pagination?.total || 0) : 0;

        setStats({
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          inReview: 0 // This might need to be calculated differently
        });
      }
    } catch (err) {
      console.error('Failed to fetch submission stats:', err);
      setError('Failed to load submission statistics');
      
      // Set mock data for development/testing
      setStats({
        pending: 15,
        approved: 42,
        rejected: 8,
        inReview: 3
      });
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    stats,
    loading,
    error,
    refetch
  };
};