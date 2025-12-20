import { useState } from "react";
import { multimediaAssessmentApi } from "../../service/axiosApi";
import { VideoReel } from "../../types/multimedia-assessment.types";

interface GetReelsResult {
  success: boolean;
  data?: {
    reels: VideoReel[];
    totalAvailable: number;
    usedReelsCount: number;
  };
  error?: string;
}

export const useGetAvailableReels = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reels, setReels] = useState<VideoReel[]>([]);

  const getReels = async (
    assessmentId: string,
    params?: { niche?: string; limit?: number }
  ): Promise<GetReelsResult> => {
    setLoading(true);
    setError(null);

    try {
      const response = await multimediaAssessmentApi.getAvailableReels(assessmentId, params);
      
      if (response.data?.success && response.data?.data) {
        const reelsData = response.data.data;
        setReels(reelsData.reels);
        return { success: true, data: reelsData };
      } else {
        const errorMessage = response.data?.message || "Failed to fetch available reels";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching reels. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setReels([]);
  };

  return {
    getReels,
    loading,
    error,
    reels,
    resetState,
  };
};