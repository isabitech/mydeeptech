import { Space, Input, Select, Button } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";
import { STATUS_FILTER_OPTIONS } from "../constants";

const { Search } = Input;
const { Option } = Select;

interface AnnotatorFiltersProps {
  searchTerm: string;
  statusFilter: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onRefresh: () => void;
}

const AnnotatorFilters = ({
  searchTerm,
  statusFilter,
  loading,
  onSearchChange,
  onSearch,
  onStatusFilterChange,
  onRefresh
}: AnnotatorFiltersProps) => {
  return (
    <div className="mb-4">
      <Space size="middle" wrap>
        <Search
          placeholder="Search by name or email"
          allowClear
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onSearch={onSearch}
          style={{ width: 300 }}
          prefix={<SearchOutlined />}
        />

        <Select
          value={statusFilter}
          onChange={onStatusFilterChange}
          style={{ width: 150 }}
        >
          {STATUS_FILTER_OPTIONS.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          Refresh
        </Button>
      </Space>
    </div>
  );
};

export default AnnotatorFilters;