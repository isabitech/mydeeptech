import { Form, Input, InputNumber, Select, DatePicker, Button, Typography, Divider, Modal, App } from "antd";
import { Invoice } from "../../../../store/useInvoiceStore";
import dayjs from "dayjs";
import { useEffect } from "react";
import partnerInvoiceMutationService from "../../../../services/partner-invoice-service/invoice-mutation";
import partnerInvoiceQueryService from "../../../../services/partner-invoice-service/invoice-query";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface EditInvoiceProps {
  open: boolean;
  invoiceId: string | null;
  onClose: () => void;
}

const EditInvoice = ({ open, invoiceId, onClose }: EditInvoiceProps) => {
  const { message } = App.useApp();
  const { mutate: updateInvoice, isPending: loading } = partnerInvoiceMutationService.useUpdatePartnerInvoice();
  const { data: invoices = [] } = partnerInvoiceQueryService.useFetchPartnerInvoices();
  const [form] = Form.useForm();

  const initialInvoice = invoices.find(inv => inv._id === invoiceId);

  useEffect(() => {
    if (initialInvoice) {
      form.setFieldsValue({
        ...initialInvoice,
        currency: initialInvoice?.currency || "USD",
        due_date: initialInvoice?.due_date ? dayjs(initialInvoice.due_date) : null,
      });
    }
  }, [initialInvoice, form]);

  if (!initialInvoice) {
    return null;
  }

  const onFinish = (values: any) => {
    if (!invoiceId) return;
    const formattedValues = {
      ...values,
      due_date: values.due_date ? values.due_date.format("YYYY-MM-DD") : undefined,
    };

    updateInvoice(
      { id: invoiceId, updatedInvoice: formattedValues },
      {
        onSuccess: () => {
          message.success("Invoice updated successfully");
          onClose();
        },
        onError: (err: any) => {
          message.error(err.response?.data?.message || err.message || "Failed to update invoice");
        }
      }
    );
  };

  return (
    <Modal
      title={
        <div>
          <Title level={4} className="m-0">Edit Invoice</Title>
          <Text type="secondary" className="text-sm font-normal">
            Update the invoice details for <Text strong>{initialInvoice.name}</Text>
          </Text>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      destroyOnHidden
      className="font-[gilroy-regular]"
    >
      <div className="mt-6">
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
                const currency = getFieldValue("currency") || "NGN";
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
                    label={`Amount (${currency})`}
                    rules={[{ required: true, message: "Please enter amount" }]}
                  >
                    <InputNumber
                      className="w-full"
                      size="large"
                      min={0}
                      formatter={(value) => `${symbol} ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => value!.replace(new RegExp(`\\${symbol}\\s?|(,*)`, "g"), "") as any}
                    />
                  </Form.Item>
                );
              }}
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
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Update Invoice
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default EditInvoice;
