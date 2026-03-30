import { Spin } from "antd";

interface ProfileLoadingProps {
  message?: string;
}

const ProfileLoading = ({ message = "Loading..." }: ProfileLoadingProps) => {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-4 font-[gilroy-regular] flex-1">
      <div className="flex flex-col gap-3 justify-center items-center">
          <Spin size="large" />
          <span className="text-lg">{message}</span>
        </div>
    </div>
  );
};

export default ProfileLoading;