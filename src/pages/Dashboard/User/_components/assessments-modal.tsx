import React from 'react';
import { Modal, Typography, List, Divider, Button } from 'antd';
import { BookOutlined, SolutionOutlined, InfoCircleOutlined, ExportOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface AssessmentsModalProps {
  open: boolean;
  onCancel: () => void;
}

const AssessmentsModal: React.FC<AssessmentsModalProps> = ({ open, onCancel }) => {
  const googleFormLink = "https://forms.gle/QSfUC1AxwNZ9oQFc8";

  const britishCouncilSteps: React.ReactNode[] = [
    <>Download and install <a href="https://flonnect.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Flonnect</a> on Chrome on your PC.</>,
    "Enable screen + Camera recording.",
    "Enable mic + system audio.",
    "Start recording.",
    <>Go to the British Council English score Website [<a href="https://www.englishscore.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">https://www.englishscore.com/</a>] to access the test.</>,
    "Take the core skills test, speaking test and writing test.",
    "After taking tests, stop the recording.",
    "Create a Mydeeptech folder in your drive.",
    "Upload a screenshot of your score page and upload Flonnect recording in the folder.",
    <>Submit your test folder link to the <a href={googleFormLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Google form</a>.</>
  ];

  const skillAssessmentSteps: React.ReactNode[] = [
    <>Download and install <a href="https://flonnect.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Flonnect</a> on Chrome on your PC.</>,
    "Enable screen + Camera recording.",
    "Enable mic + system audio.",
    "Start recording.",
    <>Go to <a href="https://aptitude-test.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">https://aptitude-test.com/</a> to access the test.</>,
    "After taking tests, stop the recording.",
    "Create a Mydeeptech folder in your drive.",
    "Upload a screenshot of your score page and upload Flonnect recording in the folder.",
    <>Submit your test folder link to the <a href={googleFormLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Google form</a>.</>
  ];

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0, color: '#4c1d95' }}>
          MyDeepTech Core Assessments
        </Title>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
      className="premium-modal"
    >
      <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOutlined className="text-purple-600 text-xl" />
            <Title level={5} className="!mb-0">Steps for British Council English test</Title>
          </div>
          <List
            size="small"
            dataSource={britishCouncilSteps}
            renderItem={(item, index) => (
              <List.Item className="border-0 !py-1">
                <Text><span className="font-bold mr-2 text-purple-600">{index + 1}.</span> {item}</Text>
              </List.Item>
            )}
          />
        </section>

        <Divider className="my-6 border-purple-100" />

        <section>
          <div className="flex items-center gap-2 mb-3">
            <SolutionOutlined className="text-purple-600 text-xl" />
            <Title level={5} className="!mb-0">Steps for Problem solving/ Skill Assessment</Title>
          </div>
          <List
            size="small"
            dataSource={skillAssessmentSteps}
            renderItem={(item, index) => (
              <List.Item className="border-0 !py-1">
                <Text><span className="font-bold mr-2 text-purple-600">{index + 1}.</span> {item}</Text>
              </List.Item>
            )}
          />
        </section>



        <div className="mt-8 p-4 bg-purple-50 rounded-lg flex items-start gap-3">
          <InfoCircleOutlined className="text-purple-500 mt-1" />
          <p className="text-xs text-purple-700 leading-relaxed m-0">
            Please follow all steps carefully to ensure your assessment is properly recorded and recorded.
            If you encounter any issues, please reach out to the support team on Slack.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AssessmentsModal;
