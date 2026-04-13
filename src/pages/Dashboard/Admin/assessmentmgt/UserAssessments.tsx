import { Form, Spin, message } from "antd";
import { useState } from "react";
import assessmentQueryService from "../../../../services/assessement-service/assessement-query";
import { SubmitReviewSchema } from "../../../../validators/assessment-reviews/assessment-reviews-schema";
import assessmentMutationService from "../../../../services/assessement-service/assessment-mutation";
import useDebounce from "../../../../hooks/useDebounce";

// Form values interface
interface ReviewFormValues {
  reviewRating: string;
  englishScore: string | number;
  problemSolvingScore: string | number;
  reviewerComment?: string;
}

import {
  AssessmentPageHeader,
  AssessmentSearch,
  AssessmentTable,
  ReviewAssessmentModal,
  ViewAssessmentModal,
  Assessment,
  extractRatingValue
} from "./_components";
import errorMessage from "../../../../lib/error-message";

const UserAssessments = () => {
  const [searchText, setSearchText] = useState("");
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [reviewForm] = Form.useForm();
  
  // Debounce search text to avoid excessive API calls
  const debouncedSearchText = useDebounce(searchText, 500);
  
  // Watch form fields for dynamic calculations
  const problemSolvingScore = Form.useWatch('problemSolvingScore', reviewForm);
  const englishScore = Form.useWatch('englishScore', reviewForm);
 
  const { assessmentReviews, isAssessmentReviewsLoading } = assessmentQueryService.useAssessmentReviews(debouncedSearchText);
  const { updateReviewMutation, isUpdateReviewLoading } = assessmentMutationService.useUpdateReview();

  const handleReviewAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    if (assessment.reviewRating) {
      const ratingValue = extractRatingValue(assessment.reviewRating);
      
      reviewForm.setFieldsValue({
        reviewRating: ratingValue,
        // Populate with actual test scores from the assessment
        problemSolvingScore: assessment.problemSolvingScore,
        englishScore: assessment.englishTestScore,
        reviewerComment: assessment.reviewerComment
      });
    } else {
      reviewForm.setFieldsValue({
        // Even if no rating exists, populate with test scores
        problemSolvingScore: assessment.problemSolvingScore,
        englishScore: assessment.englishTestScore,
      });
      reviewForm.resetFields(['reviewRating', 'reviewerComment']);
    }
    setIsReviewModalVisible(true);
  };

  const handleViewAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsViewModalVisible(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
  };

  const handleReviewModalCancel = () => {
    setIsReviewModalVisible(false);
    reviewForm.resetFields();
  };

  const handleViewModalCancel = () => {
    setIsViewModalVisible(false);
  };

  const handleReviewSubmit = (values: ReviewFormValues) => {
    if (!selectedAssessment) return;
    if(isUpdateReviewLoading) return;

    // Transform to match schema expectations
       const payload = {
        assessmentId: selectedAssessment._id,
        reviewRating: values.reviewRating,
        englishTestScore: values.englishScore ? parseInt(values.englishScore.toString()) : 0,
        problemSolvingScore: values.problemSolvingScore ? parseInt(values.problemSolvingScore.toString()) : 0,
        reviewerComment: values.reviewerComment ?? "",
    };

    const result = SubmitReviewSchema.safeParse(payload);

    if(!result.success) {
      const errorMessages = result.error.issues[0]?.message || "Validation failed. Please check your input.";
      console.error("Validation error:", result.error);
      message.error(errorMessages);
      return;
    }
  
    updateReviewMutation.mutate(result.data, {
      onSuccess: () => {
        setIsReviewModalVisible(false);
        reviewForm.resetFields();
        message.success("Assessment reviewed successfully");
      },
      onError: (error) => {
        message.error(errorMessage(error));
      },
    });
  };

  return (
    <div className="p-6 font-[gilroy-regular]">
      {/* Header */}
      <AssessmentPageHeader />

      {/* Search Filter */}
      <AssessmentSearch
        searchText={searchText}
        onSearchChange={handleSearchChange}
      />

      {/* Table */}
      <Spin spinning={isAssessmentReviewsLoading}>
        <AssessmentTable
          assessments={assessmentReviews as Assessment[]}
          loading={isAssessmentReviewsLoading}
          onViewAssessment={handleViewAssessment}
          onReviewAssessment={handleReviewAssessment}
        />
      </Spin>

      {/* Review Assessment Modal */}
      <ReviewAssessmentModal
        visible={isReviewModalVisible}
        onCancel={handleReviewModalCancel}
        assessment={selectedAssessment}
        form={reviewForm}
        onSubmit={handleReviewSubmit}
        loading={isUpdateReviewLoading}
        englishScore={englishScore}
        problemSolvingScore={problemSolvingScore}
      />

      {/* View Assessment Details Modal */}
      <ViewAssessmentModal
        visible={isViewModalVisible}
        onCancel={handleViewModalCancel}
        assessment={selectedAssessment}
      />
    </div>
  );
};

export default UserAssessments;