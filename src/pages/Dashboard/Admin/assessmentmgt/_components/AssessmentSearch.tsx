import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import assessmentQueryService from "../../../../../services/assessement-service/assessement-query";

interface AssessmentSearchProps {
  searchText: string;
  onSearchChange: (value: string) => void;
}

const AssessmentSearch = ({ searchText, onSearchChange }: AssessmentSearchProps) => {
   const {refreshAssessmentReviews, isAssessmentReviewsLoading } = assessmentQueryService.useAssessmentReviews();
  return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
      <Input
        placeholder="Search by name or email address"
        prefix={<SearchOutlined className="text-gray-400" />}
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value.trim())}
        size="middle"
        className="max-w-md"
        allowClear
      />
      <Button 
        type="primary"
        icon={<ReloadOutlined />}
        onClick={refreshAssessmentReviews} 
        loading={isAssessmentReviewsLoading}
        disabled={isAssessmentReviewsLoading}
        size="small"
        >
        Refresh
      </Button>
    </div>
  );
};

export default AssessmentSearch;