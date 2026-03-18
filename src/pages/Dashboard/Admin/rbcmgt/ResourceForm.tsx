import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Switch, Button, Space } from "antd";
import { ResourceModule } from "../../../../api/rbac/rbacSchema";
import { useResourceCreate, useResourceUpdate } from "../../../../api/rbac/resourceMutations";

const { TextArea } = Input;
const { Option } = Select;

interface ResourceFormProps {
  visible: boolean;
  onCancel: () => void;
  editingResource: ResourceModule | null;
  allResources: ResourceModule[];
}

const ResourceForm: React.FC<ResourceFormProps> = ({ 
  visible, 
  onCancel, 
  editingResource, 
  allResources 
}) => {
  const [form] = Form.useForm();
  const { mutate: createResource, isPending: isCreating } = useResourceCreate();
  const { mutate: updateResource, isPending: isUpdating } = useResourceUpdate();

  useEffect(() => {
    if (visible) {
      if (editingResource) {
        form.setFieldsValue({
          title: editingResource.title,
          link: editingResource.link,
          description: editingResource.description,
          icon: editingResource.icon,
          parent: typeof editingResource.parent === "object" ? editingResource.parent?._id : editingResource.parent,
          sortOrder: editingResource.sortOrder,
          isPublished: editingResource.isPublished,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isPublished: true });
      }
    }
  }, [visible, editingResource, form]);

  const onFinish = (values: any) => {
    if (editingResource?._id) {
      updateResource(
        { id: editingResource._id, rawPayload: values },
        {
          onSuccess: (res) => {
            if (res.success) onCancel();
          },
        }
      );
    } else {
      createResource(values, {
        onSuccess: (res) => {
          if (res.success) onCancel();
        },
      });
    }
  };

  return (
    <Modal
      title={editingResource ? "Edit Resource" : "Add Resource"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Form 
        form={form}
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{ isPublished: true }}
        className="mt-4"
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please input the resource title!" }]}
        >
          <Input placeholder="Resource Title (e.g. Dashboard)" />
        </Form.Item>

        <Form.Item
          name="link"
          label="Link"
          rules={[
            { required: true, message: "Please input the resource link!" },
            { 
              validator: (_, value) => {
                if (value && value.startsWith("javascript:")) {
                  return Promise.reject(new Error("Link cannot be javascript:"));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input placeholder="Path (e.g. /dashboard)" />
        </Form.Item>

        <Form.Item
          name="parent"
          label="Parent Resource"
        >
          <Select placeholder="Select parent module" allowClear showSearch optionFilterProp="children">
            {allResources
              .filter(r => r._id !== editingResource?._id)
              .map((res) => (
                <Option key={res._id} value={res._id}>
                  {res.title}
                </Option>
              ))}
          </Select>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="icon"
            label="Icon (Lucide/AntD name)"
          >
            <Input placeholder="Home, Settings, etc." />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="Sort Order"
          >
            <InputNumber style={{ width: "100%" }} placeholder="0" />
          </Form.Item>
        </div>

        <Form.Item
          name="description"
          label="Description"
        >
          <TextArea rows={3} placeholder="Brief description of this module" />
        </Form.Item>

        <Form.Item name="isPublished" label="Published Status" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end">
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isCreating || isUpdating}
              className="bg-[#1565C0]"
            >
              {editingResource ? "Update Resource" : "Create Resource"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ResourceForm;
