import { useNavigate } from "react-router-dom";
import { Form, Input, InputNumber, Select, DatePicker, Button, Typography, Space, Card, Divider } from "antd";
import { useInvoiceContext, Invoice } from "./invoiceContext";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const NewInvoice = () => {
  const navigate = useNavigate();
  const { addInvoice } = useInvoiceContext();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      const formattedValues = {
        ...values,
        due_date: values.due_date.format("YYYY-MM-DD"),
      };
      await addInvoice(formattedValues);
      navigate("/admin/invoice-page");
    } catch (err) {
      // Error handled in context/toast
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 font-[gilroy-regular] p-4 md:p-8">
      {/* Page Header */}
      <div>
        <Title level={2} className="m-0">Create New Invoice</Title>
        <Text type="secondary">Fill in the invoice details below</Text>
      </div>

      <Card className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ duration: "Monthly" }}
        >
          <Title level={4} className="mb-6">Partner Information</Title>

          <div className="grid md:grid-cols-2 gap-x-6">
            <Form.Item
              name="name"
              label="Partner Name"
              rules={[{ required: true, message: "Please enter partner name" }]}
            >
              <Input placeholder="e.g. John Doe / Company Name" size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter email address" },
                { type: "email", message: "Please enter a valid email" }
              ]}
            >
              <Input placeholder="partner@example.com" size="large" />
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount (EUR)"
              rules={[{ required: true, message: "Please enter amount" }]}
            >
              <InputNumber
                className="w-full"
                placeholder="500"
                size="large"
                min={0}
                formatter={(value) => `€ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => value!.replace(/€\s?|(,*)/g, "") as any}
              />
            </Form.Item>

            <Form.Item
              name="due_date"
              label="Due Date"
              rules={[{ required: true, message: "Please select due date" }]}
            >
              <DatePicker className="w-full" size="large" />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration"
              rules={[{ required: true, message: "Please select duration" }]}
            >
              <Select size="large">
                <Option value="One-time">One-time</Option>
                <Option value="Weekly">Weekly</Option>
                <Option value="Bi-weekly">Bi-weekly</Option>
                <Option value="Monthly">Monthly</Option>
                <Option value="Quarterly">Quarterly</Option>
                <Option value="Half-yearly">Half-yearly</Option>
                <Option value="Yearly">Yearly</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              placeholder="Additional notes or service details..."
              rows={4}
            />
          </Form.Item>

          <Divider />

          <div className="flex justify-end gap-4 mt-6">
            <Button size="large" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-primary border-primary"
            >
              Create Invoice
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewInvoice;
