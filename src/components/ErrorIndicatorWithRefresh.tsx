import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button } from "antd";
import errorMessage from "../lib/error-message";

interface ErrorIndicatorWithRefreshProps {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
}

const ErrorIndicatorWithRefresh = ({ title = "Error",  error, onRetry}: ErrorIndicatorWithRefreshProps) => {
  const errorMsg = error ? errorMessage(error) : "Failed to load. Please try again.";
  return (
     <div className="h-full flex flex-col gap-4 font-[gilroy-regular] w-full">
       <Alert
          className="w-full"
            message={title}
            description={errorMsg}
            type="error"
            showIcon
            action={
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={onRetry ?? (() => {})}
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

export default ErrorIndicatorWithRefresh;