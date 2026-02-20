import { useState, useEffect } from "react";
import { Space, Select, Button, Form, message } from "antd";

const BASE_URL = "https://mydeeptech-be-lmrk.onrender.com/api/domain";
  
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OThjYzU3NmQzZmUxMzEzNGY2MDI0MDEiLCJlbWFpbCI6InNoaW5hX2JlZGV2QG15ZGVlcHRlY2gubmciLCJpc0FkbWluIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzE2MDQwOTgsImV4cCI6MTc3MjIwODg5OH0.G5Q3XVQyMYrTuFLQ96tMIqIFzcVTm3B9utM4R3La38c"

const AnnotatorsDomain = () => {
  const [form] = Form.useForm();

  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formDisabled, setFormDisabled] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/categories/tree`, {
  headers: {
    Authorization: `Bearer ${TOKEN}`,
  },
});
        const result = await res.json();

        if (result.success) {
          setCategories(result.data);
        } else {
          message.error("Failed to load categories");
        }
      } catch (err) {
        message.error("Error loading categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryChange = async (value: string) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/subcategories/by-category/${value}`,

          {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }
      );
      const result = await res.json();

      if (result.success) {
        setSubCategories(result.data);
        setDomains([]);
        form.setFieldsValue({
          subCategory: undefined,
          domain: undefined,
        });
      }
    } catch {
      message.error("Error loading subcategories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategoryChange = async (value: string) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/domains/by-parent?parentId=${value}&parentModel=Category|SubCategory`,
         {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  }
      );
      const result = await res.json();

      if (result.success) {
        setDomains(result.data);
        form.setFieldsValue({ domain: undefined });
      }
    } catch {
      message.error("Error loading domains");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values: any) => {
    console.log("Submitted:", values);
    setFormDisabled(true);
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
        <Select
          placeholder="Select category"
          loading={loading}
          options={categories.map((c) => ({
            value: c._id,
            label: c.name,
          }))}
          onChange={handleCategoryChange}
          disabled={formDisabled}
        />
      </Form.Item>

      <Form.Item
        name="subCategory"
        label="Sub Category"
        rules={[{ required: true }]}
      >
        <Select
          placeholder="Select sub category"
          loading={loading}
          options={subCategories.map((s) => ({
            value: s._id,
            label: s.name,
          }))}
          onChange={handleSubCategoryChange}
          disabled={!subCategories.length || formDisabled}
        />
      </Form.Item>

      <Form.Item
        name="domain"
        label="Domain"
        rules={[{ required: true }]}
      >
        <Select
          placeholder="Select domain"
          loading={loading}
          options={domains.map((d) => ({
            value: d._id,
            label: d.name,
          }))}
          disabled={!domains.length || formDisabled}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
              setFormDisabled(false);
              setSubCategories([]);
              setDomains([]);
            }}
          >
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AnnotatorsDomain;
