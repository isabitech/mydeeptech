import { useEffect } from "react";
import { Table, Spin, Alert, Descriptions, Card, Modal, Image, Tag, Button } from "antd";
import { annotatorsQueryService } from "../../../../services/annotators-service";
import PageModal from "../../../../components/Modal/PageModal";
import { 
  AnnotatorFilters, 
  StatusTag, 
  ActionButtons, 
  createAnnotatorTableColumns 
} from "./components";
import { 
  useAnnotatorFilters, 
  useAnnotatorModals, 
  useAnnotatorActions 
} from "./hooks";
import { getErrorMessage } from "../../../../service/apiUtils";

interface AllAnnotatorsProps {
  countryFilter: string;
}

const AllAnnotators = ({ countryFilter }: AllAnnotatorsProps) => {
  // Use custom hooks for separation of concerns
  const filters = useAnnotatorFilters({ countryFilter });
  const modals = useAnnotatorModals();
  
  // Use TanStack Query hook for data fetching
  const {
    users,
    pagination,
    isLoading: loading,
    isError,
    error: queryError,
    refetch
  } = annotatorsQueryService.useGetAllDTUsers(filters.queryParams);

  // Convert query error to string for compatibility
  const error = queryError ? (getErrorMessage(queryError) || 'Failed to fetch annotators') : null;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => filters.cleanup();
  }, [filters]);

  // Action handlers with auto-refresh and modal closing
  const actions = useAnnotatorActions({
    selectedAnnotator: modals.selectedAnnotator,
    onActionComplete: () => {
      refetch();
      modals.closeAllModals();
    }
  });

  // Handle refresh with filter reset
  const handleRefresh = () => {
    filters.resetFilters();
    refetch();
  };

  // Create table columns with handlers
  const columns = createAnnotatorTableColumns({
    onViewDetails: modals.handleViewDetails,
    onViewResult: modals.handleViewResult
  });

  // Error state
  if (isError && error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          action={
            <Button size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          closable
          onClose={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="p-4">
      <AnnotatorFilters
        searchTerm={filters.searchTerm}
        statusFilter={filters.statusFilter}
        loading={loading}
        onSearchChange={filters.handleSearchChange}
        onSearch={filters.handleSearch}
        onStatusFilterChange={filters.handleStatusFilter}
        onRefresh={handleRefresh}
      />

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users || []}
          rowKey="_id"
          pagination={{
            current: pagination?.currentPage || filters.currentPage,
            pageSize: pagination?.usersPerPage || filters.pageSize,
            total: pagination?.totalUsers || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ['bottomCenter'],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            onChange: filters.handlePagination
          }}
          scroll={{ x: "max-content" }}
        />
      </Spin>

      {/* Annotator Details Modal */}
      <PageModal
        openModal={modals.isModalOpen}
        onCancel={modals.handleCloseModal}
        closable={true}
        className="annotator-details-modal"
        modalwidth="800px"
      >
        {modals.selectedAnnotator && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Annotator Details</h2>
              <div className="flex gap-2">
                <StatusTag status={modals.selectedAnnotator.annotatorStatus || ''} type="annotator" />
                <StatusTag status={modals.selectedAnnotator.microTaskerStatus || ''} type="annotator" />
                <StatusTag status={modals.selectedAnnotator.qaStatus || ''} type="qa" />
              </div>
            </div>

            <Card className="mb-6">
              <Descriptions title="Personal Information" bordered column={2}>
                <Descriptions.Item label="Full Name">{modals.selectedAnnotator.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">{modals.selectedAnnotator.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{modals.selectedAnnotator.phone}</Descriptions.Item>
                <Descriptions.Item label="Country">{modals.selectedAnnotator.personal_info?.country || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Time Zone">{modals.selectedAnnotator.personal_info?.time_zone?.toString() || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Available Hours/Week">{modals.selectedAnnotator.personal_info?.available_hours_per_week?.toString() || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Email Verified" span={2}>
                  <StatusTag 
                    status={(modals.selectedAnnotator.isEmailVerified ?? false).toString()} 
                    type="boolean" 
                    trueLabel="VERIFIED" 
                    falseLabel="UNVERIFIED" 
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-6">
              <Descriptions title="Professional Background" bordered column={2}>
                <Descriptions.Item label="Education Field">{modals.selectedAnnotator.professional_background?.education_field || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Years of Experience">{modals.selectedAnnotator.professional_background?.years_of_experience || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Primary Language">{modals.selectedAnnotator.language_proficiency?.primary_language || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="English Fluency">{modals.selectedAnnotator.language_proficiency?.english_fluency_level || 'N/A'}</Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-6">
              <Descriptions title="Domains & Skills" bordered column={1}>
                <Descriptions.Item label="Domains">
                  <div>
                    {/* Prioritize userDomains over legacy domains */}
                    {(modals.selectedAnnotator.userDomains && modals.selectedAnnotator.userDomains.length > 0 
                      ? modals.selectedAnnotator.userDomains.map((ud: unknown) => (ud as { name: string }).name)
                      : modals.selectedAnnotator.domains || []
                    )?.map((domain: string, index: number) => (
                      <Tag key={index} color="blue">{domain}</Tag>
                    ))}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Assessment Result">
                  {modals.selectedAnnotator.resultLink ? (
                    <a href={modals.selectedAnnotator.resultLink} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      View Assessment Result
                    </a>
                  ) : (
                    <span className="text-gray-500">No Result Available</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <ActionButtons
              selectedAnnotator={modals.selectedAnnotator}
              updateLoading={actions.updateLoading}
              qaLoading={actions.qaLoading}
              onApprove={actions.handleApprove}
              onReject={actions.handleReject}
              onElevateToQA={actions.handleElevateToQA}
              onRemoveFromQA={actions.handleRemoveFromQA}
              layout="vertical"
            />
          </div>
        )}
      </PageModal>

      {/* Image Result Modal */}
      <Modal
        title="Assessment Result"
        open={modals.isResultModalOpen}
        onCancel={modals.handleCloseResultModal}
        footer={null}
        width={800}
        centered
      >
        {modals.selectedAnnotator && (
          <div>
            <Image
              src={modals.selectedAnnotator.resultLink}
              alt="Assessment Result"
              style={{ width: '100%' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <ActionButtons
                selectedAnnotator={modals.selectedAnnotator}
                updateLoading={actions.updateLoading}
                qaLoading={actions.qaLoading}
                onApprove={actions.handleApprove}
                onReject={actions.handleReject}
                onElevateToQA={actions.handleElevateToQA}
                onRemoveFromQA={actions.handleRemoveFromQA}
                layout="horizontal"
                size="large"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AllAnnotators;