import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { Invoice } from "../../../../store/useInvoiceStore";
import partnerInvoiceQueryService from "../../../../services/partner-invoice-service/invoice-query";
import { formatMoney } from "../../../../utils/moneyFormat";
import { Button, Typography, Card, Space, Descriptions, Divider, Tag, Modal } from "antd";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  EditOutlined,
  SendOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

interface InvoiceDetailsProps {
  open: boolean;
  invoiceId: string | null;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onSend?: (id: string) => void;
}

const InvoiceDetails = ({ open, invoiceId, onClose, onEdit, onSend }: InvoiceDetailsProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { data: invoices = [] } = partnerInvoiceQueryService.useFetchPartnerInvoices();

  const invoice = invoices.find(
    (inv) => inv._id === invoiceId
  );

  if (!invoice) {
    return null;
  }

  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`invoice-${invoice.name}.pdf`);
  };

  const handleSendToClient = () => {
    if (onSend && invoice._id) {
      onSend(invoice._id);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      className="font-[gilroy-regular]"
      title={
        <div className="flex justify-between items-center pr-8">
          <Title level={4} className="m-0">Invoice Details</Title>
          <Space>
            <Button icon={<FilePdfOutlined />} onClick={handleExportPDF} >
              Export PDF
            </Button>
            {onEdit && (
              <Button
                icon={<EditOutlined />}
                onClick={() => invoice._id && onEdit(invoice._id)}
              >
                Edit
              </Button>
            )}
            {onSend && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendToClient}
              >
                Send
              </Button>
            )}
          </Space>
        </div>
      }
    >
      <div className="mt-4">
        {/* Invoice Body for PDF */}
        <div ref={invoiceRef}>
          <Card className="shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
            {/* Top Banner */}
            <div className="h-2 bg-primary" />

            <div className="p-8">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <Title level={3} className="m-0 text-primary">INVOICE</Title>
                  <Text type="secondary">#{invoice._id?.slice(-8).toUpperCase()}</Text>
                </div>
                <div className="text-right">
                  <Tag color="blue" className="px-3 py-1 text-sm font-semibold uppercase">
                    Partner Invoice
                  </Tag>
                  <div className="mt-2">
                    <Text type="secondary" className="block">Date Created</Text>
                    <Text strong>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</Text>
                  </div>
                </div>
              </div>

              <Descriptions
                title="Partner Information"
                bordered
                column={1}
                className="mb-10"
                labelStyle={{ width: '200px', backgroundColor: '#fafafa' }}
              >
                <Descriptions.Item label={<Space><UserOutlined /> Name</Space>}>
                  <Text strong className="text-lg">{invoice.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Email Address">
                  {invoice.email}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions
                title="Service Details"
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                className="mb-10"
                labelStyle={{ width: '200px', backgroundColor: '#fafafa' }}
              >
                <Descriptions.Item label={<Space><ClockCircleOutlined /> Duration</Space>}>
                  <Tag color="gold">{invoice.duration || "N/A"}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><CalendarOutlined /> Due Date</Space>}>
                  <Text strong>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</Text>
                </Descriptions.Item>
              </Descriptions>

              {invoice.description && (
                <div className="mb-10">
                  <Title level={5} className="mb-4 text-gray-600 border-b pb-2">Description / Notes</Title>
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap italic">
                    {invoice.description}
                  </div>
                </div>
              )}

              <Divider />

              <div className="flex justify-end pr-4">
                <div className="text-right space-y-2">
                  <Text type="secondary">Grand Total Amount</Text>
                  <div className="text-4xl font-bold text-primary flex items-center justify-end">
                    {formatMoney(invoice.amount, invoice.currency || "USD")}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default InvoiceDetails;
