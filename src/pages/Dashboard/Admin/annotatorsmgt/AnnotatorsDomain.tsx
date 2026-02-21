import { useState } from "react";
import { Form, Input, Button, Space, message } from "antd";

interface AnnotatorsDomainFormValues {
  category: string;
  subCategory?: string;
  domain: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string | null;
}

interface CategoryData {
  _id: string;
  name: string;
  slug: string;
}

interface SubCategoryData {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface DomainData {
  _id: string;
  name: string;
  parentId: string;
}

const BASE_URL = "https://mydeeptech-be-lmrk.onrender.com/api/domain";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OThjYzU3NmQzZmUxMzEzNGY2MDI0MDEiLCJlbWFpbCI6InNoaW5hX2JlZGV2QG15ZGVlcHRlY2gubmciLCJpc0FkbWluIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzE2MDQwOTgsImV4cCI6MTc3MjIwODg5OH0.G5Q3XVQyMYrTuFLQ96tMIqIFzcVTm3B9utM4R3La38c"
const AnnotatorsDomain = () => {
  const [form] = Form.useForm<AnnotatorsDomainFormValues>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: AnnotatorsDomainFormValues) => {
    setLoading(true);

    try {
      const categoryRes = await fetch(`${BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ name: values.category }),
      });
      const categoryText = await categoryRes.text();
      console.log("Category raw response:", categoryText);
      const categoryData: ApiResponse<CategoryData> = JSON.parse(categoryText);

      if (!categoryData.success) throw new Error(categoryData.message || "Failed to create category");

      let parentId = categoryData.data._id;

      if (values.subCategory) {
        const subRes = await fetch(`${BASE_URL}/subcategories`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({
            name: values.subCategory,
            category: parentId,
          }),
        });

        const subText = await subRes.text();
        console.log("Subcategory raw response:", subText);
        const subData: ApiResponse<SubCategoryData> = JSON.parse(subText);

        if (!subData.success) throw new Error(subData.message || "Failed to create subcategory");

        parentId = subData.data._id;
      }

      const parentModel = values.subCategory ? "SubCategory" : "Category";
      const domainRes = await fetch(`${BASE_URL}/domains`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          name: values.domain,
           parent: parentId,       
           parentModel,
        }),
      });

      const domainText = await domainRes.text();
      console.log("Domain raw response:", domainText);
      const domainData: ApiResponse<DomainData> = JSON.parse(domainText);

      if (!domainData.success) throw new Error(domainData.message || "Failed to create domain");

      message.success("Created successfully 🎉");
      form.resetFields();
    } catch (error: any) {
      console.error(error);
      message.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
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
        rules={[{ required: true, message: "Category is required" }]}
      >
        <Input placeholder="Enter category" />
      </Form.Item>

      <Form.Item
        name="subCategory"
        label="Sub Category"
      >
        <Input placeholder="Enter sub category (optional)" />
      </Form.Item>

      <Form.Item
        name="domain"
        label="Domain"
        rules={[{ required: true, message: "Domain is required" }]}
      >
        <Input placeholder="Enter domain" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AnnotatorsDomain;