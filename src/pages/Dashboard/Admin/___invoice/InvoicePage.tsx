import { useNavigate } from "react-router-dom";
import { Button, Table, Tag, Dropdown, MenuProps } from "antd";
import { MoreOutlined, FileTextOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useInvoiceContext, Invoice } from "./invoiceContext";



const InvoicePage = () => {
  const navigate = useNavigate();
  const { invoices } = useInvoiceContext(); // ✅ use context only

  const columns: ColumnsType<Invoice> = [
    {
      title: "Invoice #",
      dataIndex: "number",
      key: "number",
      sorter: (a, b) => a.number.localeCompare(b.number),
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      sorter: (a, b) => a.client.localeCompare(b.client),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Paid"
            ? "green"
            : status === "Sent"
            ? "blue"
            : "orange";

        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Paid", value: "Paid" },
        { text: "Pending", value: "Pending" },
        { text: "Sent", value: "Sent" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
    },
    {
      title: "Due Date",
      dataIndex: "due",
      key: "due",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const getMenuItems = (invoice: Invoice): MenuProps["items"] => [
          {
            key: "view",
            label: "View invoice",
            onClick: () =>
              navigate(`/admin/invoice-page/${invoice.id}`),
          },
          {
            key: "email",
            label: "Send as Email",
            onClick: () =>
              navigate(`/admin/invoice-page/${invoice.id}/send`),
          },
          {
            key: "edit",
            label: "Edit",
            onClick: () =>
              navigate(`/admin/invoice-page/${invoice.id}/edit`),
          },
          {
            key: "delete",
            label: <span className="text-red-500">Delete</span>,
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

  const paidCount = invoices.filter((i) => i.status === "Paid").length;
  const pendingCount = invoices.filter((i) => i.status === "Pending").length;

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
            <div className="text-gray-500 text-sm mb-2">Paid</div>
            <div className="text-2xl font-bold text-green-600">
              {paidCount}
            </div>
          </div>

          <div className="bg-gray-50 border rounded-lg p-5">
            <div className="text-gray-500 text-sm mb-2">Pending</div>
            <div className="text-2xl font-bold text-orange-600">
              {pendingCount}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table <Invoice>
            columns={columns}
            dataSource={invoices}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;