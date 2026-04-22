import { Button, Space } from "antd";
import { CheckOutlined, CloseOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { type AnnotatorUser, type QAUserSchema } from "../../../../../validators/annotators/annotators-schema";

interface ActionButtonsProps {
  selectedAnnotator: AnnotatorUser | QAUserSchema;
  updateLoading: boolean;
  qaLoading: boolean;
  onApprove: (type: 'annotator' | 'microtasker') => void;
  onReject: (type: 'annotator' | 'microtasker') => void;
  onElevateToQA: () => void;
  onRemoveFromQA: () => void;
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'large';
}

const ActionButtons = ({
  selectedAnnotator,
  updateLoading,
  qaLoading,
  onApprove,
  onReject,
  onElevateToQA,
  onRemoveFromQA,
  layout = 'horizontal',
  size = 'middle'
}: ActionButtonsProps) => {
  const direction = layout === 'vertical' ? 'vertical' : 'horizontal';

  if (layout === 'vertical') {
    return (
      <div className="flex justify-end gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-white text-sm font-medium">Annotator Actions:</span>
          <div className="flex gap-2">
            <Button
              type="primary"
              size={size}
              icon={<CheckOutlined />}
              onClick={() => onApprove('annotator')}
              loading={updateLoading}
              disabled={selectedAnnotator.annotatorStatus === 'approved'}
              className="font-[gilroy-regular]"
            >
              Approve
            </Button>
            <Button
              danger
              size={size}
              icon={<CloseOutlined />}
              onClick={() => onReject('annotator')}
              loading={updateLoading}
              disabled={selectedAnnotator.annotatorStatus === 'rejected'}
              className="font-[gilroy-regular]"
            >
              Reject
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-white text-sm font-medium">QA Management:</span>
          <div className="flex gap-2">
            {selectedAnnotator.qaStatus !== 'approved' ? (
              <Button
                type="primary"
                size={size}
                icon={<UserAddOutlined />}
                onClick={onElevateToQA}
                loading={qaLoading}
                className="font-[gilroy-regular] bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c]"
              >
                Elevate to QA
              </Button>
            ) : (
              <Button
                danger
                size={size}
                icon={<UserDeleteOutlined />}
                onClick={onRemoveFromQA}
                loading={qaLoading}
                className="font-[gilroy-regular]"
              >
                Remove from QA
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Space direction={direction} size="middle">
      <Space>
        <Button
          type="primary"
          size={size}
          icon={<CheckOutlined />}
          onClick={() => onApprove('annotator')}
          loading={updateLoading}
          disabled={selectedAnnotator.annotatorStatus === 'approved'}
          className="font-[gilroy-regular]"
        >
          Approve Annotator
        </Button>
        <Button
          type="default"
          danger
          size={size}
          icon={<CloseOutlined />}
          onClick={() => onReject('annotator')}
          loading={updateLoading}
          disabled={selectedAnnotator.annotatorStatus === 'rejected'}
          className="font-[gilroy-regular]"
        >
          Reject Annotator
        </Button>
      </Space>

      <Space>
        {selectedAnnotator.qaStatus !== 'approved' ? (
          <Button
            type="primary"
            size={size}
            icon={<UserAddOutlined />}
            onClick={onElevateToQA}
            loading={qaLoading}
            className="font-[gilroy-regular] bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c]"
          >
            Elevate to QA
          </Button>
        ) : (
          <Button
            danger
            size={size}
            icon={<UserDeleteOutlined />}
            onClick={onRemoveFromQA}
            loading={qaLoading}
            className="font-[gilroy-regular]"
          >
            Remove from QA
          </Button>
        )}
      </Space>
    </Space>
  );
};

export default ActionButtons;