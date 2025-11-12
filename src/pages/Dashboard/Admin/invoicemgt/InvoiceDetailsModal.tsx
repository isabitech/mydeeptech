import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Typography,
  Space,
  Button,
  Divider,
  Row,
  Col,
  Card,
  Timeline,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import {
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ProjectOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { Invoice, PaymentStatus, DTUserInfo, ProjectInfo } from "../../../../types/invoice.types";

const { Title, Text, Paragraph } = Typography;

interface InvoiceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onPrint?: (invoice: Invoice) => void;
  onSendEmail?: (invoice: Invoice) => void;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  open,
  onClose,
  invoice,
  onPrint,
  onSendEmail,
}) => {
  if (!invoice) return null;

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

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <CheckCircleOutlined />;
      case "unpaid":
        return <ClockCircleOutlined />;
      case "overdue":
        return <CalendarOutlined />;
      case "cancelled":
        return <InfoCircleOutlined />;
      case "disputed":
        return <InfoCircleOutlined />;
      default:
        return <InfoCircleOutlined />;
    }
  };

  const getDTUserName = (dtUserId: string | DTUserInfo): string => {
    if (typeof dtUserId === "string") return "User ID: " + dtUserId;
    return dtUserId.fullName;
  };

  const getDTUserEmail = (dtUserId: string | DTUserInfo): string => {
    if (typeof dtUserId === "string") return "N/A";
    return dtUserId.email;
  };

  const getProjectName = (projectId: string | ProjectInfo): string => {
    if (typeof projectId === "string") return "Project ID: " + projectId;
    return projectId.projectName;
  };

  const getProjectCategory = (projectId: string | ProjectInfo): string => {
    if (typeof projectId === "string") return "N/A";
    return projectId.projectCategory || "N/A";
  };

  const calculateDaysOverdue = (dueDate: string, paymentStatus: PaymentStatus) => {
    if (paymentStatus === "paid" || paymentStatus === "cancelled") return 0;
    const now = dayjs();
    const due = dayjs(dueDate);
    return now.isAfter(due) ? now.diff(due, "day") : 0;
  };

  const getTimelineItems = () => {
    const items = [
      {
        color: "blue",
        dot: <FileTextOutlined />,
        children: (
          <div>
            <Text strong>Invoice Created</Text>
            <br />
            <Text type="secondary">{dayjs(invoice.createdAt).format("MMM DD, YYYY HH:mm")}</Text>
          </div>
        ),
      },
    ];

    if (invoice.emailSent && invoice.emailSentAt) {
      items.push({
        color: "orange",
        dot: <MailOutlined />,
        children: (
          <div>
            <Text strong>Email Sent</Text>
            <br />
            <Text type="secondary">{dayjs(invoice.emailSentAt).format("MMM DD, YYYY HH:mm")}</Text>
          </div>
        ),
      });
    }

    if (invoice.paidAt) {
      items.push({
        color: "green",
        dot: <CheckCircleOutlined />,
        children: (
          <div>
            <Text strong>Payment Received</Text>
            <br />
            <Text type="secondary">{dayjs(invoice.paidAt).format("MMM DD, YYYY HH:mm")}</Text>
            {invoice.paidAmount && (
              <>
                <br />
                <Text>Amount: {invoice.currency} {invoice.paidAmount.toFixed(2)}</Text>
              </>
            )}
          </div>
        ),
      });
    }

    return items;
  };

  const daysOverdue = calculateDaysOverdue(invoice.dueDate, invoice.paymentStatus);
  const isOverdue = daysOverdue > 0;

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Invoice Details - {invoice.formattedInvoiceNumber}</span>
          <Tag color={getStatusColor(invoice.paymentStatus)} icon={getStatusIcon(invoice.paymentStatus)}>
            {invoice.paymentStatus.toUpperCase()}
          </Tag>
          {isOverdue && (
            <Tag color="red">
              {daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue
            </Tag>
          )}
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        onSendEmail && (
          <Button
            key="email"
            icon={<MailOutlined />}
            onClick={() => onSendEmail(invoice)}
          >
            Send Email
          </Button>
        ),
        onPrint && (
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => onPrint(invoice)}
          >
            Print
          </Button>
        ),
      ].filter(Boolean)}
    >
      <Row gutter={[16, 16]}>
        {/* Invoice Header */}
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle">
              <Col>
                <Space direction="vertical" size={0}>
                  <Title level={4} style={{ margin: 0 }}>
                    <DollarOutlined /> {invoice.currency} {invoice.invoiceAmount.toFixed(2)}
                  </Title>
                  <Text type="secondary">Invoice #{invoice.invoiceNumber}</Text>
                </Space>
              </Col>
              <Col>
                <Space direction="vertical" size={0} align="end">
                  <Text>Due: {dayjs(invoice.dueDate).format("MMM DD, YYYY")}</Text>
                  <Text type="secondary">
                    Created: {dayjs(invoice.invoiceDate).format("MMM DD, YYYY")}
                  </Text>
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Main Details */}
        <Col span={16}>
          <Card title="Invoice Information" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label={<><UserOutlined /> DTUser</>}>
                <Space direction="vertical" size={0}>
                  <Text strong>{getDTUserName(invoice.dtUserId)}</Text>
                  <Text type="secondary">{getDTUserEmail(invoice.dtUserId)}</Text>
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label={<><ProjectOutlined /> Project</>}>
                <Space direction="vertical" size={0}>
                  <Text strong>{getProjectName(invoice.projectId)}</Text>
                  <Text type="secondary">{getProjectCategory(invoice.projectId)}</Text>
                </Space>
              </Descriptions.Item>

              <Descriptions.Item label="Invoice Type">
                <Tag>{invoice.invoiceType.replace('_', ' ').toUpperCase()}</Tag>
              </Descriptions.Item>

              {invoice.workPeriodStart && invoice.workPeriodEnd && (
                <Descriptions.Item label={<><CalendarOutlined /> Work Period</>}>
                  {dayjs(invoice.workPeriodStart).format("MMM DD")} - {" "}
                  {dayjs(invoice.workPeriodEnd).format("MMM DD, YYYY")}
                </Descriptions.Item>
              )}

              {invoice.hoursWorked && (
                <Descriptions.Item label={<><ClockCircleOutlined /> Hours Worked</>}>
                  {invoice.hoursWorked} hours
                </Descriptions.Item>
              )}

              {invoice.tasksCompleted && (
                <Descriptions.Item label="Tasks Completed">
                  {invoice.tasksCompleted} tasks
                </Descriptions.Item>
              )}

              {invoice.qualityScore !== undefined && (
                <Descriptions.Item label={<><StarOutlined /> Quality Score</>}>
                  <Space>
                    <Text>{invoice.qualityScore}/100</Text>
                    <Tag color={invoice.qualityScore >= 90 ? "green" : invoice.qualityScore >= 70 ? "orange" : "red"}>
                      {invoice.qualityScore >= 90 ? "Excellent" : invoice.qualityScore >= 70 ? "Good" : "Needs Improvement"}
                    </Tag>
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {(invoice.description || invoice.workDescription) && (
              <>
                <Divider />
                {invoice.description && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Description:</Text>
                    <Paragraph>{invoice.description}</Paragraph>
                  </div>
                )}
                
                {invoice.workDescription && (
                  <div>
                    <Text strong>Work Description:</Text>
                    <Paragraph>{invoice.workDescription}</Paragraph>
                  </div>
                )}
              </>
            )}
          </Card>
        </Col>

        {/* Timeline */}
        <Col span={8}>
          <Card title="Timeline" size="small">
            <Timeline items={getTimelineItems()} />
          </Card>
        </Col>

        {/* Payment Information */}
        {(invoice.paymentMethod || invoice.paymentReference || invoice.paymentNotes) && (
          <Col span={24}>
            <Card title="Payment Information" size="small">
              <Descriptions column={2} size="small">
                {invoice.paymentMethod && (
                  <Descriptions.Item label="Payment Method">
                    <Tag>{invoice.paymentMethod.replace('_', ' ').toUpperCase()}</Tag>
                  </Descriptions.Item>
                )}

                {invoice.paymentReference && (
                  <Descriptions.Item label="Reference">
                    <Tooltip title="Click to copy">
                      <Text copyable>{invoice.paymentReference}</Text>
                    </Tooltip>
                  </Descriptions.Item>
                )}

                {invoice.paidAmount && (
                  <Descriptions.Item label="Paid Amount">
                    <Text strong>{invoice.currency} {invoice.paidAmount.toFixed(2)}</Text>
                  </Descriptions.Item>
                )}

                {invoice.paidAt && (
                  <Descriptions.Item label="Payment Date">
                    {dayjs(invoice.paidAt).format("MMM DD, YYYY HH:mm")}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {invoice.paymentNotes && (
                <>
                  <Divider />
                  <div>
                    <Text strong>Payment Notes:</Text>
                    <Paragraph>{invoice.paymentNotes}</Paragraph>
                  </div>
                </>
              )}
            </Card>
          </Col>
        )}

        {/* Admin Notes */}
        {invoice.adminNotes && (
          <Col span={24}>
            <Card title="Admin Notes" size="small">
              <Paragraph>{invoice.adminNotes}</Paragraph>
            </Card>
          </Col>
        )}
      </Row>
    </Modal>
  );
};

export default InvoiceDetailsModal;