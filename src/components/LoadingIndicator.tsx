import { Spin } from "antd";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator = ({ message = "Loading..." }: LoadingIndicatorProps) => {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-4 font-[gilroy-regular] flex-1">
      <div className="flex flex-col gap-3 justify-center items-center">
          <Spin size="large" />
          <span className="text-lg">{message}</span>
        </div>
    </div>
  );
};

export default LoadingIndicator;