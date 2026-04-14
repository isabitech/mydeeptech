import { useState, useEffect } from "react";
import { Card, Select, Spin, Alert, Badge, Button } from "antd";
import { GlobalOutlined, UserOutlined, ReloadOutlined } from "@ant-design/icons";
import { useGetAllDtUsers, DTUser } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";

const { Option } = Select;

interface CountryStats {
  country: string;
  total: number;
  approved: number;
  pending: number;
  submitted: number;
  rejected: number;
  qa: number;
}

interface AnnotatorsByCountryProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
}

const AnnotatorsByCountry = ({ selectedCountry, onCountryChange }: AnnotatorsByCountryProps) => {
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DTUser[]>([]);

  const {
    getAllDTUsers,
    loading,
    error,
    users,
    resetState
  } = useGetAllDtUsers();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      calculateCountryStats();
      filterUsersByCountry();
    }
  }, [users, selectedCountry]);

  const fetchAllUsers = async () => {
    // Fetch all users with a large limit to get complete data for stats - no country filter here since we need all countries
    await getAllDTUsers({ page: 1, limit: 10000 });
  };

  const calculateCountryStats = () => {
    const stats: { [key: string]: CountryStats } = {};

    users.forEach((user) => {
      const country = user.personal_info?.country || "Unknown";
      
      if (!stats[country]) {
        stats[country] = {
          country,
          total: 0,
          approved: 0,
          pending: 0,
          submitted: 0,
          rejected: 0,
          qa: 0,
        };
      }

      stats[country].total += 1;

      // Count by annotator status
      switch (user.annotatorStatus?.toLowerCase()) {
        case "approved":
          stats[country].approved += 1;
          break;
        case "pending":
          stats[country].pending += 1;
          break;
        case "submitted":
          stats[country].submitted += 1;
          break;
        case "rejected":
          stats[country].rejected += 1;
          break;
      }

      // Count QA status
      if (user.qaStatus?.toLowerCase() === "approved") {
        stats[country].qa += 1;
      }
    });

    // Sort by total count descending
    const sortedStats = Object.values(stats).sort((a, b) => b.total - a.total);
    setCountryStats(sortedStats);
  };

  const filterUsersByCountry = () => {
    if (selectedCountry === "all") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) => user.personal_info?.country === selectedCountry
      );
      setFilteredUsers(filtered);
    }
  };

  const handleCountryChange = (country: string) => {
    onCountryChange(country);
  };

  const handleRefresh = () => {
    resetState();
    onCountryChange("all");
    fetchAllUsers();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "#52c41a";
      case "pending": return "#fa8c16";
      case "submitted": return "#13c2c2";
      case "rejected": return "#f5222d";
      case "qa": return "#1890ff";
      default: return "#d9d9d9";
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
          <span className="ml-3">Loading country statistics...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Country Data"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with filter controls */}
      <Card className="w-full">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <GlobalOutlined className="text-xl text-blue-500" />
            <h3 className="text-lg font-semibold m-0">Annotators by Country</h3>
            <Badge 
              count={selectedCountry === "all" ? users.length : filteredUsers.length} 
              overflowCount={9999}
              style={{ backgroundColor: '#1890ff' }} 
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select
              value={selectedCountry}
              onChange={handleCountryChange}
              style={{ width: 200 }}
              placeholder="Filter by country"
            >
              <Option value="all">All Countries</Option>
              {countryStats.map((stat) => (
                <Option key={stat.country} value={stat.country}>
                  {stat.country} ({stat.total})
                </Option>
              ))}
            </Select>
            
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {/* Country statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {countryStats.map((stat) => (
          <Card
            key={stat.country}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedCountry === stat.country ? 'border-blue-500 shadow-md' : 'border-gray-200'
            }`}
            onClick={() => handleCountryChange(stat.country)}
            size="small"
          >
            <div className="space-y-3">
              {/* Country Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1 capitalize">{stat.country}</h4>
                  <div className="flex items-center gap-1 text-gray-500">
                    <UserOutlined className="text-sm" />
                    <span className="text-lg font-bold">{stat.total}</span>
                    <span className="text-sm">total</span>
                  </div>
                </div>
                <Badge
                  count={stat.total}
                  overflowCount={9999}
                  style={{
                    backgroundColor: selectedCountry === stat.country ? '#1890ff' : '#f0f0f0',
                    color: selectedCountry === stat.country ? 'white' : '#666'
                  }}
                />
              </div>

              {/* Status breakdown */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Approved:</span>
                    <Badge
                      count={stat.approved}
                      overflowCount={9999}
                      style={{ backgroundColor: getStatusColor("approved"), fontSize: '10px' }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Pending:</span>
                    <Badge
                      count={stat.pending}
                      overflowCount={9999}
                      style={{ backgroundColor: getStatusColor("pending"), fontSize: '10px' }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Submitted:</span>
                    <Badge
                      count={stat.submitted}
                      overflowCount={9999}
                      style={{ backgroundColor: getStatusColor("submitted"), fontSize: '10px' }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>Rejected:</span>
                    <Badge
                      count={stat.rejected}
                      overflowCount={9999}
                      style={{ backgroundColor: getStatusColor("rejected"), fontSize: '10px' }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>QA:</span>
                    <Badge
                      count={stat.qa}
                      overflowCount={9999}
                      style={{ backgroundColor: getStatusColor("qa"), fontSize: '10px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnnotatorsByCountry;