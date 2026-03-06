import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { useInvoiceStates, Invoice } from "../../../../store/useInvoiceStore";
import partnerInvoiceQueryService from "../../../../services/partner-invoice-service/invoice-query";
import { formatMoney } from "../../../../utils/moneyFormat";
import { Button, Typography, Card, Space, Descriptions, Divider, Tag } from "antd";
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

const InvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { data: invoices = [] } = partnerInvoiceQueryService.useFetchPartnerInvoices();

  const invoice = invoices.find(
    (inv) => inv._id === id
  );

  if (!invoice) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Title level={4}>Invoice not found</Title>
      </div>
    );
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
    navigate(`/admin/invoice-page/${invoice._id}/send`, {
      state: { invoice },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-[gilroy-regular]">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Back
        </Button>

        {/* Action Header */}
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="m-0">Invoice Details</Title>
          <Space>
            <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
              Export PDF
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() =>
                navigate(`/admin/invoice-page/${invoice._id}/edit`, {
                  state: { invoice },
                })
              }
            >
              Edit
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendToClient}
              className="bg-blue-600 border-blue-600"
            >
              Send to Client
            </Button>
          </Space>
        </div>

        {/* Invoice Body for PDF */}
        <div ref={invoiceRef}>
          <Card className="shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
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
                  <Tag color="gold">{invoice.duration}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label={<Space><CalendarOutlined /> Due Date</Space>}>
                  <Text strong>{new Date(invoice.due_date).toLocaleDateString()}</Text>
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
    </div>
  );
};

export default InvoiceDetails;
