import React from "react";
import {
  Modal,
  Tabs,
  Form,
} from "antd";
import { useDomainActions, useDomainStates } from "../../store/useDomainStore";
import CreateDomainCategoryForm from "./CreateDomainCategoryForm";
import CreateSubDomainCategoryForm from "./CreateSubDomainCategoryForm";
import CreateDomainForm from "./CreateDomainForm";
const { TabPane } = Tabs;

const DomainModal: React.FC = () => {
  const [categoryForm] = Form.useForm();
  const [subDomainForm] = Form.useForm();
  const [domainForm] = Form.useForm();

  const { openDomainModal, activeTab } = useDomainStates();
  const { onCancel, setActiveTab } = useDomainActions();

  const handleCancel = () => {
    categoryForm.resetFields();
    subDomainForm.resetFields();
    domainForm.resetFields();
    setActiveTab("1");
    onCancel();
  };

  return (
    <Modal
      title="Domain Management"
      open={openDomainModal}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
      >
        <TabPane tab="Create Domain Category" key="1">
          <CreateDomainCategoryForm />
        </TabPane>

        <TabPane tab="Create Sub Domain" key="2">
          <CreateSubDomainCategoryForm /> 
        </TabPane>

        <TabPane tab="Create Domain" key="3">
          <CreateDomainForm />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default DomainModal;