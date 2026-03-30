import React from "react";
import { Card, Tag } from "antd";

interface SystemInfoCardProps {
  profile: any;
}



const SystemInfoCard: React.FC<SystemInfoCardProps> = ({ profile }) => {
  return (
    <Card
      title="System Information"
      className="w-full mt-4"
      size="default"
    >
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Device:</span>
          <span className="capitalize">
            {profile?.systemInfo?.deviceType || "Unknown"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">OS:</span>
          <span className="capitalize">
            {profile?.systemInfo?.operatingSystem || "Unknown"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Internet:</span>
          <span className="capitalize">
            {profile?.systemInfo?.internetSpeedMbps
              ? `${profile.systemInfo.internetSpeedMbps} Mbps`
              : "Unknown"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Webcam:</span>
          <Tag
            color={profile?.systemInfo?.hasWebcam ? "green" : "red"}
          >
            {profile?.systemInfo?.hasWebcam
              ? "Available"
              : "Not Available"}
          </Tag>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Microphone:</span>
          <Tag
            color={
              profile?.systemInfo?.hasMicrophone ? "green" : "red"
            }
          >
            {profile?.systemInfo?.hasMicrophone
              ? "Available"
              : "Not Available"}
          </Tag>
        </div>
      </div>
    </Card>
  );
};

export default SystemInfoCard;