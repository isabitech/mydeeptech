import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  CodeSandboxOutlined,
  InboxOutlined,
  LogoutOutlined,
  WalletOutlined,
  BookOutlined,
  BellOutlined,
  MessageOutlined,
  FileTextOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/deeptech.png";
import { useState } from "react";
import PageModal from "../../../components/Modal/PageModal";
import { Button, Drawer } from "antd";
import { useSidebarContext } from "./_context/SidebarContext";
import { useUserInfoActions } from "../../../store/useAuthStore";
import { useRBAC } from "../../../utils/rbac-utils";


const SidebarMenus = ({ openModal, handleLogOutModal }: { openModal: boolean; handleLogOutModal: () => void }) => {
  const { handleCloseSidebar } = useSidebarContext();


  const menuItems = [
    {
      key: "overview",
      label: "Overview",
      icon: <HomeOutlined />,
      resource: "overview",
      path: "/overview",
    },
    {
      key: "annotators",
      label: "Annotators",
      icon: <UserOutlined />,
      resource: "annotators",
      path: "/annotators",
    },
    {
      key: "assessments",
      label: "Assessments",
      icon: <BookOutlined />,
      resource: "assessments",
      path: "/assessments",
    },
    {
      key: "projects",
      label: "Projects",
      icon: <CodeSandboxOutlined />,
      resource: "projects",
      path: "/projects",
    },
    {
      key: "applications",
      label: "Applications",
      icon: <InboxOutlined />,
      resource: "applications",
      path: "/applications",
    },
    {
      key: "payment",
      label: "Payment",
      icon: <WalletOutlined />,
      resource: "payment",
      path: "/payments",
    },
    {
      key: "invoice",
      label: "Invoice",
      icon: <WalletOutlined />,
      resource: "invoice",
      path: "/invoices",
    },
    {
      key: "partner-invoice",
      label: "Partners Invoice",
      icon: <FileTextOutlined />,
      resource: "invoice",
      path: "/partner-invoices",
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <BellOutlined />,
      resource: "notifications",
      path: "/notifications",
    },
    {
      key: "chat",
      label: "Support Chat",
      icon: <MessageOutlined />,
      resource: "support_chat",
      path: "/chat",
    },
    {
      key: "users",
      label: "User Roles",
      icon: <UserOutlined />,
      resource: "user_roles",
      path: "/users",
    },
    {
      key: "employees",
      label: "Employees Mgt",
      icon: <UserOutlined />,
      resource: "employees",
      path: "/employees",
    },

    {
      key: "rbac",
      label: "Roles & Permissions",
      icon: <SafetyOutlined />,
      resource: "roles",
      path: "/rbac",
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      resource: "settings",
      path: "/settings",
    },
  ];

  const { hasPermission } = useRBAC();
  const filteredMenuItems = menuItems.filter(item =>
    !item.resource || hasPermission(item.resource, "view")
  );

  return (
    //    {/* Logo */}
    <div className="flex flex-col">
      <div className="p-4 text-center  flex flex-col gap-2 items-center justify-center font-bold text-xl border-b border-gray-700">
        <div className="h-[80px]">
          <img className="h-full w-full rounded-md pointer-events-none" src={Logo} alt="" />
        </div>
        <span className="text-white text-sm font-semibold opacity-55">
          Admin Dashboard
        </span>
      </div>
      {/* Navigation Links */}
      <div className="flex flex-col justify-between h-full mt-4">
        <ul className="space-y-2 ">
          {filteredMenuItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={`/admin${item.path}`}
                onClick={handleCloseSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium ${isActive ? "bg-secondary rounded-md" : "hover:bg-gray-800"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogOutModal}
          className=" flex items-center gap-2 pl-4 mb-2 cursor-pointer hover:bg-gray-800 py-3"
        >
          <LogoutOutlined className="scale-90" /> Logout
        </button>
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs opacity-50 text-center">
        © {new Date().getFullYear()} My Deep Tech
      </div>
    </div>
  )
}

const AdminSidebar = () => {
  const [openModal, setOpenModal] = useState(false);
  const { sidebarCollapsed, toggleSidebar } = useSidebarContext();
  const { clearUserInfo } = useUserInfoActions();
  const handleLogOutModal = () => {
    setOpenModal(!openModal);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    clearUserInfo();
    navigate("/auth/admin-login");
  }

  const navigate = useNavigate();

  return (
    <>
      <Drawer
        width={300}
        placement="left"
        onClose={toggleSidebar}
        open={sidebarCollapsed}
        title={null}
        closable={false}
        className="!bg-primary text-white [&_.ant-drawer-close]:text-white [&_.ant-drawer-close:hover]:text-gray-200"
        styles={{ body: { padding: 5 } }}
      >
        <SidebarMenus
          openModal={openModal}
          handleLogOutModal={handleLogOutModal}
        />
      </Drawer>
      <div className="hidden min-h-full font-[gilroy-regular] bg-primary text-white w-[300px] lg:flex flex-col overflow-y-auto p-1">
        <SidebarMenus openModal={openModal} handleLogOutModal={handleLogOutModal} />
      </div>

      <PageModal
        openModal={openModal}
        onCancel={handleLogOutModal}
        closable={true}
        className="custom-modal"
        modalwidth="400px"
      >
        <div className=" font-[gilroy-regular] flex flex-col gap-4">
          <p>Are you sure you want to Logout?</p>
          <span className=" flex justify-end gap-4">
            <Button onClick={handleLogout} className=" !font-[gilroy-regular] !bg-secondary !text-primary !border-none">
              Yes
            </Button>
            <Button className=" !font-[gilroy-regular]  !border-none !bg-primary !text-white">
              No
            </Button>
          </span>
        </div>
      </PageModal>
    </>
  );
};

export default AdminSidebar;
