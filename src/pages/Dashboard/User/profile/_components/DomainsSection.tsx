import React from "react";
import { Form, Select, Tag } from "antd";
import { Domain } from "../types.js";
import { Profile } from "../../../../../validators/profile/profile-schema.js";

// Define the assigned domain structure
interface AssignedDomain {
  domain: Domain;
  id: string | null;
  domainId: string;
}

interface DomainsSectionProps {
  profile: Profile | null | undefined;
  isEditing: boolean;
  assignedDomains: AssignedDomain[];
  mergedDomains: Domain[];
  selectedDomains: string[];
  onDomainsChange: (values: string[]) => void;
}

const DomainsSection: React.FC<DomainsSectionProps> = ({
  profile,
  isEditing,
  mergedDomains,
  selectedDomains,
  onDomainsChange,
}) => {

  const userDomains = profile?.userDomains || [];

  return (
    <Form.Item label="Domains:">
      {!isEditing ? (
        <div className="flex flex-wrap">
          {userDomains.map((domain) => {
            return (
              <Tag key={domain._id} closable={false} color="blue">
                {domain.name}
              </Tag>
            );
          })}
        </div>
      ) : (
        <Select
          mode="multiple"
          showSearch
          placeholder="Search and select at least 1 domain (max 5)"
          value={selectedDomains}
          onChange={onDomainsChange}
          maxCount={5}
          options={mergedDomains.map((domain) => ({
            label: domain.name,
            value: domain._id,
          }))}
          filterOption={(input, option) =>
            (option?.label as string)
              ?.toLowerCase()
              .includes(input.toLowerCase())
          }
          style={{ width: "100%" }}
        />
      )}
    </Form.Item>
  );
};

export default DomainsSection;