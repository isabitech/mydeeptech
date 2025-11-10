
import { useState } from "react";
import { Tabs } from "antd";
import Header from "../../User/Header";
import AllAnnotators from "./AllAnnotators";
import ApprovedAnnotators from "./ApprovedAnnotators";
import MicroTasker from "./MicroTasker";
import PendingAnnotators from "./PendingAnnotators";
import SubmittedAnnotators from "./SubmittedAnnotators";

const { TabPane } = Tabs;

const Annotators = () => {
  const [activeTab, setActiveTab] = useState("1");

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[gilroy-regular]">
      {/* Header Component */}
      <Header title="Annotators Management" />
      
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Annotators Management</h1>
            
            {/* Tabs for different annotator views */}
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              className="w-full"
              tabBarStyle={{ borderBottom: "1px solid #e5e7eb" }}
            >
              <TabPane tab="All Annotators" key="1">
                <div className="pt-4">
                  <AllAnnotators />
                </div>
              </TabPane>
              
              <TabPane tab="Approved Annotators" key="2">
                <div className="pt-4">
                  <ApprovedAnnotators />
                </div>
              </TabPane>
              
              <TabPane tab="MicroTasker" key="3">
                <div className="pt-4">
                  <MicroTasker />
                </div>
              </TabPane>

               <TabPane tab="Pending Annotators" key="4">
                <div className="pt-4">
                  <PendingAnnotators />
                </div>
              </TabPane>
              
              <TabPane tab="Submitted Annotators" key="5">
                <div className="pt-4">
                  <SubmittedAnnotators />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Annotators;