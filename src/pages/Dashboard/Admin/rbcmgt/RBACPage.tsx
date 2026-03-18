import React, { useState } from "react";
import { Typography, Button, Tabs } from "antd";
import { PlusOutlined, SafetyOutlined, TeamOutlined, ControlOutlined, AppstoreOutlined } from "@ant-design/icons";
import RolesList from "./RolesList";
import UserRoleAssignment from "./UserRoleAssignment";
import RolePermissionMatrix from "./RolePermissionMatrix";
import PermissionsManagement from "./PermissionsManagement";
import ResourcesList from "./ResourcesList";

const { Text } = Typography;


const RBACPage: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = useState("overview");

  /**
   * Handles tab change events.
   * @param key - The new active tab key.
   */
  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[gilroy-regular]">
      <div className="bg-white rounded-lg shadow-sm w-full">
        <div className="p-6">
          <div className="flex justify-between flex-wrap gap-3 items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
              <Text type="secondary">Manage your team's access levels, specific resource permissions, and system modules.</Text>
            </div>

          </div>

          <Tabs
            activeKey={activeTabKey}
            onChange={handleTabChange}
            className="w-full"
            tabBarStyle={{ borderBottom: "1px solid #e5e7eb" }}
            items={[
              {
                key: "overview",
                label: (
                  <div className="flex items-center gap-2">
                    <SafetyOutlined />
                    <span>Available Roles</span>
                  </div>
                ),
                children: (
                  <div className="pt-4">
                    <RolesList />
                  </div>
                )
              },
              {
                key: "assignments",
                label: (
                  <div className="flex items-center gap-2">
                    <TeamOutlined />
                    <span>User Role Assignment</span>
                  </div>
                ),
                children: (
                  <div className="pt-4">
                    <UserRoleAssignment />
                  </div>
                )
              },
              {
                key: "matrix",
                label: (
                  <div className="flex items-center gap-2">
                    <ControlOutlined />
                    <span>Role Permissions Matrix</span>
                  </div>
                ),
                children: (
                  <div className="pt-4">
                    <RolePermissionMatrix />
                  </div>
                )
              },
              {
                key: "glossary",
                label: (
                  <div className="flex items-center gap-2">
                    <ControlOutlined />
                    <span>Permission Glossary</span>
                  </div>
                ),
                children: (
                  <div className="pt-4">
                    <PermissionsManagement />
                  </div>
                )
              },
              {
                key: "resources",
                label: (
                  <div className="flex items-center gap-2">
                    <AppstoreOutlined />
                    <span>Resources Management</span>
                  </div>
                ),
                children: (
                  <div className="pt-4">
                    <ResourcesList />
                  </div>
                )
              }
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default RBACPage;
