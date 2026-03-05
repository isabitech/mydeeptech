import React, { useState } from 'react';
import { 
  Button, 
  Table, 
  Upload, 
  message, 
  Modal,
  Form,
  Input,
  Select,
  Card,
  Row,
  Col,
  Divider,
  Space,
  Typography,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  UploadOutlined, 
  PlusOutlined, 
  CreditCardOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  DollarOutlined,
  BankOutlined,
  FileExcelOutlined 
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import Papa from 'papaparse';
import paymentMutationService from '../../../../services/invoice-payment-service/invoice-payment-mutation';
import { BulkTransferPayloadSchema } from '../../../../validators/payment/payment-schema';

const { Text, Title } = Typography;
const { Option } = Select;

interface EmployeePayment {
  key: string;
  transferAmount: number;
  transferNote: string;
  transferReference: string;
  recipientCode?: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  recipientEmail?: string;
  recipientPhone?: string;
}

const EmployeeMgt: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeePayment[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeePayment | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { bulkPaymentMutate, bulkPaymentMutationIsPending } = paymentMutationService.useBulkInvoicePayment();

  // Bank options (Nigerian banks)
  const bankOptions = [
    { value: 'access-bank', label: 'Access Bank' },
    { value: 'guaranty-trust-bank', label: 'Guaranty Trust Bank (GTBank)' },
    { value: 'united-bank-for-africa', label: 'United Bank for Africa (UBA)' },
    { value: 'zenith-bank', label: 'Zenith Bank' },
    { value: 'first-bank', label: 'First Bank of Nigeria' },
    { value: 'polaris-bank', label: 'Polaris Bank' },
    { value: 'sterling-bank', label: 'Sterling Bank' },
    { value: 'providus-bank', label: 'Providus Bank' },
    { value: 'paycom', label: 'Paycom (Opay)' },
    { value: 'kredi-money-mfb', label: 'Kredi Money MFB' },
    { value: 'fidelity-bank', label: 'Fidelity Bank' },
    { value: 'unity-bank', label: 'Unity Bank' },
  ];

  // CSV Upload handling
  const uploadProps: UploadProps = {
    accept: '.csv',
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSV(text);
      };
      reader.readAsText(file);
      return false; // Prevent automatic upload
    },
    showUploadList: false,
  };

  const parseCSV = (csvText: string) => {
    try {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(), // Trim header names
        complete: (results) => {
          console.log('CSV Headers:', results.meta.fields); // Debug log
          console.log('First row data:', results.data[0]); // Debug log
          
          const parsedEmployees: EmployeePayment[] = results.data.map((row: any, index: number) => {
            // Try different variations of column names to handle spacing issues
            const accountName = row['Account Name'] || row['Account Name '] || '';
            const accountNumber = (row['Account Number'] || '')?.toString().replace(/["\s\t]/g, '').trim();
            const bankCode = (row['Bank Code or Slug'] || '').trim();
            
            return {
              key: `employee-${Date.now()}-${index}`,
              transferAmount: parseFloat(row['Transfer Amount']) || 0,
              transferNote: row['Transfer Note (Optional)'] || '',
              transferReference: row['Transfer Reference (Optional)'] || '',
              recipientCode: row['Recipient Code (This overrides all other details if available)'] || '',
              bankCode: bankCode,
              accountNumber: accountNumber,
              accountName: accountName.trim(),
              recipientEmail: '', // Will need to be filled manually if required
              recipientPhone: '', // Will need to be filled manually if required
            };
          });
          
          setEmployees(parsedEmployees);
          message.success(`Successfully imported ${parsedEmployees.length} employee records`);
        },
        error: (error: any) => {
          message.error('Failed to parse CSV file: ' + error.message);
        }
      });
    } catch (error: any) {
      message.error('Error processing CSV file: ' + error.message);
    }
  };

  // Calculate total amount
  const totalAmount = employees.reduce((sum, emp) => sum + emp.transferAmount, 0);

  // Table columns
  const columns: ColumnsType<EmployeePayment> = [
    {
      title: 'Employee Name',
      dataIndex: 'accountName',
      key: 'accountName',
      width: 180,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Bank',
      dataIndex: 'bankCode',
      key: 'bankCode',
      width: 150,
      render: (bankCode) => {
        const bank = bankOptions.find(b => b.value === bankCode);
        return bank ? bank.label : bankCode;
      },
    },
    {
      title: 'Account Number',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 140,
      render: (text) => <span className="font-mono">{text}</span>,
    },
    {
      title: 'Amount (₦)',
      dataIndex: 'transferAmount',
      key: 'transferAmount',
      width: 120,
      render: (amount) => (
        <Text strong className="text-green-600">
          ₦{amount.toLocaleString('en-NG')}
        </Text>
      ),
      sorter: (a, b) => a.transferAmount - b.transferAmount,
    },
    {
      title: 'Note',
      dataIndex: 'transferNote',
      key: 'transferNote',
      width: 200,
      render: (text) => (
        <Tooltip title={text}>
          <span className="truncate block max-w-[180px]">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditEmployee(record)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Popconfirm
              title="Delete employee?"
              description="Are you sure you want to remove this employee from the payout list?"
              onConfirm={() => handleDeleteEmployee(record.key)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle adding new employee
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle editing employee
  const handleEditEmployee = (employee: EmployeePayment) => {
    setEditingEmployee(employee);
    form.setFieldsValue(employee);
    setIsModalVisible(true);
  };

  // Handle deleting employee
  const handleDeleteEmployee = (key: string) => {
    setEmployees(prev => prev.filter(emp => emp.key !== key));
    message.success('Employee removed from payout list');
  };

  // Handle form submission
  const handleFormSubmit = (values: any) => {
    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => 
        emp.key === editingEmployee.key 
          ? { ...emp, ...values }
          : emp
      ));
      message.success('Employee updated successfully');
    } else {
      // Add new employee
      const newEmployee: EmployeePayment = {
        key: `employee-${Date.now()}`,
        ...values,
      };
      setEmployees(prev => [...prev, newEmployee]);
      message.success('Employee added to payout list');
    }
    
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle payout processing
  const handleProcessPayout = async () => {
    if (employees.length === 0) {
      message.error('Please add employees to the payout list first');
      return;
    }

    // Check if all required fields are present
    const missingData = employees.some(emp => 
      !emp.accountName || !emp.accountNumber || !emp.bankCode || !emp.transferAmount
    );

    if (missingData) {
      message.error('Please ensure all employees have complete information');
      return;
    }

    Modal.confirm({
      title: 'Confirm Payout',
      content: (
        <div>
          <p>You are about to process payout for <strong>{employees.length}</strong> employees.</p>
          <p>Total amount: <strong>₦{totalAmount.toLocaleString('en-NG')}</strong></p>
          <p>Are you sure you want to proceed?</p>
        </div>
      ),
      okText: 'Process Payout',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Transform employee data to match the API schema
          const transfers = employees.map(emp => ({
            invoiceId: emp.transferReference || `EMP-${emp.key}`,
            recipientName: emp.accountName,
            recipientEmail: emp.recipientEmail || 'employee@company.com', // Default email if not provided
            bankCode: emp.bankCode,
            accountNumber: emp.accountNumber,
            recipientPhone: emp.recipientPhone || '+2340000000000', // Default phone if not provided
          }));

          const payload: BulkTransferPayloadSchema = {
            transfers,
            currency: 'NGN',
            source: 'employee_payout',
            metadata: {
              initiated_from: 'employee_management',
              notes: `Employee payout for ${new Date().toLocaleDateString()} - ${employees.length} employees`,
              batch_name: `Employee_Payout_${new Date().getFullYear()}_${new Date().getMonth() + 1}`,
            },
          };

          await bulkPaymentMutate(payload);
          message.success('Payout processed successfully!');
          setEmployees([]); // Clear the list after successful payout
        } catch (error) {
          message.error('Failed to process payout. Please try again.');
          console.error('Payout error:', error);
        }
      },
    });
  };

  // Download CSV template
  const downloadTemplate = () => {
    const csvContent = `Transfer Amount,Transfer Note (Optional),Transfer Reference (Optional),Recipient Code (This overrides all other details if available),Bank Code or Slug,Account Number,Account Name
15000,MyDeepTech February 2026 Data Allowance,MYDEEPTECH019,,access-bank,1234567890,John Doe Employee
50000,MyDeepTech February 2026 Salary,MYDEEPTECH020,,guaranty-trust-bank,9876543210,Jane Smith`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_payout_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[gilroy-regular]">
      <div className="bg-white rounded-lg shadow-sm w-full p-6">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <Title level={2} className="!mb-2 !text-xl sm:!text-2xl lg:!text-3xl">
              <BankOutlined className="mr-2 sm:mr-3 text-blue-600 text-lg sm:text-xl lg:text-2xl" />
              <span className="text-base sm:text-xl lg:text-2xl">Employee Payout Management</span>
            </Title>
            <Text type="secondary" className="text-sm sm:text-base">
              Manage monthly employee payouts and allowances
            </Text>
          </div>
          <Space className='flex items-center flex-wrap lg:ml-auto'>
            <Button 
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
              title="Download CSV Template"
            >
              Template
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<FileExcelOutlined />} type="default">
                Import CSV
              </Button>
            </Upload>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddEmployee}
            >
              Add Employee
            </Button>
          </Space>
        </div>

        {/* Summary Cards */}
        <Row gutter={[24, 16]} className="my-6">
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card>
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <DollarOutlined className="text-blue-600 text-xl" />
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Total Amount</Text>
                  <div className="text-2xl font-bold text-gray-900">
                    ₦{totalAmount.toLocaleString('en-NG')}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} lg={8} xl={8}>
            <Card>
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <BankOutlined className="text-green-600 text-xl" />
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Employees</Text>
                  <div className="text-2xl font-bold text-gray-900">
                    {employees.length}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={24} lg={8} xl={8}>
            <Card>
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <CreditCardOutlined className="text-purple-600 text-xl" />
                </div>
                <div>
                  <Text type="secondary" className="text-sm">Currency</Text>
                  <div className="text-2xl font-bold text-gray-900">
                    NGN
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Payout Button */}
        {employees.length > 0 && (
          <div className="mb-6">
            <Button
              type="primary"
              size="large"
              icon={<CreditCardOutlined />}
              onClick={handleProcessPayout}
              loading={bulkPaymentMutationIsPending}
              className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700"
            >
              Process Payout (₦{totalAmount.toLocaleString('en-NG')})
            </Button>
          </div>
        )}

        <Divider />

        {/* Employees Table */}
        <Table
          columns={columns}
          dataSource={employees}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
          }}
          scroll={{ x: 800 }}
          className="border rounded-lg"
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <FileExcelOutlined className="text-gray-400 text-4xl mb-4" />
                <div className="text-gray-500 mb-2">No employees added yet</div>
                <Text type="secondary" className="text-sm">
                  Upload a CSV file or add employees manually to get started
                </Text>
              </div>
            ),
          }}
        />

        {/* Add/Edit Employee Modal */}
        <Modal
          title={editingEmployee ? 'Edit Employee' : 'Add Employee'}
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFormSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="accountName"
                  label="Employee Name"
                  rules={[{ required: true, message: 'Please enter employee name' }]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="transferAmount"
                  label="Amount (₦)"
                  rules={[{ required: true, message: 'Please enter amount' }]}
                >
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    prefix="₦"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="bankCode"
                  label="Bank"
                  rules={[{ required: true, message: 'Please select bank' }]}
                >
                  <Select placeholder="Select bank">
                    {bankOptions.map(bank => (
                      <Option key={bank.value} value={bank.value}>
                        {bank.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="accountNumber"
                  label="Account Number"
                  rules={[{ required: true, message: 'Please enter account number' }]}
                >
                  <Input placeholder="Enter account number" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="transferNote"
              label="Transfer Note"
            >
              <Input.TextArea 
                placeholder="e.g., MyDeepTech February 2026 Salary"
                rows={3}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="recipientEmail"
                  label="Email (Optional)"
                  rules={[{ type: 'email', message: 'Please enter valid email' }]}
                >
                  <Input placeholder="employee@company.com" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="recipientPhone"
                  label="Phone (Optional)"
                >
                  <Input placeholder="+234XXXXXXXXXX" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="transferReference"
              label="Reference (Optional)"
            >
              <Input placeholder="e.g., MYDEEPTECH001" />
            </Form.Item>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeeMgt;