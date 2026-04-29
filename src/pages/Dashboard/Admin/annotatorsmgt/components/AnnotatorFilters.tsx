import { Space, Input, Select, Button } from "antd";
import { SearchOutlined, ReloadOutlined, GlobalOutlined } from "@ant-design/icons";
import { STATUS_FILTER_OPTIONS } from "../constants";
import languagesData from "../../../../../data/languages.json";
import "../../../../../components/LanguageSelect/LanguageSelect.css";

const { Search } = Input;
const { Option } = Select;

interface AnnotatorFiltersProps {
  searchTerm: string;
  statusFilter: string;
  languageFilter?: string;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onLanguageFilterChange?: (value: string) => void;
  onRefresh: () => void;
}

const AnnotatorFilters = ({
  searchTerm,
  statusFilter,
  languageFilter,
  loading,
  onSearchChange,
  onSearch,
  onStatusFilterChange,
  onLanguageFilterChange,
  onRefresh
}: AnnotatorFiltersProps) => {
  // Create language options for filtering
  const languageOptions = [
    { value: "all", label: "All Languages" },
    ...languagesData.languages.map(lang => ({
      value: lang.code,
      label: `${lang.name} (${lang.native})`
    }))
  ];

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

        {onLanguageFilterChange && (
          <Select
            value={languageFilter || "all"}
            onChange={onLanguageFilterChange}
            style={{ width: 200 }}
            placeholder="Filter by language"
            showSearch
            filterOption={(input, option) =>
              (option?.children ?? '').toString().toLowerCase().includes(input.toLowerCase())
            }
          >
            {languageOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.value === "all" ? (
                  <>
                    <GlobalOutlined /> {option.label}
                  </>
                ) : (
                  option.label
                )}
              </Option>
            ))}
          </Select>
        )}

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