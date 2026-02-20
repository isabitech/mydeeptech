
import { useState, useEffect } from "react";
import { Tabs, Badge, Button, Modal } from "antd";
import Header from "../../User/Header";
import AllAnnotators from "./AllAnnotators";
import ApprovedAnnotators from "./ApprovedAnnotators";
import MicroTasker from "./MicroTasker";
import PendingAnnotators from "./PendingAnnotators";
import SubmittedAnnotators from "./SubmittedAnnotators";
import QAAnnotators from "./QAAnnotators";
import { useGetAllDtUsers } from "../../../../hooks/Auth/Admin/Annotators/useGetAllDtUsers";
import AnnotatorsDomain from "./AnnotatorsDomain";


const { TabPane } = Tabs;

const Annotators = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [showCaModal, setShowCaModal] = useState(false);
  const [counts, setCounts] = useState({
    total: 0,
    approved: 0,
    microtasker: 0,
    pending: 0,
    submitted: 0,
    qa: 0,
  });

  const { getAllDTUsers, summary, loading } = useGetAllDtUsers();

  // Fetch counts when component mounts
  useEffect(() => {
    fetchCounts();
  }, []);

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

  const fetchCounts = async () => {
    await getAllDTUsers({ page: 1, limit: 1 }); // Minimal fetch just to get summary
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[gilroy-regular]">
      {/* Header Component */}
      {/* <Header title="Annotators Management" /> */}

      <div className=" w-full">
        <div className="bg-white rounded-lg shadow-sm w-full">
          <div className="p-6">
            <div className=" flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Annotators Management</h1>
            <Button
             onClick={() => setShowCaModal(true)}

            className="border-2 px-6 py-5 text-gray-900 border-black font-bold">Add Domains</Button>
            </div>
            {/* Tabs for different annotator views */}
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              className="w-full"
              tabBarStyle={{ borderBottom: "1px solid #e5e7eb" }}
            >
              <TabPane
                tab={
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
                }
                key="1"
              >
                <div className="pt-4">
                  <AllAnnotators />
                </div>
              </TabPane>

              <TabPane
                tab={
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
                }
                key="2"
              >
                <div className="pt-4">
                  <ApprovedAnnotators />
                </div>
              </TabPane>

              <TabPane
                tab={
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
                }
                key="3"
              >
                <div className="pt-4">
                  <MicroTasker />
                </div>
              </TabPane>

              <TabPane
                tab={
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
                }
                key="4"
              >
                <div className="pt-4">
                  <QAAnnotators />
                </div>
              </TabPane>

              <TabPane
                tab={
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
                }
                key="5"
              >
                <div className="pt-4">
                  <PendingAnnotators />
                </div>
              </TabPane>

              <TabPane
                tab={
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
                }
                key="6"
              >
                <div className="pt-4">
                  <SubmittedAnnotators />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
                

        <Modal
          title="Pick your Domain"
          open={showCaModal}
          onCancel={() => setShowCaModal(false)}
          footer={null}
          width={800}
          destroyOnClose
          >
            <AnnotatorsDomain/>
          </Modal>
    </div>
  );
};

export default Annotators;