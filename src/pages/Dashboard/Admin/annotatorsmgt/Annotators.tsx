import { useState, useEffect } from "react";
import { Tabs, Badge, Button, Modal } from "antd";
import AllAnnotators from "./AllAnnotators";
import ApprovedAnnotators from "./ApprovedAnnotators";
import MicroTasker from "./MicroTasker";
import PendingAnnotators from "./PendingAnnotators";
import SubmittedAnnotators from "./SubmittedAnnotators";
import QAAnnotators from "./QAAnnotators";
import { annotatorsQueryService } from "../../../../services/annotators-service";
import AnnotatorsDomain from "./AnnotatorsDomain";
import AnnotatorsByCountry from "./AnnotatorsByCountry";
import DomainModal from "../../../../components/DomainModal/DomainModal";
import { useDomainActions } from "../../../../store/useDomainStore";
import DomainTable from "../../../../components/DomainModal/DomainTable";

const Annotators = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [showCaModal, setShowCaModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    microtasker: 0,
    pending: 0,
    submitted: 0,
    qa: 0,
  });

  const { setOpenDomainModal } = useDomainActions();
  
  // Use TanStack Query hook to fetch summary data for counts
  const { summary } = annotatorsQueryService.useGetDTUsersSummary();

  // Update counts when summary changes
  useEffect(() => {
    if (summary?.statusBreakdown) {
      setCounts({
        total: summary.totalUsers || 0,
        approved: summary.statusBreakdown.approved || 0,
        microtasker: summary.statusBreakdown.rejected || 0, // Assuming rejected users are microtaskers
        pending: summary.statusBreakdown.pending || 0,
        submitted: summary.statusBreakdown.submitted || 0,
        qa: summary.qaBreakdown?.approved || 0, // Add QA count from qaBreakdown
      });
    }
  }, [summary]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[gilroy-regular]">
      {/* Header Component */}
      {/* <Header title="Annotators Management" /> */}

      <div className=" w-full">
        <div className="bg-white rounded-lg shadow-sm w-full">
          <div className="p-6">
            <div className="flex justify-between flex-wrap gap-3 items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Annotators Management
              </h1>

              <Button
                type="primary"
                onClick={() => setOpenDomainModal(true)}>
                Create Domains
              </Button>
            </div>
            {/* Tabs for different annotator views */}
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              className="w-full"
              tabBarStyle={{ borderBottom: "1px solid #e5e7eb" }}
              items={[
                {
                  key: "1",
                  label: (
                    <div className="flex items-center gap-2">
                      <span>All Annotators</span>
                      <Badge
                        count={counts.total}
                        style={{
                          backgroundColor: '#1890ff',
                          color: 'white',
                          fontSize: '12px',
                          minWidth: '20px',
                          height: '20px',
                          lineHeight: '20px',
                          padding: '0 6px',
                          borderRadius: '10px'
                        }}
                      />
                    </div>
                  ),
                  children: (
                    <div className="pt-4">
                      <div className="mb-6">
                        <AnnotatorsByCountry 
                          selectedCountry={selectedCountry}
                          onCountryChange={handleCountryChange}
                        />
                      </div>
                      <AllAnnotators countryFilter={selectedCountry} />
                    </div>
                  )
                },
                {
                  key: "2",
                  label: (
                    <div className="flex items-center gap-2">
                      <span>Approved Annotators</span>
                      <Badge
                        count={counts.approved}
                        style={{
                          backgroundColor: '#52c41a',
                          color: 'white',
                          fontSize: '12px',
                          minWidth: '20px',
                          height: '20px',
                          lineHeight: '20px',
                          padding: '0 6px',
                          borderRadius: '10px'
                        }}
                      />
                    </div>
                  ),
                  children: (
                    <div className="pt-4">
                      <ApprovedAnnotators />
                    </div>
                  )
                },
                {
                  key: "3",
                  label: (
                    <div className="flex items-center gap-2">
                      <span>MicroTasker</span>
                      <Badge
                        count={counts.microtasker}
                        style={{
                          backgroundColor: '#722ed1',
                          color: 'white',
                          fontSize: '12px',
                          minWidth: '20px',
                          height: '20px',
                          lineHeight: '20px',
                          padding: '0 6px',
                          borderRadius: '10px'
                        }}
                      />
                    </div>
                  ),
                  children: (
                    <div className="pt-4">
                      <MicroTasker />
                    </div>
                  )
                },
                {
                  key: "4",
                  label: (
                    <div className="flex items-center gap-2">
                      <span>QA Annotators</span>
                      <Badge
                        count={counts.qa}
                        style={{
                          backgroundColor: '#1890ff',
                          color: 'white',
                          fontSize: '12px',
                          minWidth: '20px',
                          height: '20px',
                          lineHeight: '20px',
                          padding: '0 6px',
                          borderRadius: '10px'
                        }}
                      />
                    </div>
                  ),
                  children: (
                    <div className="pt-4">
                      <QAAnnotators />
                    </div>
                  )
                },
                {
                  key: "5",
                  label: (
                    <div className="flex items-center gap-2">
                      <span>Pending Annotators</span>
                      <Badge
                        count={counts.pending}
                        style={{
                          backgroundColor: '#fa8c16',
                          color: 'white',
                          fontSize: '12px',
                          minWidth: '20px',
                          height: '20px',
                          lineHeight: '20px',
                          padding: '0 6px',
                          borderRadius: '10px'
                        }}
                      />
                    </div>
                  ),
                  children: (
                    <div className="pt-4">
                      <PendingAnnotators />
                    </div>
                  )
                },
                {
                  key: "6",
                  label: (
                    <div className="flex items-center gap-2">
                      <span>Submitted Annotators</span>
                      <Badge
                        count={counts.submitted}
                        style={{
                          backgroundColor: '#13c2c2',
                          color: 'white',
                          fontSize: '12px',
                          minWidth: '20px',
                          height: '20px',
                          lineHeight: '20px',
                          padding: '0 6px',
                          borderRadius: '10px'
                        }}
                      />
                    </div>
                  ),
                  children: (
                    <div className="pt-4">
                      <SubmittedAnnotators />
                    </div>
                  )
                },
                {
                  key: "7",
                  label: (
                    <div className="flex items-center gap-2">
                      <span>Domain Overview</span>
                    </div>
                  ),
                  children: (
                    <div className="pt-4">
                      <DomainTable />
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      </div>

      <DomainModal />
      <Modal
        title="Create Domains"
        open={showCaModal}
        onCancel={() => setShowCaModal(false)}
        footer={null}
        width={800}
        destroyOnHidden
      >
        <AnnotatorsDomain />
      </Modal>
    </div>
  );
};

export default Annotators;