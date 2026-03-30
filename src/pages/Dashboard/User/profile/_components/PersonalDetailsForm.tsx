import React from "react";
import { Form, Input, Select, Tag } from "antd";
import { africanCountries } from "../../../../../utils/africanCountries";
import DomainsSection from "./DomainsSection";
import { Domain } from "../types.js";

interface PersonalDetailsFormProps {
  profile: any;
  userInfo: any;
  isEditing: boolean;
  hasSelectedCountry: boolean;
  onCountryChange: (countryValue: string) => void;
  assignedDomains: any[];
  mergedDomains: Domain[];
  selectedDomains: string[];
  onDomainsChange: (values: string[]) => void;
}

const PersonalDetailsForm: React.FC<PersonalDetailsFormProps> = ({
  profile,
  userInfo,
  isEditing,
  hasSelectedCountry,
  onCountryChange,
  assignedDomains,
  mergedDomains,
  selectedDomains,
  onDomainsChange,
}) => {
  return (
    <>
      <Form.Item label="Email">
        <Input
          disabled
          value={profile?.email || userInfo?.email || ""}
          className="!font-[gilroy-regular]"
        />
      </Form.Item>

      <Form.Item label="Annotator Statuses:">
        <div className="flex gap-2">
          <Tag color={profile?.isEmailVerified ? "green" : "red"}>
            Email: {profile?.isEmailVerified ? "Verified" : "Not Verified"}
          </Tag>
          <Tag
            color={
              profile?.annotatorStatus === "verified"
                ? "green"
                : "orange"
            }
          >
            Annotator Status: {profile?.annotatorStatus === "verified" ? "Verified" : "Pending"}
          </Tag>
          <Tag
            color={
              profile?.microTaskerStatus === "approved"
                ? "green"
                : "red"
            }
          >
            Micro Tasker: {profile?.microTaskerStatus === "approved" ? "Approved" : "Pending"}
          </Tag>
        </div>
      </Form.Item>

      <DomainsSection
        isEditing={isEditing}
        assignedDomains={assignedDomains}
        mergedDomains={mergedDomains}
        selectedDomains={selectedDomains}
        onDomainsChange={onDomainsChange}
      />

      <div className="grid lg:grid-cols-2 gap-x-5">
        <Form.Item label="Full Name" name="fullName">
          <Input
            disabled={true}
            className="!font-[gilroy-regular]"
            placeholder="System managed"
          />
        </Form.Item>

        <Form.Item label="Phone Number" name="phoneNumber">
          <Input
            disabled={true}
            className="!font-[gilroy-regular]"
            placeholder="System managed"
          />
        </Form.Item>

        <Form.Item label="Country" name="country">
          <Select
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Select your country"
            showSearch
            onChange={onCountryChange}
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={africanCountries}
          />
        </Form.Item>

        <Form.Item label="Time Zone" name="timeZone">
          <Input
            disabled={!isEditing || hasSelectedCountry}
            className="!font-[gilroy-regular]"
            placeholder={
              hasSelectedCountry
                ? "Auto-set based on country"
                : "Enter your time zone"
            }
          />
        </Form.Item>

        <Form.Item
          label="Available Hours per Week"
          name="availableHoursPerWeek"
        >
          <Input
            type="number"
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Enter available hours"
          />
        </Form.Item>

        <Form.Item
          label="Preferred Communication"
          name="preferredCommunicationChannel"
        >
          <Select
            disabled={!isEditing}
            placeholder="Select communication channel"
            options={[
              { value: "email", label: "Email" },
              { value: "slack", label: "Slack" },
              { value: "discord", label: "Discord" },
              { value: "teams", label: "Teams" },
            ]}
          />
        </Form.Item>
      </div>
    </>
  );
};

export default PersonalDetailsForm;