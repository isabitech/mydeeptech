import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  CodeSandboxOutlined,
  LogoutOutlined,
  WalletOutlined,
  BookOutlined,
  MenuOutlined,
  CloseOutlined,
  LockOutlined,
  HistoryOutlined,
  CustomerServiceOutlined,
  PlayCircleOutlined,
  UnorderedListOutlined as AssessmentListOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/deeptech.png";
import { useState, useEffect } from "react";
import PageModal from "../../../components/Modal/PageModal";
import { Button } from "antd";
import { retrieveUserInfoFromStorage } from "../../../helpers";

const Sidebar = () => {
  const [openModal, setOpenModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // for mobile toggle
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // Load user info on component mount
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const result = await retrieveUserInfoFromStorage();
        setUserInfo(result);
      } catch (error) {
        console.error("Failed to load user info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  // Base menu items
  const baseMenuItems = [
    { key: "overview", label: "Overview", icon: <HomeOutlined />, path: "/dashboard/overview" },
    { key: "assessment", label: "Assessment", icon: <BookOutlined />, path: "/dashboard/assessment" },
    { key: "assessment-history", label: "Assessment History", icon: <HistoryOutlined />, path: "/dashboard/assessment-history" },
    { key: "projects", label: "Projects", icon: <CodeSandboxOutlined />, path: "/dashboard/projects" },
    // { key: "jobs", label: "Jobs", icon: <InboxOutlined />, path: "/dashboard/jobs" },
    // { key: "tasks", label: "Tasks", icon: <UnorderedListOutlined />, path: "/dashboard/tasks" },
    { key: "payment", label: "Payment", icon: <WalletOutlined />, path: "/dashboard/payment" },
    { key: "support", label: "Support Center", icon: <CustomerServiceOutlined />, path: "/dashboard/support" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/dashboard/profile" },
    { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/dashboard/settings" },
  ];

  // Dynamic menu items based on user status
  const getDynamicMenuItems = () => {
    if (!userInfo) return baseMenuItems;

    const { qaStatus, annotatorStatus } = userInfo;
    let dynamicItems = [...baseMenuItems];

    // If qaStatus === "approved", add QA Review Dashboard
    if (qaStatus === "approved") {
      const qaMenuItem = {
        key: "qa-review",
        label: "QA Review",
        icon: <PlayCircleOutlined />,
        path: "/dashboard/qa-review"
      };
      // Insert after assessment-history
      const assessmentHistoryIndex = dynamicItems.findIndex(item => item.key === "assessment-history");
      if (assessmentHistoryIndex !== -1) {
        dynamicItems.splice(assessmentHistoryIndex + 1, 0, qaMenuItem);
      } else {
        dynamicItems.splice(2, 0, qaMenuItem);
      }
    }

    // If annotatorStatus === "approved", add Assessment List
    if (annotatorStatus === "approved") {
      const assessmentListMenuItem = {
        key: "assessments-list",
        label: "Assessments",
        icon: <AssessmentListOutlined />,
        path: "/dashboard/assessments"
      };
      // Insert after assessment-history or qa-review
      const lastAssessmentIndex = Math.max(
        dynamicItems.findIndex(item => item.key === "assessment-history"),
        dynamicItems.findIndex(item => item.key === "qa-review")
      );
      if (lastAssessmentIndex !== -1) {
        dynamicItems.splice(lastAssessmentIndex + 1, 0, assessmentListMenuItem);
      } else {
        dynamicItems.splice(2, 0, assessmentListMenuItem);
      }
    }

    return dynamicItems;
  };

  const menuItems = getDynamicMenuItems();

  // Check if a menu item should be locked based on user status
  const isMenuItemLocked = (itemKey: string) => {
    
    if (loading || !userInfo) {
      return false; // Don't lock anything while loading
    }

    const { annotatorStatus, microTaskerStatus, qaStatus } = userInfo;

    // console.log({annotatorStatus, microTaskerStatus, qaStatus});

    // QA Review and Assessments List are never locked if user has the right status
    if ((itemKey === "qa-review" && qaStatus === "approved") ||
      (itemKey === "assessments-list" && annotatorStatus === "approved")) {
      return false;
    }

    // If both statuses are pending, lock everything except overview, assessment, and settings
    if (annotatorStatus === "pending" && microTaskerStatus === "pending" && qaStatus === "pending") {
      return !["overview", "assessment", "settings"].includes(itemKey);
    }

    // If annotator is submitted and microTasker is pending, lock everything except overview and settings
    if (annotatorStatus === "submitted" && microTaskerStatus === "pending" && qaStatus === "pending") {
      return !["overview", "settings"].includes(itemKey);
    }

    // Default: don't lock anything
    return false;
  };

  // Filter menu items based on user status
  const getFilteredMenuItems = () => {
    if (loading || !userInfo) {
      return menuItems; // Show all items while loading
    }

    const { annotatorStatus, microTaskerStatus, qaStatus } = userInfo;

    // Filter logic for assessment and assessment history
    let filteredItems = [...menuItems];

    // If either status is approved, remove assessment from menu
    if (annotatorStatus === "approved" || microTaskerStatus === "approved") {
      filteredItems = filteredItems.filter(item => item.key !== "assessment");
    }

    // Show assessment history only if user has completed at least one assessment
    // (if either status is not "pending", it means they've taken an assessment)
    if (annotatorStatus === "pending" && microTaskerStatus === "pending" && qaStatus !== "approved") {
      filteredItems = filteredItems.filter(item => item.key !== "assessment-history");
    }

    return filteredItems;
  };

  const filteredMenuItems = getFilteredMenuItems();

  const handleLogOutModal = () => setOpenModal(!openModal);

  return (
    <div className="bg-white font-[gilroy-regular]">
      {/* Mobile top bar */}
      <div className="absolute top-3 left-3 lg:hidden rounded-sm flex items-center justify-center size-10  bg-primary text-white">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <CloseOutlined className="text-lg" /> : <MenuOutlined className="text-lg" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-full bg-primary text-white w-[250px] flex flex-col
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 z-50 p-2
        `}
      >
        {/* Logo (desktop only) */}
        <div className="hidden lg:flex p-4 gap-2 items-center font-bold text-xl border-b border-gray-700">
          <img className="h-8 rounded-md" src={Logo} alt="logo" />
          Dashboard
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col justify-between h-full mt-4">
          <ul className="space-y-2">
            {filteredMenuItems?.map((item) => {
              const isLocked = isMenuItemLocked(item?.key);

              if (isLocked) {
                // Render locked item as non-clickable
                return (
                  <li key={item.key}>
                    <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 cursor-not-allowed">
                      {item.icon}
                      {item.label}
                      <LockOutlined className="ml-auto text-xs" />
                    </div>
                  </li>
                );
              }

              // Render normal clickable item
              return (
                <li key={item.key}>
                  <NavLink
                    to={item.path}
                    onClick={() => setIsOpen(false)} // close menu on mobile click
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 text-sm font-medium ${isActive ? "bg-secondary rounded-md" : "hover:bg-gray-800"
                      }`
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 pl-4 mb-2"
          >
            <LogoutOutlined /> Logout
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 text-sm">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-center space-x-3 text-xs">
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#F6921E] transition-colors"
              >
                Privacy
              </a>
              <span className="text-gray-600">|</span>
              <a
                href="/terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#F6921E] transition-colors"
              >
                Terms
              </a>
            </div>
            <div className="text-center text-gray-500">
              © {new Date().getFullYear()} My Deep Tech
            </div>
          </div>
        </div>

        {/* Logout Modal */}
        <PageModal
          openModal={openModal}
          onCancel={handleLogOutModal}
          closable={true}
          className="custom-modal"
          modalwidth="400px"
        >
          <div className="font-[gilroy-regular] flex flex-col gap-4">
            <p>Are you sure you want to Logout?</p>
            <span className="flex justify-end gap-4">
              <Button
                onClick={() => {
                  sessionStorage.clear();
                  navigate("/login");
                }}
                className="!font-[gilroy-regular] !bg-secondary !text-primary !border-none"
              >
                Yes
              </Button>
              <Button
                onClick={() => setOpenModal(false)}
                className="!font-[gilroy-regular] !border-none !bg-primary !text-white"
              >
                No
              </Button>
            </span>
          </div>
        </PageModal>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;
