import { useState } from 'react';
import { Space, Select, Button, Form } from 'antd';

const categoriesData = [
  {
    id: 1,
    name: "Computer Science",
    sub: [
      { id: 11, name: "Data Structures", subSub: ["Arrays", "Linked Lists", "Stacks", "Queues"] },
      { id: 12, name: "Algorithms", subSub: ["Sorting", "Searching", "Recursion", "Greedy"] },
      { id: 13, name: "Databases", subSub: ["SQL", "Indexes", "Joins", "Normalization"] },
      { id: 14, name: "Operating Systems", subSub: ["Processes", "Threads", "Memory", "Scheduling"] },
    ],
  },
  {
    id: 2,
    name: "Mathematics",
    sub: [
      { id: 21, name: "Algebra", subSub: ["Linear Equations", "Quadratic Equations", "Matrices"] },
      { id: 22, name: "Calculus", subSub: ["Limits", "Derivatives", "Integrals"] },
      { id: 23, name: "Statistics", subSub: ["Mean", "Median", "Probability"] },
      { id: 24, name: "Geometry", subSub: ["Triangles", "Circles", "Polygons"] },
    ],
  },
];

const AssesmentDomain = () => {
  const [form] = Form.useForm();
  const [subOptions, setSubOptions] = useState<any[]>([]);
  const [subSubOptions, setSubSubOptions] = useState<string[]>([]);
  const [formDisabled, setFormDisabled] = useState(false);


  // When category changes
  const handleCategoryChange = (value: number) => {
    const domain = categoriesData.find(c => c.id === Number(value));
    setSubOptions(domain?.sub || []);
    setSubSubOptions([]);
    form.setFieldsValue({ subCategory: undefined, subSubCategory: undefined });
  };

  // When subcategory changes
  const handleSubChange = (value: number) => {
    const sub = subOptions.find(s => s.id === Number(value));
    setSubSubOptions(sub?.subSub || []);
    form.setFieldsValue({ subSubCategory: undefined });
  };

  const onFinish = (values: any) => {
    console.log("Form submitted:", values);
    setFormDisabled(true)
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 700, margin: 'auto' }}>
      <Form.Item
        name="category"
        label="Category"
        rules={[{ required: true, message: "Please select a category" }]}
      >
        <Select
          placeholder="Select category"
          options={categoriesData.map(c => ({ value: c.id, label: c.name }))}
          onChange={handleCategoryChange}
           disabled={formDisabled}
        />
      </Form.Item>

      <Form.Item
        name="subCategory"
        label="Sub Category"
        rules={[{ required: true, message: "Please select a sub category" }]}
      >
        <Select
          placeholder="Select sub category"
          options={subOptions.map(s => ({ value: s.id, label: s.name }))}
          onChange={handleSubChange}
          disabled={!subOptions.length || formDisabled}
        />
      </Form.Item>

      <Form.Item
        name="subSubCategory"
        label="Example"
        rules={[{ required: true, message: "Please select an example" }]}
      >
        <Select
          placeholder="Select example"
          options={subSubOptions.map(s => ({ value: s, label: s }))}
          disabled={!subSubOptions.length || formDisabled}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button onClick={() =>{form.resetFields(); setFormDisabled(false);} }>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AssesmentDomain;
