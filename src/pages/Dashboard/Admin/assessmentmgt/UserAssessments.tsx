import { Form, Spin, message } from "antd";
import { useState } from "react";
import assessmentQueryService from "../../../../services/assessement-service/assessement-query";
import { GetSubmissionsResponseSchema } from "../../../../validators/assessment-reviews/assessment-reviews-schema";
import assessmentMutationService from "../../../../services/assessement-service/assessment-mutation";
import useDebounce from "../../../../hooks/useDebounce";

import { grading } from "./_components/grading-data";
import {
  AssessmentPageHeader,
  AssessmentSearch,
  AssessmentTable,
  ReviewAssessmentModal,
  ViewAssessmentModal,
  Assessment,
  extractRatingValue
} from "./_components";
import ErrorMessage from "../../../../lib/error-message";

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

  const handleReviewSubmit = (values: any) => {
    if (!selectedAssessment) return;
    if(isUpdateReviewLoading) return;

    // Find the complete grading object based on selected grade string
    const selectedGrade = grading.find(g => g.grade === values.reviewRating);

    if (!selectedGrade) {
      message.error("Invalid grade selected");
      return;
    }

    // Transform to match schema expectations
    const payload = {
      assessmentId: selectedAssessment._id,
      reviewerComment: values.reviewerComment || "",
      reviewStatus: "Reviewed",
      reviewRating: {
        grade: selectedGrade.grade,
        level: selectedGrade.level
      },
      englishTestScore: values.englishScore ? parseInt(values.englishScore) : 0,
      problemSolvingScore: values.problemSolvingScore ? parseInt(values.problemSolvingScore) : 0
    };

    updateReviewMutation.mutate(payload, {
      onSuccess: () => {
        setIsReviewModalVisible(false);
        reviewForm.resetFields();
        message.success("Assessment reviewed successfully");
      },
      onError: (error) => {
        message.error(ErrorMessage(error));
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