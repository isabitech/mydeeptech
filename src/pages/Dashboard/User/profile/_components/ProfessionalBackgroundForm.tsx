import React from "react";
import { Form, Input, Select } from "antd";

interface ProfessionalBackgroundFormProps {
  isEditing: boolean;
}

const ProfessionalBackgroundForm: React.FC<ProfessionalBackgroundFormProps> = ({
  isEditing,
}) => {
  return (
    <>
      <div>
        <Form.Item label="Education Field" name="educationField">
          <Input
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Enter your education field"
          />
        </Form.Item>
        <Form.Item label="Years of Experience" name="yearsOfExperience">
          <Input
            type="number"
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Enter years of experience"
          />
        </Form.Item>
        <Form.Item label="Primary Language" name="primaryLanguage">
          <Select
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Select your primary language"
            options={[
              { value: "english", label: "English" },
              { value: "french", label: "French" },
              { value: "spanish", label: "Spanish" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="English Fluency Level"
          name="englishFluencyLevel"
        >
          <Select
            disabled={!isEditing}
            placeholder="Select English fluency level"
            options={[
              { value: "native", label: "Native" },
              { value: "fluent", label: "Fluent" },
              { value: "advanced", label: "Advanced" },
              { value: "intermediate", label: "Intermediate" },
              { value: "basic", label: "Basic" },
            ]}
          />
        </Form.Item>
      </div>
    </>
  );
};

export default ProfessionalBackgroundForm;