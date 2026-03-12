import React, { useState, useEffect } from "react";
import partnerInvoiceMutationService from "../../../../services/partner-invoice-service/invoice-mutation";
import partnerInvoiceQueryService from "../../../../services/partner-invoice-service/invoice-query";
import { Invoice } from "../../../../store/useInvoiceStore";
import { formatMoney } from "../../../../utils/moneyFormat";
import { Card, Button, Typography, Space, App, Modal, Input } from "antd";
import {
  SendOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SendInvoiceProps {
  open: boolean;
  invoiceId: string | null;
  onClose: () => void;
}

const SendInvoice = ({ open, invoiceId, onClose }: SendInvoiceProps) => {
  const { message } = App.useApp();
  const { data: invoices = [] } = partnerInvoiceQueryService.useFetchPartnerInvoices();
  const { mutateAsync: sendPartnerInvoice, isPending: loading } = partnerInvoiceMutationService.useSendPartnerInvoice();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [subject, setSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const currencySymbols: Record<string, string> = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
  };

  useEffect(() => {
    const foundInvoice = invoices.find((inv) => inv._id === invoiceId);
    if (foundInvoice) {
      setInvoice(foundInvoice);
      setSubject(`Invoice for ${foundInvoice.name}`);
      const symbol = currencySymbols[foundInvoice.currency] || "";
      setEmailMessage(
        `Hello ${foundInvoice.name},\n\nPlease find the details for your invoice.\nAmount: ${symbol}${foundInvoice.amount}\nDue Date: ${new Date(
          foundInvoice.due_date
        ).toLocaleDateString()}\n\nRegards,\nTeam`
      );
    }
  }, [invoiceId, invoices]);

  const handleSend = async () => {
    if (!invoiceId) return;
    try {
      await sendPartnerInvoice({
        id: invoiceId,
      });
      message.success("Invoice sent successfully");
      onClose();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to send invoice";
      message.error(errorMessage);
    }
  };

  if (!invoice) {
    return null;
  }

  return (
    <Modal
      title={
        <div>
          <Title level={4} className="m-0 flex items-center">
            Send Invoice via Email
          </Title>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
      className="font-[gilroy-regular]"
    >
      <div className="mt-4">

        <div className="max-w-md mx-auto">
          <Card className="shadow-sm">
            <Title level={5} className="mb-4">
              Invoice Summary
            </Title>
            <Paragraph className="text-gray-500 mb-6">
              Preview of the invoice details that will be attached.
            </Paragraph>

            <Space direction="vertical" className="w-full" size="middle">
              <div className="flex items-start">
                <div className="mr-3 mt-1 text-xl text-gray-400 font-bold">
                  {currencySymbols[invoice.currency] || ""}
                </div>
                <div>
                  <Text type="secondary" className="text-xs uppercase">
                    Amount
                  </Text>
                  <div className="text-lg font-bold">
                    {formatMoney(invoice.amount, invoice.currency)}
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

            <div className="mt-8 pt-6 border-t">
              <Paragraph className="text-xs text-gray-400 italic mb-6">
                Note: A professional PDF version of this invoice will be
                automatically generated and linked in the email.
              </Paragraph>


              <div className="flex justify-end gap-3">
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={loading}
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default SendInvoice;
