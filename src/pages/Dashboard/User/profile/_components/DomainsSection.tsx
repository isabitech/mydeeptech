import React from "react";
import { Form, Select, Tag } from "antd";
import { Domain } from "../types.js";

// Define the assigned domain structure
interface AssignedDomain {
  domain: Domain;
  id: string | null;
  domainId: string;
}

interface DomainsSectionProps {
  isEditing: boolean;
  assignedDomains: AssignedDomain[];
  mergedDomains: Domain[];
  selectedDomains: string[];
  onDomainsChange: (values: string[]) => void;
}

const DomainsSection: React.FC<DomainsSectionProps> = ({
  isEditing,
  assignedDomains,
  mergedDomains,
  selectedDomains,
  onDomainsChange,
}) => {
  // console.log("Assigned Domains in DomainsSection:", assignedDomains);
  // console.log("Merged Domains in DomainsSection:", mergedDomains);
  return (
    <Form.Item label="Domains">
      {!isEditing ? (
        <div className="flex flex-wrap gap-2">
          {assignedDomains?.map((domainParam) => {
            const dId = domainParam.domainId;
            const domainObj = domainParam.domain || {};
            // Defensive name lookup: check domain object's name, then look up in mergedDomains, finally fallback to ID
            const domainName = domainObj?.name || mergedDomains.find((m) => m._id === dId)?.name || dId;
            return (
              <Tag key={dId} closable={false} color="blue">
                {domainName}
              </Tag>
            );
          })}
        </div>
      ) : (
        <Select
          mode="multiple"
          showSearch
          placeholder="Search and select domains"
          value={selectedDomains}
          onChange={onDomainsChange}
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