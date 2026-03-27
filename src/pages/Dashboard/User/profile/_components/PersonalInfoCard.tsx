import React from "react";
import { Button, Card, Tag } from "antd";
import { Domain } from "../types.js";

interface PersonalInfoCardProps {
  profile: any;
  userInfo: any;
  isEditing: boolean;
  updateLoading: boolean;
  assignedDomains: any[];
  mergedDomains: Domain[];
  onEditClick: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  profile,
  userInfo,
  isEditing,
  updateLoading,
  onEditClick,
  onSave,
  onCancel,
}) => {
  return (
    <Card className="mb-6">
      <div className="lg:col-span-1">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-[6rem] w-[6rem] cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <span className="font-[gilroy-medium] font-bold text-2xl">
              {profile?.personalInfo?.fullName
                ?.split(" ")
                .map((name: string) => name.charAt(0))
                .join("") ||
                userInfo?.fullName
                  ?.split(" ")
                  .map((name: string) => name.charAt(0))
                  .join("") ||
                "U"}
            </span>
          </div>

          <div className="text-center">
            <h3 className="font-semibold text-lg">
              {profile?.personalInfo?.fullName ||
                userInfo?.fullName ||
                "User Name"}
            </h3>
            <p className="text-gray-600 text-sm capitalize">
              {profile?.annotatorStatus || "Annotator"}
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full max-w-xs">
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  className="!bg-[#E3E6EA] !text-[#666666] rounded-lg !font-[gilroy-regular] flex-1"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  className="!bg-[#096A95] !text-[#FFFFFF] rounded-lg !font-[gilroy-regular] flex-1"
                  onClick={onSave}
                  loading={updateLoading}
                >
                  Save
                </Button>
              </div>
            ) : (
              <Button
                className="!bg-blue-500 !text-[#FFFFFF] rounded-lg !font-[gilroy-regular] w-full"
                onClick={onEditClick}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoCard;