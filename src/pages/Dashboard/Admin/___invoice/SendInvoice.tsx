import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import { Invoice, useInvoiceContext } from "./invoiceContext";
import React, { useEffect } from "react";
import { Card, Input, Button, Typography, Space, Divider, message } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  UserOutlined,
  EuroCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SendInvoice: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, sendInvoice } = useInvoiceContext();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [subject, setSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const foundInvoice = invoices.find((inv) => inv._id === id);
    if (foundInvoice) {
      setInvoice(foundInvoice);
      setSubject(`Invoice for ${foundInvoice.name}`);
      setEmailMessage(
        `Hello ${foundInvoice.name},\n\nPlease find the details for your invoice.\nAmount: €${foundInvoice.amount}\nDue Date: ${new Date(
          foundInvoice.due_date
        ).toLocaleDateString()}\n\nRegards,\nTeam`
      );
    }
  }, [id, invoices]);

  const handleSend = async () => {
    if (!id) return;
    setSending(true);
    try {
      await sendInvoice(id, subject, emailMessage);
      navigate("/admin/invoice-page");
    } catch (error) {
      console.error("Error sending invoice:", error);
    } finally {
      setSending(false);
    }
  };

  if (!invoice) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Title level={4}>Invoice not found</Title>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-[gilroy-regular]">
      <div className="max-w-4xl mx-auto">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Email Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <Title level={4} className="mb-6 flex items-center">
                <MailOutlined className="mr-2" />
                Send Invoice via Email
              </Title>

              <Space direction="vertical" className="w-full" size="large">
                <div>
                  <Text strong className="block mb-2 text-gray-600">
                    Recipient Email
                  </Text>
                  <Input
                    value={invoice.email}
                    disabled
                    prefix={<UserOutlined className="text-gray-400" />}
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Text strong className="block mb-2 text-gray-600">
                    Subject
                  </Text>
                  <Input
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div>
                  <Text strong className="block mb-2 text-gray-600">
                    Message
                  </Text>
                  <TextArea
                    rows={8}
                    placeholder="Write your message here..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                  />
                </div>

                <Divider />

                <div className="flex justify-end">
                  <Button
                    type="primary"
                    size="large"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    loading={sending}
                    className="bg-black border-black h-12 px-8"
                  >
                    Send Invoice
                  </Button>
                </div>
              </Space>
            </Card>
          </div>

          {/* Right Column: Invoice Summary */}
          <div>
            <Card className="shadow-sm">
              <Title level={5} className="mb-4">
                Invoice Summary
              </Title>
              <Paragraph className="text-gray-500 mb-6">
                Preview of the invoice details that will be attached.
              </Paragraph>

              <Space direction="vertical" className="w-full" size="middle">
                <div className="flex items-start">
                  <EuroCircleOutlined className="text-xl text-gray-400 mr-3 mt-1" />
                  <div>
                    <Text type="secondary" className="text-xs uppercase">
                      Amount
                    </Text>
                    <div className="text-lg font-bold">
                      €{invoice.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <CalendarOutlined className="text-xl text-gray-400 mr-3 mt-1" />
                  <div>
                    <Text type="secondary" className="text-xs uppercase">
                      Due Date
                    </Text>
                    <div className="font-semibold">
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <UserOutlined className="text-xl text-gray-400 mr-3 mt-1" />
                  <div>
                    <Text type="secondary" className="text-xs uppercase">
                      Partner
                    </Text>
                    <div className="font-semibold">{invoice.name}</div>
                  </div>
                </div>
              </Space>

              <div className="mt-8 pt-8 border-t">
                <Paragraph className="text-xs text-gray-400 italic">
                  Note: A professional PDF version of this invoice will be
                  automatically generated and linked in the email.
                </Paragraph>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendInvoice;