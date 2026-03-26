import { Assessment } from './types';
import { grading } from './grading-data';

export const getAverageScore = (assessment: Assessment): number => {
  const englishScore = parseInt(assessment.englishTestScore);
  const problemSolvingScore = parseInt(assessment.problemSolvingScore);
  return Math.round((englishScore + problemSolvingScore) / 2);
};

export const getTotalScore = (assessment: Assessment): number => {
  const englishScore = parseInt(assessment.englishTestScore);
  const problemSolvingScore = parseInt(assessment.problemSolvingScore);
  return englishScore + problemSolvingScore;
};

export const getScoreColor = (score: number): string => {
  if (score >= 90) return "green";
  if (score >= 70) return "orange";
  return "red";
};

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "completed": return "green";
    case "pending": return "orange";
    case "reviewed": return "blue";
    case "not-started": return "default";
    default: return "default";
  }
};

// Utility function to format rating for display
export const formatRatingDisplay = (rating: Assessment['reviewRating']): string => {
  if (!rating) return '';
  
  if (typeof rating === 'string') {
    const foundGrade = grading.find(g => g.grade === rating);
    return foundGrade ? `${rating} - ${foundGrade.level}` : rating;
  } else if (typeof rating === 'number') {
    return `Rating: ${rating}`;
  } else if (rating && typeof rating === 'object' && 'grade' in rating) {
    return `${rating.grade} - ${rating.level}`;
  } else {
    return '';
  }
};

// Utility function to extract rating value for form
export const extractRatingValue = (rating: Assessment['reviewRating']): string | number => {
  if (!rating) return '';
  
  if (typeof rating === 'string' || typeof rating === 'number') {
    return rating;
  } else if (rating && typeof rating === 'object' && 'grade' in rating) {
    return rating.grade;
  } else {
    return '';
  }
};