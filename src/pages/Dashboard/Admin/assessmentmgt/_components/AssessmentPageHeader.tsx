import { BookOutlined } from "@ant-design/icons";
import { Typography } from "antd";

const { Title, Text } = Typography;

const AssessmentPageHeader = () => {
  return (
    <div className="mb-8">
      <div className="flex justify-between flex-wrap gap-3 items-start mb-4">
        <div>
          <Title level={2} className="!mb-2 !text-[#333333] font-[gilroy-regular]">
            <BookOutlined className="mr-3 text-[#F6921E]" />
            Review Assessments
          </Title>
          <Text className="text-gray-600 text-lg font-[gilroy-regular]">
            Review assessment performance and view detailed submission analytics
          </Text>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPageHeader;