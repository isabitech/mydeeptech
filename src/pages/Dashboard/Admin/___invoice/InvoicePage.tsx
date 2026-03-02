import { useNavigate } from "react-router-dom";
import { Button, Table, Tag, Dropdown, MenuProps } from "antd";
import { MoreOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useInvoiceContext, Invoice } from "./invoiceContext";



const InvoicePage = () => {
  const navigate = useNavigate();
  const { invoices, loading, deleteInvoice } = useInvoiceContext();

  const columns: ColumnsType<Invoice> = [
    {
      title: "Partner Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Amount (EUR)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `€${amount.toLocaleString()}`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const getMenuItems = (invoice: Invoice): MenuProps["items"] => [
          {
            key: "view",
            label: "View invoice",
            onClick: () => navigate(`/admin/invoice-page/${invoice._id}`),
          },
          {
            key: "email",
            label: "Send as Email",
            onClick: () => navigate(`/admin/invoice-page/${invoice._id}/send`),
          },
          {
            key: "edit",
            label: "Edit",
            onClick: () => navigate(`/admin/invoice-page/${invoice._id}/edit`),
          },
          {
            key: "delete",
            label: <span className="text-red-500">Delete</span>,
            danger: true,
            onClick: () => {
              if (invoice._id) deleteInvoice(invoice._id);
            },
          },
        ];

        return (
          <Dropdown
            menu={{ items: getMenuItems(record) }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{
                border: "none",
                boxShadow: "none",
                background: "transparent",
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-[gilroy-regular]">
      <div className="bg-white rounded-lg shadow-sm w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage your invoices and track payments
            </p>
          </div>

          <Button
            type="primary"
            icon={<FileTextOutlined />}
            className="bg-black border-black font-bold px-6 py-5"
            onClick={() => navigate("/admin/invoice-page/new")}
          >
            New Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm mb-2">
              Total Invoices
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {invoices.length}
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm mb-2">Total Value</div>
            <div className="text-2xl font-bold text-green-600">
              €{totalAmount.toLocaleString()}
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm mb-2">Average Invoice</div>
            <div className="text-2xl font-bold text-blue-600">
              €{invoices.length ? (totalAmount / invoices.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table <Invoice>
            columns={columns}
            dataSource={invoices}
            rowKey="_id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;