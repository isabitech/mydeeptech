import { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  Select,
  DatePicker,
  message,
} from "antd";
import {
  ReloadOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAdminInvoices } from "../../../../hooks/Auth/Admin/Invoices/useAdminInvoices";
import Header from "../../User/Header";
import Unpaid from "./Unpaid";
import Paid from "./Paid";

const { Option } = Select;
const { RangePicker } = DatePicker;

const PaymentManagement = () => {
  const [activeTab, setActiveTab] = useState("unpaid");
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
    projectId: undefined as string | undefined,
    dtUserId: undefined as string | undefined,
  });

  const { 
    getAllInvoices, 
    invoices, 
    summary, 
    loading, 
    updatePaymentStatus,
    sendPaymentReminder,
    deleteInvoice 
  } = useAdminInvoices();

  useEffect(() => {
    loadInvoices();
  }, [activeTab, filters]);

  const loadInvoices = () => {
    const paymentStatus = activeTab === "paid" ? "paid" : "unpaid";
    getAllInvoices({
      paymentStatus,
      ...filters,
      page: 1,
      limit: 50,
    });
  };

  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({
      ...prev,
      startDate: dates?.[0]?.toISOString(),
      endDate: dates?.[1]?.toISOString(),
    }));
  };

  const handleRefresh = () => {
    loadInvoices();
    message.success("Data refreshed");
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <Header title="Payment Management" />

      {/* Summary Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={summary?.totalAmount || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={summary?.totalAmount || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={summary?.paidAmount || 0}
              precision={2}
              prefix={<CheckCircleOutlined />}
              suffix="USD"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Unpaid Amount"
              value={summary?.unpaidAmount || 0}
              precision={2}
              prefix={<ClockCircleOutlined />}
              suffix="USD"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card>
        <Row gutter={16} align="middle">
          <Col>
            <RangePicker
              onChange={handleDateRangeChange}
              placeholder={["Start Date", "End Date"]}
            />
          </Col>
          <Col>
            <Select
              placeholder="Select Project"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, projectId: value }))}
            >
              {/* TODO: Load actual projects */}
              <Option value="project1">Sample Project 1</Option>
              <Option value="project2">Sample Project 2</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Select DTUser"
              style={{ width: 200 }}
              allowClear
              onChange={(value) => setFilters(prev => ({ ...prev, dtUserId: value }))}
            >
              {/* TODO: Load actual DTUsers */}
              <Option value="user1">Sample User 1</Option>
              <Option value="user2">Sample User 2</Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs for Paid/Unpaid */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'unpaid',
              label: 'Unpaid Invoices',
              children: (
                <Unpaid
                  invoices={invoices || []}
                  loading={loading}
                  onRefresh={loadInvoices}
                  onUpdatePayment={updatePaymentStatus}
                  onSendReminder={sendPaymentReminder}
                  onDelete={deleteInvoice}
                />
              ),
            },
            {
              key: 'paid',
              label: 'Paid Invoices',
              children: (
                <Paid
                  invoices={invoices || []}
                  loading={loading}
                  onRefresh={loadInvoices}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default PaymentManagement;
