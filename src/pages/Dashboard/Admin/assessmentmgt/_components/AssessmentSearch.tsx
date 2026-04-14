import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select } from "antd";
import assessmentQueryService from "../../../../../services/assessement-service/assessement-query";

export interface ScoreRange {
  label: string;
  min: number;
  max: number;
  value: string;
}

interface AssessmentSearchProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  scoreRange?: string;
  onScoreRangeChange?: (value: string) => void;
}

const scoreRangeOptions: ScoreRange[] = [
  { label: "All Scores", min: 0, max: Infinity, value: "all" },
  { label: "0-99", min: 0, max: 99, value: "0-99" },
  { label: "100-199", min: 100, max: 199, value: "100-199" },
  { label: "200-299", min: 200, max: 299, value: "200-299" },
  { label: "300-399", min: 300, max: 399, value: "300-399" },
  { label: "400-499", min: 400, max: 499, value: "400-499" },
  { label: "500-599", min: 500, max: 599, value: "500-599" },
];

const AssessmentSearch = ({ searchText, onSearchChange, scoreRange = "all", onScoreRangeChange }: AssessmentSearchProps) => {
   const {refreshAssessmentReviews, isAssessmentReviewsLoading } = assessmentQueryService.useAssessmentReviews();
  return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4 flex-wrap flex-1">
        <Input
          placeholder="Search by name or email address"
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value.trim())}
          size="middle"
          className="max-w-md"
          allowClear
        />
        
        <Select
          placeholder="Filter by score range"
          value={scoreRange}
          onChange={onScoreRangeChange}
          size="middle"
          className="min-w-[150px]"
          options={scoreRangeOptions.map(option => ({
            label: option.label,
            value: option.value
          }))}
          allowClear
        />
      </div>
      
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