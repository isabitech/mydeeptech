import  { useState } from "react";
import {
  Card,
  Tabs,
  Row,
  Col,
  Statistic,
  Button,
  Space,
  DatePicker,
  message,
} from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import Paid from "./Paid";
import Unpaid from "./Unpaid";
import userInvoiceQueryService from "../../../../services/user-invoice-service/user-invoice-query";

const { RangePicker } = DatePicker;

const Payment = () => {
  const [activeTab, setActiveTab] = useState("unpaid");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  // TanStack Query hooks - automatically reactive to filter changes
  const dashboardQuery = userInvoiceQueryService.useUserInvoiceDashboard();
  const unpaidQuery = userInvoiceQueryService.useUnpaidInvoices(activeTab === "unpaid" ? filters : undefined);
  const paidQuery = userInvoiceQueryService.usePaidInvoices(activeTab === "paid" ? filters : undefined);

  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({
      ...prev,
      startDate: dates?.[0]?.toISOString(),
      endDate: dates?.[1]?.toISOString(),
    }));
  };

  const handleRefresh = () => {
    dashboardQuery.refetch();
    if (activeTab === "unpaid") {
      unpaidQuery.refetch();
    } else {
      paidQuery.refetch();
    }
    message.success("Data refreshed");
  };

  // Extract data from queries
  const dashboardData = dashboardQuery.data?.data || null;
  const unpaidInvoices = unpaidQuery.data?.data?.unpaidInvoices || [];
  const paidInvoices = paidQuery.data?.data?.paidInvoices || [];

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">

      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col span={6}  xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={dashboardData?.summary?.totalInvoices || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={dashboardData?.summary?.totalAmount || 0}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="USD"
            />
          </Card>
        </Col>
        <Col span={6} xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Paid Amount"
              value={dashboardData?.summary?.paidAmount || 0}
              precision={2}
              prefix={<CheckCircleOutlined />}
              suffix="USD"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card>
            <Statistic
              title="Unpaid Amount"
              value={dashboardData?.summary?.unpaidAmount || 0}
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
                  invoices={unpaidInvoices || []}
                  loading={unpaidQuery.isLoading}
                  onRefresh={() => unpaidQuery.refetch()}
                />
              ),
            },
            {
              key: 'paid',
              label: 'Paid Invoices',
              children: (
                <Paid
                  invoices={paidInvoices || []}
                  loading={paidQuery.isLoading}
                  onRefresh={() => paidQuery.refetch()}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Payment;