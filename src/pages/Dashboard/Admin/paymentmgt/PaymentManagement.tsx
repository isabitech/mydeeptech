import React, { useState, useEffect } from "react";

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
  Modal,
  Descriptions,
  Typography,
  Divider,
  Tag,
} from "antd";
import {
  ReloadOutlined,
  DollarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Unpaid from "./Unpaid";
import Paid from "./Paid";
import { useAdminInvoices } from "../../../../hooks/Auth/Admin/Invoices/useAdminInvoices";
import exchangeRateQueryService from "../../../../services/exchange-rate/exchange-rate-query";
import { formatMoney } from '../../../../utils/moneyFormat';

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
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Country select and exchange rate state
  const [selectedCountry, setSelectedCountry] = useState<string>('Nigeria');
  // Adjustment input state
  const [exchangeRateAdjustment, setExchangeRateAdjustment] = useState<number>(0);
  // Retry counter for exchange rate
  const [retryCount, setRetryCount] = useState<number>(0);
  // Selected invoices tracking
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  
  // Use custom hook for exchange rate
  const {
    exchangeRateData,
    isExchangeRateLoading,
    isExchangeRateError,
    exchangeRateError,
    refetch: refetchExchangeRate
  } = exchangeRateQueryService.useGetExchangeRateByCountry(selectedCountry);

  // Country to currency code mapping
  const countryCurrencyMap: Record<string, string> = {
    Nigeria: 'NGN',
    Ghana: 'GHS',
    Kenya: 'KES',
    SouthAfrica: 'ZAR',
    USA: 'USD',
    UK: 'GBP',
    Eurozone: 'EUR',
    India: 'INR',
    Canada: 'CAD',
    Australia: 'AUD',
  };

  // ...existing code...

  const {
    getAllInvoices,
    invoices,
    summary,
    loading,
    updatePaymentStatus,
    sendPaymentReminder,
    deleteInvoice,
    bulkAuthorizePayment,
    generatePaystackCSV,
    generateMpesaCSV,
  } = useAdminInvoices();

  useEffect(() => {
    loadInvoices();
  }, [activeTab, filters]);

  // Handle exchange rate errors
  useEffect(() => {
    if (isExchangeRateError && exchangeRateError) {
      console.error('Exchange rate error:', exchangeRateError);
      
      // Create user-friendly error message
      let errorMessage = 'Unknown error occurred';
      if (exchangeRateError?.message?.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few minutes.';
      } else if (exchangeRateError?.message?.toLowerCase().includes('network')) {
        errorMessage = 'Network connection error. Please check your internet connection.';
      } else if (exchangeRateError?.message?.toLowerCase().includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (exchangeRateError?.message) {
        errorMessage = exchangeRateError.message;
      }
      
      message.error({
        content: `Failed to fetch exchange rate for ${selectedCountry}: ${errorMessage}`,
        duration: 5,
        key: 'exchange-rate-error'
      });
    }
  }, [isExchangeRateError, exchangeRateError, selectedCountry]);
 
  // Reset retry count when country changes
  useEffect(() => {
    setRetryCount(0);
  }, [selectedCountry]);

  // Calculate total sum of selected invoices
  const selectedInvoicesTotal = React.useMemo(() => {
    if (selectedInvoiceIds.length === 0 || !invoices) return 0;
    
    return invoices
      .filter(invoice => selectedInvoiceIds.includes(invoice._id))
      .reduce((total, invoice) => total + (invoice.invoiceAmount || 0), 0);
  }, [selectedInvoiceIds, invoices]);

  // Calculate converted total based on exchange rate
  const convertedSelectedTotal = React.useMemo(() => {
    if (selectedInvoicesTotal === 0) return 0;
    
    const exchangeRate = !isExchangeRateError && exchangeRateData?.rate !== undefined 
      ? Math.max(0, exchangeRateData.rate - exchangeRateAdjustment)
      : isExchangeRateError && exchangeRateAdjustment > 0
        ? exchangeRateAdjustment
        : 0;
    
    return selectedInvoicesTotal * exchangeRate;
  }, [selectedInvoicesTotal, isExchangeRateError, exchangeRateData?.rate, exchangeRateAdjustment]);

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

  const handleRetryExchangeRate = () => {
    setRetryCount(prev => prev + 1);
    message.loading({
      content: `Retrying exchange rate fetch for ${selectedCountry}... (Attempt ${retryCount + 1})`,
      key: 'exchange-rate-retry',
      duration: 2
    });
    refetchExchangeRate();
  };

  const showPaymentModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalVisible(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalVisible(false);
    setSelectedInvoice(null);
    setIsAuthorizing(false);
  };

  const handleAuthorizePayment = async () => {
    if (!selectedInvoice) return;
    if (exchangeRateAdjustment === 0) {
      message.warning('Adjustment value is zero. Invoice will not be sent.');
      return;
    }

    setIsAuthorizing(true);
    try {
      const result = await updatePaymentStatus(selectedInvoice._id, { paymentStatus: 'paid' });

      if (result.success) {
        message.success('Payment authorized successfully!');
        handleClosePaymentModal();
        loadInvoices(); // Refresh the data
      } else {
        message.error(result.error || 'Failed to authorize payment');
      }
    } catch (error: any) {
      console.error('Payment authorization error:', error);
      message.error('An error occurred while authorizing payment');
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">

      {/* Summary Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={summary?.totalInvoices || 0}
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


      {/* Country & Exchange Rate Section */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col span={24}>
            <Space size={24} align="center" style={{ width: '100%', justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 500 }}>
                Exchange Rate ({countryCurrencyMap[selectedCountry]} / USD):
                {isExchangeRateLoading ? (
                  <span style={{ marginLeft: 8, color: '#1890ff' }}>Loading...</span>
                ) : isExchangeRateError && exchangeRateAdjustment <= 0 ? (
                  <span style={{ marginLeft: 8 }}>
                    <span style={{ color: 'red', marginRight: 8 }}>
                      Error loading rate
                    </span>
                    <Button 
                      size="small" 
                      type="link" 
                      onClick={handleRetryExchangeRate}
                      style={{ padding: 0, height: 'auto', fontSize: '12px' }}
                      disabled={retryCount >= 3}
                    >
                      {retryCount >= 3 ? 'Max retries reached' : `Retry (${retryCount}/3)`}
                    </Button>
                  </span>
                ) : exchangeRateData && exchangeRateData.rate !== undefined ? (
                  <span style={{ marginLeft: 8, fontWeight: 'bold', fontSize: "20px", color: '#1890ff' }}>
                    {formatMoney(
                      Math.max(0, exchangeRateData.rate - exchangeRateAdjustment),
                      countryCurrencyMap[selectedCountry],
                      selectedCountry === 'Nigeria' ? 'en-NG' : 'en-US'
                    )}
                  </span>
                ) : exchangeRateAdjustment > 0 ? (
                  <span style={{ marginLeft: 8, fontWeight: 'bold', fontSize: "20px", color: '#f39c12' }}>
                    {formatMoney(
                      exchangeRateAdjustment,
                      countryCurrencyMap[selectedCountry],
                      selectedCountry === 'Nigeria' ? 'en-NG' : 'en-US'
                    )}
                    <span style={{ fontSize: "12px", color: '#666', marginLeft: 4 }}>
                      (using adjusted price)
                    </span>
                  </span>
                ) : (
                  <span style={{ marginLeft: 8, color: 'red' }}>N/A</span>
                )}
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex flex-col gap-1.5">
                  <span style={{ fontWeight: 500 }}>Select Country:</span>
                  <Select
                  style={{ width: 180 }}
                  value={selectedCountry}
                  onChange={setSelectedCountry}
                  options={Object.keys(countryCurrencyMap).map(country => ({ label: country, value: country }))}
                />
                </div>
               <div className="flex flex-col gap-1.5">
                  <span style={{ fontWeight: 500, marginLeft: 16 }}>Adjust Price:</span>
                   <input
                    type="number"
                    min="0"
                    step="any"
                    value={exchangeRateAdjustment}
                    onChange={e => setExchangeRateAdjustment(Number(e.target.value))}
                    placeholder="Adjustment"
                    style={{ width: 120, marginLeft: 16, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
                />
               </div>
              </div>
            </Space>
          </Col>
        </Row>
        
        {/* Selected Invoices Total */}
        {selectedInvoiceIds.length > 0 && (
          <Row gutter={16} align="middle" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Col span={24}>
              <Space size={24} align="center" style={{ width: '100%', justifyContent: 'space-between', display: 'flex', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontWeight: 500, marginRight: 8 }}>Selected Invoices Total:</span>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
                    {selectedInvoiceIds.length} invoice{selectedInvoiceIds.length > 1 ? 's' : ''}
                  </span>
                  <span style={{ marginLeft: 12, color: '#666' }}>|</span>
                  <span style={{ marginLeft: 12, fontWeight: 'bold', fontSize: '18px', color: '#52c41a' }}>
                    ${selectedInvoicesTotal.toFixed(2)} USD
                  </span>
                  {convertedSelectedTotal > 0 && (
                    <>
                      <span style={{ marginLeft: 12, color: '#666' }}>→</span>
                      <span style={{ marginLeft: 8, fontWeight: 'bold', fontSize: '18px', color: '#f39c12' }}>
                        {formatMoney(
                          convertedSelectedTotal,
                          countryCurrencyMap[selectedCountry],
                          selectedCountry === 'Nigeria' ? 'en-NG' : 'en-US'
                        )}
                      </span>
                    </>
                  )}
                </div>
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => setSelectedInvoiceIds([])}
                  style={{ color: '#999' }}
                >
                  Clear Selection
                </Button>
              </Space>
            </Col>
          </Row>
        )}
      </Card>

      {/* Exchange Rate Error Warning */}
      {isExchangeRateError && (
        <Card style={{ marginBottom: 16 }}>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationCircleOutlined className="text-yellow-600 mt-1 text-lg" />
              <div className="flex-1">
                <Typography.Text strong className="text-yellow-800 block mb-2">
                  Exchange Rate Service Warning
                </Typography.Text>
                <Typography.Text className="text-yellow-700 block mb-3">
                  Unable to fetch current exchange rates for {selectedCountry}. This may affect bulk payment processing.
                </Typography.Text>
                <div className="text-yellow-600 text-sm mb-3">
                  <strong>Error:</strong> {exchangeRateError?.message || 'Unknown error occurred'}
                </div>
                <Space>
                  <Button 
                    size="small" 
                    type="primary" 
                    ghost 
                    onClick={handleRetryExchangeRate}
                    disabled={retryCount >= 3 || isExchangeRateLoading}
                    loading={isExchangeRateLoading}
                  >
                    {isExchangeRateLoading ? 'Retrying...' : `Retry (${retryCount}/3)`}
                  </Button>
                  {retryCount >= 3 && (
                    <Typography.Text className="text-yellow-600 text-xs">
                      Max retries reached. You can still process payments manually.
                    </Typography.Text>
                  )}
                </Space>
              </div>
            </div>
          </div>
        </Card>
      )}

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
                  onShowPaymentModal={showPaymentModal}
                  onBulkAuthorizePayment={bulkAuthorizePayment}
                  onGeneratePaystackCSV={(invoiceIds) => generatePaystackCSV(invoiceIds)}
                  onGenerateMpesaCSV={(invoiceIds) => generateMpesaCSV(invoiceIds)}
                  exchangeRateToSend={
                    !isExchangeRateError && exchangeRateData?.rate !== undefined 
                      ? Number(Math.max(0, exchangeRateData.rate - exchangeRateAdjustment).toFixed(2)) 
                      : isExchangeRateError && exchangeRateAdjustment > 0
                        ? Number(exchangeRateAdjustment.toFixed(2))
                        : undefined
                  }
                  exchangeRateError={isExchangeRateError}
                  selectedInvoiceIds={selectedInvoiceIds}
                  onSelectedInvoiceIdsChange={setSelectedInvoiceIds}
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

      {/* Authorize Payment Modal */}
      <Modal
        title={(
          <div className="flex items-center gap-2">
            <DollarOutlined className="text-green-500" />
            <span>Authorize Payment</span>
          </div>
        )}
        open={isPaymentModalVisible}
        onCancel={handleClosePaymentModal}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleClosePaymentModal}>
            Cancel
          </Button>,
          <Button
            key="authorize"
            type="primary"
            loading={isAuthorizing}
            disabled={!selectedInvoice?.dtUserId?.payment_info}
            onClick={handleAuthorizePayment}
            className="bg-green-500 border-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:border-gray-400"
          >
            {selectedInvoice?.dtUserId?.payment_info ? 'Authorize Payment' : 'Payment Info Required'}
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div className="space-y-6">
            {/* Payment Information - FIRST SECTION */}
            {selectedInvoice.dtUserId?.payment_info ? (
              <div>
                <Typography.Title level={4} className="mb-4 text-gray-800">
                  Payment Information
                </Typography.Title>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="Account Name">
                    {selectedInvoice.dtUserId.payment_info.account_name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Account Number">
                    <Typography.Text copyable className="font-mono">
                      {selectedInvoice.dtUserId.payment_info.account_number || 'N/A'}
                    </Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Bank Name" span={2}>
                    {selectedInvoice.dtUserId.payment_info.bank_name || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Method">
                    <Tag color="blue">
                      {selectedInvoice.dtUserId.payment_info.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Payment Currency">
                    <Tag color="green">
                      {selectedInvoice.dtUserId.payment_info.payment_currency || 'N/A'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <ClockCircleOutlined className="text-red-600 mt-1" />
                  <div>
                    <Typography.Text strong className="text-red-800">
                      Payment Information Missing
                    </Typography.Text>
                    <div className="text-red-600 mt-1">
                      The user has not provided payment information. Payment authorization cannot proceed until this information is available.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Divider />

            {/* Invoice Summary */}
            <div>
              <Typography.Title level={4} className="mb-4 text-gray-800">
                Invoice Summary
              </Typography.Title>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Invoice Number" span={2}>
                  <Typography.Text copyable className="font-mono">
                    {selectedInvoice.formattedInvoiceNumber || selectedInvoice.invoiceNumber}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Invoice Amount">
                  <Typography.Text strong className="text-xl text-green-600">
                    {selectedInvoice.currency} {selectedInvoice.invoiceAmount?.toFixed(2)}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={selectedInvoice.paymentStatus === 'paid' ? 'green' : 'orange'}>
                    {selectedInvoice.paymentStatus?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Project">
                  {selectedInvoice.projectId?.projectName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  {selectedInvoice.projectId?.projectCategory || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Work Period">
                  {new Date(selectedInvoice.workPeriodStart).toLocaleDateString()} - {new Date(selectedInvoice.workPeriodEnd).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Hours Worked">
                  {selectedInvoice.hoursWorked} hours
                </Descriptions.Item>
                <Descriptions.Item label="Tasks Completed">
                  {selectedInvoice.tasksCompleted || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Quality Score">
                  <Tag color="blue">{selectedInvoice.qualityScore || 'N/A'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Invoice Date">
                  {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Due Date">
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Days Overdue">
                  <Tag color={selectedInvoice.daysOverdue > 0 ? 'red' : 'green'}>
                    {selectedInvoice.daysOverdue} days
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            {/* Beneficiary Information */}
            <div>
              <Typography.Title level={4} className="mb-4 text-gray-800">
                Beneficiary Information
              </Typography.Title>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Full Name">
                  {selectedInvoice.dtUserId?.fullName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedInvoice.dtUserId?.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Phone" span={2}>
                  {selectedInvoice.dtUserId?.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="DTUser ID" span={2}>
                  <Typography.Text copyable className="font-mono">
                    {selectedInvoice.dtUserId?._id || 'N/A'}
                  </Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            {/* Authorization Checklist */}
            {selectedInvoice.dtUserId?.payment_info && (
              <div>
                <Typography.Title level={4} className="mb-4 text-gray-800">
                  Payment Authorization Checklist
                </Typography.Title>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Typography.Text strong className="text-blue-800">
                        ✓ Verify Payment Details
                      </Typography.Text>
                    </div>
                    <div className="text-blue-700 text-sm ml-6">
                      • Account Name: {selectedInvoice.dtUserId.payment_info.account_name}
                    </div>
                    <div className="text-blue-700 text-sm ml-6">
                      • Bank: {selectedInvoice.dtUserId.payment_info.bank_name}
                    </div>
                    <div className="text-blue-700 text-sm ml-6">
                      • Amount: {selectedInvoice.currency} {selectedInvoice.invoiceAmount?.toFixed(2)}
                    </div>
                    <div className="flex items-start gap-3 mt-4">
                      <Typography.Text strong className="text-blue-800">
                        ⚠️ Pre-Authorization Checks
                      </Typography.Text>
                    </div>
                    <div className="text-blue-700 text-sm ml-6">
                      • Verify invoice accuracy and work completion
                    </div>
                    <div className="text-blue-700 text-sm ml-6">
                      • Confirm beneficiary identity matches records
                    </div>
                    <div className="text-blue-700 text-sm ml-6">
                      • Ensure sufficient approval authority for amount
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Divider />

            {/* Work Details */}
            <div>
              <Typography.Title level={4} className="mb-4 text-gray-800">
                Work Details
              </Typography.Title>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Work Description">
                  <div className="bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                    <Typography.Text>
                      {selectedInvoice.workDescription || selectedInvoice.description || 'No description provided'}
                    </Typography.Text>
                  </div>
                </Descriptions.Item>
                {selectedInvoice.adminNotes && (
                  <Descriptions.Item label="Admin Notes">
                    <div className="bg-blue-50 p-3 rounded border">
                      <Typography.Text>
                        {selectedInvoice.adminNotes}
                      </Typography.Text>
                    </div>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Invoice Type">
                  <Tag color="purple">{selectedInvoice.invoiceType?.replace('_', ' ').toUpperCase() || 'N/A'}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            {/* Created By Information */}
            <div>
              <Typography.Title level={4} className="mb-4 text-gray-800">
                Invoice Created By
              </Typography.Title>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Admin Name">
                  {selectedInvoice.createdBy?.fullName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Admin Email">
                  {selectedInvoice.createdBy?.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Created Date" span={2}>
                  {new Date(selectedInvoice.createdAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* Authorization Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircleOutlined className="text-yellow-600 mt-1" />
                <div>
                  <Typography.Text strong className="text-yellow-800">
                    Payment Authorization Confirmation
                  </Typography.Text>
                  <Typography.Paragraph className="mb-0 mt-2 text-yellow-700">
                    By clicking "Authorize Payment", you confirm that:
                    <ul className="mt-2 ml-4">
                      <li>The work described has been completed satisfactorily</li>
                      <li>The quality score of <strong>{selectedInvoice.qualityScore || 'N/A'}</strong> is acceptable</li>
                      <li>You authorize payment of <strong>{selectedInvoice.currency} {selectedInvoice.invoiceAmount?.toFixed(2)}</strong></li>
                      <li>Payment will be sent to <strong>{selectedInvoice.dtUserId?.fullName}</strong></li>
                      {selectedInvoice.dtUserId?.payment_info && (
                        <>
                          <li>Bank: <strong>{selectedInvoice.dtUserId.payment_info.bank_name}</strong></li>
                          <li>Account: <strong>{selectedInvoice.dtUserId.payment_info.account_name}</strong> ({selectedInvoice.dtUserId.payment_info.account_number})</li>
                          <li>Currency: <strong>{selectedInvoice.dtUserId.payment_info.payment_currency}</strong></li>
                        </>
                      )}
                    </ul>
                  </Typography.Paragraph>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentManagement;
