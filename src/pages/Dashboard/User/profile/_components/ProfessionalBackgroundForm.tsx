import React from "react";
import { Form, Input, Select } from "antd";
import languagesData from "../../../../../data/languages.json";
import "../../../../../components/LanguageSelect/LanguageSelect.css";

interface ProfessionalBackgroundFormProps {
  isEditing: boolean;
}

const ProfessionalBackgroundForm: React.FC<ProfessionalBackgroundFormProps> = ({
  isEditing,
}) => {
  // Create language options from our comprehensive language data
  const languageOptions = languagesData.languages.map(lang => ({
    value: lang.code,
    label: `${lang.name} (${lang.native})`,
    searchValue: `${lang.name} ${lang.native} ${lang.region}`
  }));

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      </div>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        <Form.Item label="Native Languages" name="nativeLanguages">
          <Select
            mode="multiple"
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Select your native languages"
            showSearch
            filterOption={(input, option) =>
              (option?.searchValue ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={languageOptions}
            maxTagCount="responsive"
          />
        </Form.Item>
        
        <Form.Item label="Other Languages" name="otherLanguages">
          <Select
            mode="multiple"
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Select other languages you can speak"
            showSearch
            filterOption={(input, option) =>
              (option?.searchValue ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={languageOptions}
            maxTagCount="responsive"
          />
        </Form.Item>
        
        <Form.Item
          label="English Fluency Level"
          name="englishFluencyLevel"
        >
          <Select
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
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
        
        <Form.Item label="Primary Language (Legacy)" name="primaryLanguage">
          <Select
            disabled={!isEditing}
            className="!font-[gilroy-regular]"
            placeholder="Select your primary language"
            showSearch
            filterOption={(input, option) =>
              (option?.searchValue ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={languageOptions}
          />
        </Form.Item>
      </div>
    </>
  );
};

export default ProfessionalBackgroundForm;