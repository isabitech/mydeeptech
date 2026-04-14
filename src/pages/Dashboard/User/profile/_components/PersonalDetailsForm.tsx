import React, { useEffect } from "react";
import { Form, Input, Select, Tag } from "antd";
import PhoneInput, { parsePhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './PhoneInput.css';
import { worldCountries } from "../../../../../utils/worldCountries";
import DomainsSection from "./DomainsSection";
import { Domain } from "../types.js";

// Define the E164Number type locally since it's not exported
type E164Number = string;

interface PersonalDetailsFormProps {
  profile: any;
  userInfo: any;
  isEditing: boolean;
  hasSelectedCountry: boolean;
  onCountryChange: (countryValue: string) => void;
  onPhoneChange?: (phone: string, country?: string) => void;
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
  onPhoneChange,
  assignedDomains,
  mergedDomains,
  selectedDomains,
  onDomainsChange,
}) => {
  const form = Form.useFormInstance();
  const phoneNumber = Form.useWatch('phoneNumber', form);

  // Extract country from phone number when it changes
  useEffect(() => {
    if (phoneNumber && onPhoneChange) {
      const parsedPhone = parsePhoneNumber(phoneNumber);
      if (parsedPhone && parsedPhone.country) {
        const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
        const countryName = regionNames.of(parsedPhone.country);
        onPhoneChange(phoneNumber, countryName || "");
      } else {
        onPhoneChange(phoneNumber);
      }
    }
  }, [phoneNumber, onPhoneChange]);

  // Custom PhoneInput wrapper that works with Ant Design Forms
  const FormPhoneInput: React.FC<{ 
    value?: E164Number; 
    onChange?: (value: E164Number | undefined) => void; 
    disabled?: boolean 
  }> = ({ value, onChange, disabled }) => (
    <PhoneInput
      international
      defaultCountry="NG"
      countryCallingCodeEditable={false}
      disabled={disabled}
      value={value}
      onChange={(phoneValue: E164Number | undefined) => {
        if (onChange) {
          onChange(phoneValue);
        }
      }}
      placeholder="Enter phone number"
      className="phone-input-container h-8"
      numberInputProps={{
        className: "ant-input"
      }}
    />
  );
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

        <Form.Item 
          label="Phone Number" 
          name="phoneNumber"
        >
          <FormPhoneInput disabled={!isEditing} />
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
            options={worldCountries}
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