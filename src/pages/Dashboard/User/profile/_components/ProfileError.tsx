import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";

interface ProfileErrorProps {
  errorMessage?: string;
  onRetry: () => void;
}

const ProfileError = ({
  errorMessage = "Failed to load profile. Please try again.",
  onRetry
}: ProfileErrorProps) => {
  return (
     <div className="h-full flex flex-col gap-4 font-[gilroy-regular] w-full">
       <Alert
          className="w-full"
            message="Profile Error"
            description={errorMessage}
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={onRetry}
                type="primary"
                className="bg-blue-500"
              >
                Retry
              </Button>
            }
          />
      </div>
  );
};

export default ProfileError;