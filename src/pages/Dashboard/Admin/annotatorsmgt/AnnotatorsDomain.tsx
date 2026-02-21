import { useState } from "react";
import { Space, Input, Button, Form, message } from "antd";

const AnnotatorsDomain = () => {
  const [form] = Form.useForm();
  const onFinish = (values: any) => {
    console.log("Submitted:", values);
    message.success("Created successfully 🎉")
    form.resetFields();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 900, margin: "auto" }}
    >
      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true }]}
      >
        <Input
          placeholder="Enter category"
        />
      </Form.Item>

      <Form.Item
        name="subCategory"
        label="Sub Category"
      >
        <Input
          placeholder="Enter sub category (optional)"
        />
      </Form.Item>

      <Form.Item
        name="domain"
        label="Domain"
        rules={[{ required: true }]}
      >
        <Input
          placeholder="Enter domain"
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AnnotatorsDomain;
