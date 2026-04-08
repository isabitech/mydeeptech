import { Spin } from "antd";

interface LoadingIndicatorProps {
  title?: string;
  subTitle?: string;
}

const LoadingIndicator = ({ title = "Loading data...", subTitle = "" }: LoadingIndicatorProps) => {
  return (
    <div className="h-full flex flex-col items-center gap-2 font-[gilroy-regular] flex-1 p-3">
        <Spin size="large" />
        { title ? <span className="text-base text-gray-500">{title}</span> : null }
        { subTitle ? <span className="text-sm text-gray-400 lg:w-[50%]">{subTitle}</span> : null }
    </div>
  );
};

export default LoadingIndicator;