import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Typography, 
  Space, 
  Button, 
  Modal, 
  Statistic, 
  Row, 
  Col, 
  Select, 
  Input,
  Spin,
  Avatar,
  Tooltip
} from 'antd';
import { 
  EyeOutlined,
  UserOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useAdminAssessmentSystem, AdminAssessmentRecord, AdminAssessmentStatistics } from '../../../hooks/Auth/Admin/useAdminAssessmentSystem';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const AdminAssessmentManagement: React.FC = () => {
  const [assessments, setAssessments] = useState<AdminAssessmentRecord[]>([]);
  const [statistics, setStatistics] = useState<AdminAssessmentStatistics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [assessmentTypeFilter, setAssessmentTypeFilter] = useState<string | undefined>();
  const [selectedAssessment, setSelectedAssessment] = useState<AdminAssessmentRecord | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  const { getAdminAssessments, exportAssessments, loading } = useAdminAssessmentSystem();

  // Load admin assessments from API
  const loadAdminAssessments = async (page = 1, filters: any = {}) => {
    try {
      const result = await getAdminAssessments({
        page,
        limit: 10,
        search: filters.search,
        passed: filters.passed,
        assessmentType: filters.assessmentType
      });

      if (result.success && result.data) {
        setAssessments(result.data.assessments || []);
        setStatistics(result.data.statistics);
        setTotalCount(result.data.pagination?.totalCount || 0);
      }
    } catch (error) {
      console.error('Error loading admin assessments:', error);
    }
  };

  useEffect(() => {
    loadAdminAssessments(currentPage, {
      search: searchTerm,
      passed: statusFilter,
      assessmentType: assessmentTypeFilter
    });
  }, [currentPage, searchTerm, statusFilter, assessmentTypeFilter]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === 'all' ? undefined : value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setAssessmentTypeFilter(value === 'all' ? undefined : value);
    setCurrentPage(1);
  };

  // Show assessment details
  const showDetails = (assessment: AdminAssessmentRecord) => {
    setSelectedAssessment(assessment);
    setDetailsModalVisible(true);
  };

  // Export assessments
  const handleExport = async () => {
    try {
      const result = await exportAssessments({
        search: searchTerm,
        passed: statusFilter === 'all' ? undefined : statusFilter === 'true',
        assessmentType: assessmentTypeFilter === 'all' ? undefined : assessmentTypeFilter
      }, 'csv');

      if (result.success && result.data) {
        // Create download link
        const url = window.URL.createObjectURL(result.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `assessments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting assessments:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Table columns
  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: AdminAssessmentRecord) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong className="font-[gilroy-regular]">
              {record.userId.fullName}
            </Text>
            <br />
            <Text className="text-gray-500 text-sm font-[gilroy-regular]">
              {record.userId.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Assessment Type',
      dataIndex: 'assessmentType',
      key: 'assessmentType',
      render: (type: string) => (
        <Text className="font-[gilroy-regular] capitalize">
          {type.replace('_', ' ')}
        </Text>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'scorePercentage',
      key: 'scorePercentage',
      render: (score: number) => (
        <Tag color={score >= 60 ? 'success' : 'error'} className="font-[gilroy-regular]">
          {score}%
        </Tag>
      ),
      sorter: (a: AdminAssessmentRecord, b: AdminAssessmentRecord) => 
        a.scorePercentage - b.scorePercentage,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: AdminAssessmentRecord) => (
        <Space direction="vertical" size="small">
          <Tag 
            color={getStatusColor(record.userId.annotatorStatus)}
            className="font-[gilroy-regular]"
          >
            Annotator: {record.userId.annotatorStatus}
          </Tag>
          <Tag 
            color={getStatusColor(record.userId.microTaskerStatus)}
            className="font-[gilroy-regular]"
          >
            Micro: {record.userId.microTaskerStatus}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Attempt',
      dataIndex: 'attemptNumber',
      key: 'attemptNumber',
      render: (attempt: number) => (
        <Tag color="blue" className="font-[gilroy-regular]">
          #{attempt}
        </Tag>
      ),
    },
    {
      title: 'Time Spent',
      dataIndex: 'timeSpentMinutes',
      key: 'timeSpentMinutes',
      render: (minutes: number) => (
        <Text className="font-[gilroy-regular]">
          <ClockCircleOutlined className="mr-1" />
          {minutes}m
        </Text>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => formatDate(date),
      sorter: (a: AdminAssessmentRecord, b: AdminAssessmentRecord) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AdminAssessmentRecord) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetails(record)}
          className="font-[gilroy-regular]"
        >
          View Details
        </Button>
      ),
    },
  ];

  // Render statistics cards
  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Total Assessments"
              value={statistics.totalAssessments}
              valueStyle={{ color: '#F6921E', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Pass Rate"
              value={statistics.passRate}
              suffix="%"
              valueStyle={{ color: '#52c41a', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Average Score"
              value={statistics.averageScore}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center shadow-md border-0 rounded-xl">
            <Statistic
              title="Unique Users"
              value={statistics.uniqueUserCount}
              valueStyle={{ color: '#722ed1', fontFamily: 'gilroy-regular' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
            Assessment Management
          </Title>
          <Text className="text-gray-600 font-[gilroy-regular]">
            Monitor and manage user assessments
          </Text>
        </div>
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleExport}
            className="font-[gilroy-regular]"
          >
            Export
          </Button>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => loadAdminAssessments(currentPage)}
            className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] hover:border-[#e5831c] font-[gilroy-regular]"
          >
            Refresh
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      {renderStatistics()}

      {/* Filters */}
      <Card className="mb-6 shadow-md border-0 rounded-xl">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search by user name or email"
              allowClear
              onSearch={handleSearch}
              className="font-[gilroy-regular]"
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by status"
              allowClear
              onChange={handleStatusFilter}
              className="w-full font-[gilroy-regular]"
            >
              <Option value="all">All Status</Option>
              <Option value="true">Passed</Option>
              <Option value="false">Failed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Filter by type"
              allowClear
              onChange={handleTypeFilter}
              className="w-full font-[gilroy-regular]"
            >
              <Option value="all">All Types</Option>
              <Option value="annotator_qualification">Annotator Qualification</Option>
              <Option value="micro_tasker_qualification">Micro Tasker</Option>
            </Select>
          </Col>
          <Col xs={24} sm={4}>
            <Tooltip title="Apply Filters">
              <Button 
                icon={<FilterOutlined />} 
                className="font-[gilroy-regular]"
              >
                Filter
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {/* Assessment Table */}
      <Card className="shadow-xl border-0 rounded-xl">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={assessments}
            rowKey="_id"
            pagination={{
              current: currentPage,
              total: totalCount,
              pageSize: 10,
              onChange: setCurrentPage,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} assessments`,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            className="font-[gilroy-regular]"
            scroll={{ x: 1200 }}
          />
        </Spin>
      </Card>

      {/* Assessment Details Modal */}
      <Modal
        title={
          <span className="text-[#333333] font-[gilroy-regular] text-lg">
            Assessment Details
          </span>
        }
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={800}
        className="font-[gilroy-regular]"
      >
        {selectedAssessment && (
          <div>
            {/* User Information */}
            <Card size="small" className="mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Space>
                    <Avatar size={48} icon={<UserOutlined />} />
                    <div>
                      <Text strong className="font-[gilroy-regular]">
                        {selectedAssessment.userId.fullName}
                      </Text>
                      <br />
                      <Text className="text-gray-500 font-[gilroy-regular]">
                        {selectedAssessment.userId.email}
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space direction="vertical">
                    <Tag 
                      color={getStatusColor(selectedAssessment.userId.annotatorStatus)}
                      className="font-[gilroy-regular]"
                    >
                      Annotator: {selectedAssessment.userId.annotatorStatus}
                    </Tag>
                    <Tag 
                      color={getStatusColor(selectedAssessment.userId.microTaskerStatus)}
                      className="font-[gilroy-regular]"
                    >
                      Micro Tasker: {selectedAssessment.userId.microTaskerStatus}
                    </Tag>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Assessment Summary */}
            <Row gutter={16}>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Score"
                    value={selectedAssessment.scorePercentage}
                    suffix="%"
                    valueStyle={{ 
                      color: selectedAssessment.passed ? '#52c41a' : '#ff4d4f',
                      fontFamily: 'gilroy-regular' 
                    }}
                    prefix={selectedAssessment.passed ? 
                      <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    }
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Time Spent"
                    value={selectedAssessment.timeSpentMinutes}
                    suffix="min"
                    valueStyle={{ fontFamily: 'gilroy-regular' }}
                    prefix={<ClockCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="Attempt Number"
                    value={selectedAssessment.attemptNumber}
                    valueStyle={{ fontFamily: 'gilroy-regular' }}
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAssessmentManagement;