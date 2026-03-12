import { Form, Input, InputNumber, Select, DatePicker, Button, Typography, Divider, Modal, App } from "antd";
import { useEffect } from "react";
import partnerInvoiceMutationService from "../../../../services/partner-invoice-service/invoice-mutation";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface NewInvoiceProps {
  open: boolean;
  onClose: () => void;
}

const NewInvoice = ({ open, onClose }: NewInvoiceProps) => {
  const { message } = App.useApp();
  const { mutate: addInvoice, isPending: loading } = partnerInvoiceMutationService.useAddPartnerInvoice();
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    const formattedValues = {
      ...values,
      due_date: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : undefined,
    };

    addInvoice(formattedValues, {
      onSuccess: () => {
        message.success("Invoice created successfully");
        form.resetFields();
        onClose();
      },
      onError: (err: any) => {
        message.error(err.response?.data?.message || err.message || "Failed to create invoice");
      }
    });
  };

  return (
    <Modal
      title={
        <div>
          <Title level={4} className="m-0">Create New Invoice</Title>
          <Text type="secondary" className="text-sm font-normal">Fill in the invoice details below</Text>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnClose
      className="font-[gilroy-regular]"
    >
      <div className="mt-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ duration: "Monthly", currency: "USD" }}
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
              name="currency"
              label="Currency"
              rules={[{ required: true, message: "Please select currency" }]}
            >
              <Select size="large">
                <Option value="NGN">NGN (₦)</Option>
                <Option value="USD">USD ($)</Option>
                <Option value="EUR">EUR (€)</Option>
                <Option value="GBP">GBP (£)</Option>
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.currency !== currentValues.currency}>
              {({ getFieldValue }) => {
                const currency = getFieldValue("currency") || "USD";
                const currencySymbols: Record<string, string> = {
                  NGN: "₦",
                  USD: "$",
                  EUR: "€",
                  GBP: "£",
                };
                const symbol = currencySymbols[currency] || "";

                return (
                  <Form.Item
                    name="amount"
                    label={`Amount (${symbol})`}
                    rules={[{ required: true, message: "Please enter amount" }]}
                  >
                    <InputNumber
                      className="w-full"
                      placeholder="500"
                      size="large"
                      min={0}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => value!.replace(/,/g, "") as any}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>

            <Form.Item
              name="dueDate"
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
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Create Invoice
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default NewInvoice;
