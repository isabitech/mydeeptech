import { NavLink, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  CodeSandboxOutlined,
  InboxOutlined,
  LogoutOutlined,
  WalletOutlined,
  UnorderedListOutlined,
  BookOutlined,
  BellOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import Logo from "../../../assets/deeptech.png";
import { useState } from "react";
import PageModal from "../../../components/Modal/PageModal";
import { Button, Drawer } from "antd";
import { useSidebarContext } from "./_context/SidebarContext";


const SidebarMenus = ({ openModal, handleLogOutModal }: { openModal: boolean; handleLogOutModal: () => void }) => {
  const { handleCloseSidebar } = useSidebarContext();

  const menuItems = [
    {
      key: "overview",
      label: "Overview",
      icon: <HomeOutlined />,
      path: "/overview",
    },
    {
      key: "annotators",
      label: "Annotators",
      icon: <UserOutlined />,
      path: "/annotators",
    },
    {
      key: "assessments",
      label: "Assessments",
      icon: <BookOutlined />,
      path: "/assessments",
    },
    {
      key: "projects",
      label: "Projects",
      icon: <CodeSandboxOutlined />,
      path: "/projects",
    },
    {
      key: "applications",
      label: "Applications",
      icon: <InboxOutlined />,
      path: "/applications",
    },

    // {
    //   key: "jobs",
    //   label: "Jobs",
    //   icon: <InboxOutlined />,
    //   path: "/jobs",
    // },
    // {
    //   key: "tasks",
    //   label: "Tasks",
    //   icon: <UnorderedListOutlined />,
    //   path: "/tasks",
    // },
    {
      key: "payment",
      label: "Payment",
      icon: <WalletOutlined />,
      path: "/payments",
    },

    {
      key: "invoice",
      label: "Invoice",
      icon: <WalletOutlined />,
      path: "/invoices",
    },

    {
      key: "notifications",
      label: "Notifications",
      icon: <BellOutlined />,
      path: "/notifications",
    },

    {
      key: "chat",
      label: "Support Chat",
      icon: <MessageOutlined />,
      path: "/chat",
    },

    {
      key: "users",
      label: "User Roles",
      icon: <UserOutlined />,
      path: "/users",
    },

    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      path: "/settings",
    },
    // { key: "logout", label: "Logout", icon: <LogoutOutlined />, path: "" }, // Example logout redirection
  ];


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
          {menuItems.map((item) => (
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

  const handleLogOutModal = () => {
    setOpenModal(!openModal);
  };

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
            <Button onClick={() => {
              sessionStorage.clear()
              navigate("/auth/admin-login");

            }} className=" !font-[gilroy-regular] !bg-secondary !text-primary !border-none">
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
