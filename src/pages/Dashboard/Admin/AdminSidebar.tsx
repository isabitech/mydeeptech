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
} from "@ant-design/icons";
import Logo from "../../../assets/deeptech.png";
import { useState } from "react";
import PageModal from "../../../components/Modal/PageModal";
import { Button } from "antd";

const AdminSidebar = () => {
  const [openModal, setOpenModal] = useState(false);

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

    // {
    //   key: "users",
    //   label: "Users",
    //   icon: <UserOutlined />,
    //   path: "/users",
    // },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
      path: "/settings",
    },
    // { key: "logout", label: "Logout", icon: <LogoutOutlined />, path: "" }, // Example logout redirection
  ];

  const handleLogOutModal = () => {
    setOpenModal(!openModal);
  };

  const navigate = useNavigate()

  return (
    <div className="h-full font-[gilroy-regular] bg-primary text-white w-[250px] flex flex-col">
      {/* Logo */}
      <div className="p-4 text-center flex gap-2 items-center font-bold text-xl border-b border-gray-700">
        <div className="h-[70%]">
          <img className="h-full rounded-md" src={Logo} alt="" />
        </div>
        Admin Dashboard
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col justify-between h-full mt-4">
        <ul className="space-y-2 ">
          {menuItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={`/admin${item.path}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                    isActive ? "bg-secondary rounded-md" : "hover:bg-gray-800"
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
          onClick={() => setOpenModal(!openModal)}
          className=" flex items-center gap-2 pl-4 mb-2 cursor-po"
        >
          <LogoutOutlined /> Logout
        </button>
      </div>

      {/* Footer (Optional) */}
      <div className="p-4 border-t border-gray-700 text-sm text-center">
        © {new Date().getFullYear()} My Deep Tech
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
            <Button onClick={()=> {
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
    </div>
  );
};

export default AdminSidebar;
