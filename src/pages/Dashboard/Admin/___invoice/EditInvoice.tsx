import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Form, Input, InputNumber, Select, DatePicker, Button, Typography, Card, Divider } from "antd";
import { useInvoiceContext, Invoice } from "./invoiceContext";
import dayjs from "dayjs";
import { useEffect } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { invoices, updateInvoice } = useInvoiceContext();
  const [form] = Form.useForm();

  // Try to get invoice from state or context
  const initialInvoice = (location.state?.invoice as Invoice | undefined) ||
    invoices.find(inv => inv._id === id);

  useEffect(() => {
    if (initialInvoice) {
      form.setFieldsValue({
        ...initialInvoice,
        due_date: initialInvoice.due_date ? dayjs(initialInvoice.due_date) : null,
      });
    }
  }, [initialInvoice, form]);

  if (!initialInvoice) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Typography.Title level={4}>Invoice not found</Typography.Title>
      </div>
    );
  }

  const onFinish = async (values: any) => {
    if (!id) return;
    try {
      const formattedValues = {
        ...values,
        due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : undefined,
      };
      await updateInvoice(id, formattedValues);
      navigate(-1);
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 font-[gilroy-regular] p-4 md:p-8">
      <div>
        <Title level={2} className="m-0">Edit Invoice</Title>
        <Text type="secondary">
          Update the invoice details for <Text strong>{initialInvoice.name}</Text>
        </Text>
      </div>

      <Card className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Title level={4} className="mb-6">Partner Information</Title>

          <div className="grid md:grid-cols-2 gap-x-6">
            <Form.Item
              name="name"
              label="Partner Name"
              rules={[{ required: true, message: "Please enter partner name" }]}
            >
              <Input placeholder="Partner Name" size="large" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter email address" },
                { type: "email", message: "Please enter a valid email" }
              ]}
            >
              <Input placeholder="Partner Email" size="large" />
            </Form.Item>

            <Form.Item
              name="amount"
              label="Amount (EUR)"
              rules={[{ required: true, message: "Please enter amount" }]}
            >
              <InputNumber
                className="w-full"
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
                <Select.Option value="One-time">One-time</Select.Option>
                <Select.Option value="Weekly">Weekly</Select.Option>
                <Select.Option value="Bi-weekly">Bi-weekly</Select.Option>
                <Select.Option value="Monthly">Monthly</Select.Option>
                <Select.Option value="Quarterly">Quarterly</Select.Option>
                <Select.Option value="Half-yearly">Half-yearly</Select.Option>
                <Select.Option value="Yearly">Yearly</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea placeholder="Description" rows={4} />
          </Form.Item>

          <Divider />

          <div className="flex justify-end gap-x-4 mt-6">
            <Button size="large" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-primary border-primary"
            >
              Update Invoice
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EditInvoice;
