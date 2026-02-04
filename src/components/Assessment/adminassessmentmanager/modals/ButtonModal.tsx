import { Modal, Button, Space } from "antd";

interface Props {
  open: boolean;
  onCancel: () => void;
  onCreateAssessmentClick: () => void; 
  onCategoryFormClick: () => void;    
}

export const ButtonModal = ({
  open,
  onCancel,
  onCreateAssessmentClick,
  onCategoryFormClick,
}: Props) => {
  return (
    <Modal
      title="Create New"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={400}
      destroyOnClose
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        <Button
          type="primary"
          block
          onClick={() => {
            onCancel();               
            onCreateAssessmentClick(); 
          }}
        >
          New Assessment
        </Button>

        <Button
          block
          onClick={() => {
            onCancel();                
            onCategoryFormClick();      
          }}
        >
          Create your Domain
        </Button>
      </Space>
    </Modal>
  );
};
