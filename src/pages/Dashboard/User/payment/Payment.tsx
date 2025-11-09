import React, { useState, useEffect } from "react";
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
import Header from "../Header";
import Paid from "./Paid";
import Unpaid from "./Unpaid";
import { useUserInvoices } from "../../../../hooks/Auth/User/Invoices/useUserInvoices";

const { RangePicker } = DatePicker;

const Payment = () => {
  const [activeTab, setActiveTab] = useState("unpaid");
  const [filters, setFilters] = useState({
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  const { 
    getUserInvoices,
    getUnpaidInvoices,
    getPaidInvoices,
    getInvoiceDashboard,
    invoices,
    dashboardData,
    loading 
  } = useUserInvoices();

  useEffect(() => {
    loadData();
  }, [activeTab, filters]);

  const loadData = () => {
    if (activeTab === "paid") {
      getPaidInvoices({
        ...filters,
        page: 1,
        limit: 50,
      });
    } else {
      getUnpaidInvoices({
        ...filters,
        page: 1,
        limit: 50,
      });
    }
    
    // Load dashboard data
    getInvoiceDashboard();
  };

  const handleDateRangeChange = (dates: any) => {
    setFilters(prev => ({
      ...prev,
      startDate: dates?.[0]?.toISOString(),
      endDate: dates?.[1]?.toISOString(),
    }));
  };

  const handleRefresh = () => {
    loadData();
    message.success("Data refreshed");
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <Header title="Payments" />

      {/* Summary Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={dashboardData?.summary?.totalAmount || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
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
        <Col span={6}>
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
        <Col span={6}>
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
                  invoices={invoices || []}
                  loading={loading}
                  onRefresh={loadData}
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
                  onRefresh={loadData}
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