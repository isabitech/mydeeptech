import React from "react";
import { Tabs } from "antd";
import { UserOutlined, SafetyOutlined } from "@ant-design/icons";
import RoleManagement from "./RoleManagement";
import RolePermissions from "./RolePermissions";

const { TabPane } = Tabs;

const ComprehensiveRoleManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs
        defaultActiveKey="users"
        size="large"
        tabBarStyle={{
          backgroundColor: 'white',
          margin: 0,
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <TabPane
          tab={
            <span>
              <UserOutlined className="mr-1" />
              User Role Management
            </span>
          }
          key="users"
        >
          <RoleManagement />
        </TabPane>
        <TabPane
          tab={
            <span>
              <SafetyOutlined className="mr-1" />
              Role Permissions
            </span>
          }
          key="permissions"
        >
          <RolePermissions />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ComprehensiveRoleManagement;