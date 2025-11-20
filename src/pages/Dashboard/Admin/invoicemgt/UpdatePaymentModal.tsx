import React from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Tag,
  Descriptions,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useAdminInvoices } from "../../../../hooks/Auth/Admin/Invoices/useAdminInvoices";
import {  PaymentStatus, DTUserInfo, ProjectInfo } from "../../../../types/invoice.types";
import { AdminInvoice } from "../../../../types/admin-invoice-type";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface UpdatePaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: AdminInvoice | null;
}

const UpdatePaymentModal: React.FC<UpdatePaymentModalProps> = ({
  open,
  onClose,
  onSuccess,
  invoice,
}) => {
  const [form] = Form.useForm();
  const { updatePaymentStatus, loading } = useAdminInvoices();

  const handleSubmit = async (values: any) => {
    if (!invoice?._id) return;

    try {
      const updateData = {
        paymentStatus: values.paymentStatus,
        paymentDate: values.paymentDate?.toISOString(),
        paymentMethod: values.paymentMethod,
        transactionReference: values.transactionReference,
        paymentNotes: values.paymentNotes,
      };

      const result = await updatePaymentStatus(invoice._id, updateData);
      if (result.success) {
        form.resetFields();
        onSuccess();
        message.success("Payment status updated successfully");
      } else {
        message.error(result.error || "Failed to update payment status");
      }
    } catch (error) {
      message.error("Failed to update payment status");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const getStatusColor = (status: PaymentStatus) => {
    const statusMap = {
      paid: "green",
      unpaid: "orange",
      overdue: "red",
      cancelled: "default",
      disputed: "red",
    } as const;
    return statusMap[status] || "default";
  };

  const isPaymentCompleted = (status: PaymentStatus) => {
    return status === "paid" || status === "cancelled";
  };

  const getDTUserName = (dtUserId: string | DTUserInfo): string => {
    if (typeof dtUserId === "string") return "User ID: " + dtUserId;
    return dtUserId.fullName;
  };

  const getProjectName = (projectId: string | ProjectInfo | null | undefined): string => {
    if (!projectId) return "No Project";
    if (typeof projectId === "string") return "Project ID: " + projectId;
    return projectId.projectName || "Unknown Project";
  };

  return (
    <Modal
      title="Update Payment Status"
      open={open}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          Update Payment
        </Button>,
      ]}
    >
      {invoice && (
        <>
          <Descriptions title="Invoice Details" bordered size="small" style={{ marginBottom: 20 }}>
            <Descriptions.Item label="Invoice Number" span={2}>
              {invoice.invoiceNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <Text strong>
                {invoice.currency} {invoice.invoiceAmount.toFixed(2)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="DTUser" span={2}>
              {getDTUserName(invoice.dtUserId)}
            </Descriptions.Item>
            <Descriptions.Item label="Current Status">
              <Tag color={getStatusColor(invoice.paymentStatus as PaymentStatus)}>
                {invoice.paymentStatus?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Due Date" span={2}>
              {dayjs(invoice.dueDate).format("MMM DD, YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Project">
              {getProjectName(invoice.projectId)}
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              paymentStatus: invoice.paymentStatus,
              paymentDate: invoice.paidAt ? dayjs(invoice.paidAt) : undefined,
              paymentMethod: invoice.paymentMethod,
              transactionReference: invoice.paymentReference,
              paymentNotes: invoice.paymentNotes,
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="paymentStatus"
                  label="Payment Status"
                  rules={[{ required: true, message: "Please select payment status" }]}
                >
                  <Select placeholder="Select payment status">
                    <Option value="unpaid">Unpaid</Option>
                    <Option value="paid">Paid</Option>
                    <Option value="overdue">Overdue</Option>
                    <Option value="cancelled">Cancelled</Option>
                    <Option value="disputed">Disputed</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="paymentDate" label="Payment Date">
                  <DatePicker 
                    style={{ width: "100%" }} 
                    placeholder="Select payment date"
                    disabled={!isPaymentCompleted(form.getFieldValue("paymentStatus"))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.paymentStatus !== currentValues.paymentStatus
              }
            >
              {({ getFieldValue }) => {
                const currentStatus = getFieldValue("paymentStatus");
                const showPaymentFields = isPaymentCompleted(currentStatus);

                return (
                  <>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="paymentMethod"
                          label="Payment Method"
                          rules={
                            showPaymentFields
                              ? [{ required: true, message: "Please select payment method" }]
                              : []
                          }
                        >
                          <Select
                            placeholder="Select payment method"
                            disabled={!showPaymentFields}
                          >
                            <Option value="bank_transfer">Bank Transfer</Option>
                            <Option value="paypal">PayPal</Option>
                            <Option value="stripe">Stripe</Option>
                            <Option value="wise">Wise</Option>
                            <Option value="crypto">Cryptocurrency</Option>
                            <Option value="mobile_money">Mobile Money</Option>
                            <Option value="check">Check</Option>
                            <Option value="cash">Cash</Option>
                            <Option value="other">Other</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="transactionReference"
                          label="Transaction Reference"
                          rules={
                            showPaymentFields && currentStatus === "paid"
                              ? [{ required: true, message: "Please enter transaction reference" }]
                              : []
                          }
                        >
                          <Input
                            placeholder="Transaction ID/Reference"
                            disabled={!showPaymentFields}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                );
              }}
            </Form.Item>

            <Form.Item name="paymentNotes" label="Payment Notes">
              <TextArea
                rows={3}
                placeholder="Additional notes about the payment"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default UpdatePaymentModal;