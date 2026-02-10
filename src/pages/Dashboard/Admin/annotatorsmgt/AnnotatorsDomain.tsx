import { useState } from 'react';
import { Space, Select, Button, Form } from 'antd';

const categoriesData = [
  {
    id: 1,
    name: "Computing & Software Engineering",
    sub: [
      {
        id: 11,
        name: "Software Development",
        subSub: [
          "Python",
          "JavaScript",
          "Java",
          "C / C++",
          "Go",
          "Rust",
          "PHP",
        ],
      },
      {
        id: 12,
        name: "Web Development",
        subSub: [
          "Frontend (HTML, CSS, React, Vue)",
          "Backend (Node.js, Django, Flask)",
          "APIs & Microservices",
        ],
      },
      {
        id: 13,
        name: "Mobile Development",
        subSub: [
          "Android",
          "iOS",
          "Cross-platform (Flutter, React Native)",
        ],
      },
      {
        id: 14,
        name: "Systems & OS",
        subSub: [
          "Operating Systems",
          "Compilers",
          "Embedded Systems",
        ],
      },
      {
        id: 15,
        name: "DevOps & Cloud",
        subSub: [
          "AWS / GCP / Azure",
          "Docker & Kubernetes",
          "CI/CD",
        ],
      },
      {
        id: 16,
        name: "Databases",
        subSub: [
          "SQL",
          "NoSQL",
          "Data Modeling",
        ],
      },
      {
        id: 17,
        name: "Cybersecurity",
        subSub: [
          "Network Security",
          "Application Security",
          "Cryptography",
        ],
      },
      {
        id: 18,
        name: "AI & ML",
        subSub: [
          "Machine Learning",
          "Deep Learning",
          "Reinforcement Learning",
          "MLOps",
        ],
      },
    ],
  },

  {
    id: 2,
    name: "Engineering & Applied Sciences",
    sub: [
      {
        id: 21,
        name: "Civil Engineering",
        subSub: [
          "Structural Engineering",
          "Geotechnical Engineering",
          "Transportation Engineering",
        ],
      },
      {
        id: 22,
        name: "Mechanical Engineering",
        subSub: [
          "Thermodynamics",
          "Fluid Mechanics",
          "CAD/CAM",
        ],
      },
      {
        id: 23,
        name: "Electrical Engineering",
        subSub: [
          "Power Systems",
          "Electronics",
          "Control Systems",
        ],
      },
      {
        id: 24,
        name: "Chemical Engineering",
        subSub: [
          "Process Design",
          "Materials Science",
        ],
      },
      {
        id: 25,
        name: "Robotics",
        subSub: [
          "Kinematics",
          "SLAM",
          "Sensor Fusion",
        ],
      },
      {
        id: 26,
        name: "Manufacturing",
        subSub: [
          "Quality Control",
          "Industrial Automation",
        ],
      },
    ],
  },

  {
    id: 3,
    name: "Mathematics & Formal Sciences",
    sub: [
      {
        id: 31,
        name: "Mathematics",
        subSub: [
          "Arithmetic",
          "Algebra",
          "Geometry",
          "Trigonometry",
          "Calculus",
          "Linear Algebra",
          "Probability",
          "Statistics",
        ],
      },
      {
        id: 32,
        name: "Logic & Formal Reasoning",
        subSub: [
          "Propositional Logic",
          "Predicate Logic",
        ],
      },
      {
        id: 33,
        name: "Other",
        subSub: [
          "Optimization",
          "Numerical Methods",
        ],
      },
    ],
  },

  {
    id: 4,
    name: "Natural Sciences",
    sub: [
      {
        id: 41,
        name: "Physics",
        subSub: [
          "Classical Mechanics",
          "Quantum Mechanics",
          "Electromagnetism",
        ],
      },
      {
        id: 42,
        name: "Chemistry",
        subSub: [
          "Organic Chemistry",
          "Inorganic Chemistry",
          "Analytical Chemistry",
        ],
      },
      {
        id: 43,
        name: "Biology",
        subSub: [
          "Molecular Biology",
          "Genetics",
          "Ecology",
        ],
      },
      {
        id: 44,
        name: "Environmental Science",
        subSub: [
          "Climate Science",
          "Sustainability",
        ],
      },
      {
        id: 45,
        name: "Astronomy & Space Science",
        subSub: [],
      },
    ],
  },
];


const AnnotatorsDomain = () => {
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
    <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 900, margin: 'auto', }}>
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

export default AnnotatorsDomain;
