import { useCallback, useEffect, useState } from 'react';
import { multimediaAssessmentApi } from '../../../../service/axiosApi';
import { AssessmentConfig, VideoReel } from '../types';

export const useReelAssessmentData = () => {
  const [assessments, setAssessments] = useState<AssessmentConfig[]>([]);
  const [videoReels, setVideoReels] = useState<VideoReel[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await multimediaAssessmentApi.getAssessmentConfigs();
      if (res.success) setAssessments(res.data.assessmentConfigs || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadVideoReels = useCallback(async () => {
    try {
      setLoading(true);
      const res = await multimediaAssessmentApi.getAllVideoReels();
      if (res.success) setVideoReels(res.data.videoReels || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssessments();
    loadVideoReels();
  }, [loadAssessments, loadVideoReels]);

  return {
    assessments,
    videoReels,
    loading,
    reloadAssessments: loadAssessments,
    reloadReels: loadVideoReels,
  };
};
