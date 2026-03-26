import { EditOutlined } from "@ant-design/icons";
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Space, 
  Tag, 
  message 
} from "antd";
import { Assessment } from './types';
import { getAverageScore, getScoreColor } from './assessment-utils';
import { grading } from './grading-data';

const { TextArea } = Input;
const { Option } = Select;

interface ReviewAssessmentModalProps {
  visible: boolean;
  onCancel: () => void;
  assessment: Assessment | null;
  form: any; // Antd Form instance
  onSubmit: (values: any) => void;
  loading: boolean;
  englishScore: string;
  problemSolvingScore: string;
}

const ReviewAssessmentModal = ({
  visible,
  onCancel,
  assessment,
  form,
  onSubmit,
  loading,
  englishScore,
  problemSolvingScore
}: ReviewAssessmentModalProps) => {

  // Calculate dynamic total based on current form values
  const getDynamicTotal = () => {
    if (!assessment) return 0;
    
    const currentEnglish = (englishScore && englishScore.trim() !== '') 
      ? parseInt(englishScore) 
      : 0;
    const currentProblemSolving = (problemSolvingScore && problemSolvingScore.trim() !== '') 
      ? parseInt(problemSolvingScore) 
      : 0;
    
    return currentEnglish + currentProblemSolving;
  };

  // Calculate dynamic average based on current form values
  const getDynamicAverage = () => {
    if (!assessment) return 0;
    
    const currentEnglish = (englishScore && englishScore.trim() !== '') 
      ? parseInt(englishScore) 
      : 0;
    const currentProblemSolving = (problemSolvingScore && problemSolvingScore.trim() !== '') 
      ? parseInt(problemSolvingScore) 
      : 0;
    
    // Only calculate average if both scores are provided
    if (currentEnglish > 0 && currentProblemSolving > 0) {
      return Math.round((currentEnglish + currentProblemSolving) / 2);
    }
    
    // If only one score is provided, return that score
    if (currentEnglish > 0) return currentEnglish;
    if (currentProblemSolving > 0) return currentProblemSolving;
    
    // If no scores provided, fall back to original assessment average
    return getAverageScore(assessment);
  };

  if (!assessment) return null;

  return (
    <Modal
      title={
        <div className="flex items-center">
          <EditOutlined className="mr-2 text-[#F6921E]" />
          Review Assessment
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-lg">{assessment.fullName}</h4>
              <p className="text-gray-600">{assessment.emailAddress}</p>
            </div>
            <div className="text-right">
              <div className="flex gap-2 mb-2">
                <Tag color={getScoreColor(getDynamicAverage())} className="text-lg px-3 py-1">
                  Avg: {getDynamicAverage()}
                </Tag>
                <Tag color="blue" className="text-lg px-3 py-1">
                  Total: {getDynamicTotal()}
                </Tag>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                English: {assessment.englishTestScore} | Problem Solving: {assessment.problemSolvingScore}
              </div>
            </div>
          </div>
        </div>
        
        <Form
          form={form}
          onFinish={onSubmit}
          layout="vertical"
        >
          {/* Problem Solving Score */}
          <Form.Item
            name="problemSolvingScore"
            label="Problem Solving Score (Optional)"
            rules={[
              {
                pattern: /^\d+$/,
                message: "Score must be a number"
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve(); // Allow empty since it's optional
                  const num = parseInt(value);
                  if (num < 0 || num > 599) {
                    return Promise.reject(new Error('Score must be between 0 and 599'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              placeholder="Enter problem solving score (0-599)"
              type="number"
              min="0"
              max="599"
              maxLength={3}
              onChange={(e) => {
                const value = e.target.value;
                if (value && parseInt(value) > 599) {
                  e.target.value = '599';
                  form.setFieldValue('problemSolvingScore', '599');
                }
              }}
            />
          </Form.Item>
          
          {/* English Score */}
          <Form.Item
            name="englishScore"
            label="English Score (Optional)"
            rules={[
              {
                pattern: /^\d+$/,
                message: "Score must be a number"
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve(); // Allow empty since it's optional
                  const num = parseInt(value);
                  if (num < 0 || num > 599) {
                    return Promise.reject(new Error('Score must be between 0 and 599'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input 
              placeholder="Enter english score (0-599)"
              type="number"
              min="0"
              max="599"
              maxLength={3}
              onChange={(e) => {
                const value = e.target.value;
                if (value && parseInt(value) > 599) {
                  e.target.value = '599';
                  form.setFieldValue('englishScore', '599');
                }
              }}
            />
          </Form.Item>

          {/* Review Rating */}
          <Form.Item
            name="reviewRating"
            label="Review Rating"
            rules={[{ required: true, message: "Please provide a rating" }]}
          >
            <Select 
              placeholder="Select a grade"
              showSearch
              optionFilterProp="children"
            >
              {grading.map((item) => (
                <Option key={item.grade} value={item.grade}>
                  {item.grade} - {item.level} ({item.range})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* Review Comment */}
          <Form.Item
            name="reviewerComment"
            label="Review Description"
          >
            <TextArea
              rows={4}
              placeholder="Provide detailed feedback about the candidate's performance..."
            />
          </Form.Item>
          
          <Form.Item className="mb-0 flex justify-end">
            <Space>
              <Button onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit" 
                loading={loading}
                disabled={loading}
              >
                Submit Review
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ReviewAssessmentModal;