import { NavLink } from "react-router-dom";
import { HomeOutlined, UserOutlined, SettingOutlined,CodeSandboxOutlined, InboxOutlined, LogoutOutlined, WalletOutlined, UnorderedListOutlined  } from "@ant-design/icons";
import Logo from "../../../assets/deeptech.png"
const Sidebar = () => {
  const menuItems = [
    { key: "overview", label: "Overview", icon: <HomeOutlined />, path: "/dashboard/overview" },
    { key: "projects", label: "Projects", icon: <CodeSandboxOutlined />, path: "/dashboard/projects" },
    { key: "jobs", label: "Jobs", icon: <InboxOutlined />, path: "/dashboard/jobs" },
    { key: "tasks", label: "Tasks", icon: <UnorderedListOutlined />, path: "/dashboard/tasks" },
    { key: "payment", label: "Payment", icon: <WalletOutlined />, path: "/dashboard/payment" },
    { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/dashboard/profile" },
    { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/dashboard/settings" },
    // { key: "logout", label: "Logout", icon: <LogoutOutlined />, path: "" }, // Example logout redirection
  ];

  return (
    <div className="h-full font-[gilroy-regular] bg-gray-900 text-white w-[250px] flex flex-col">
      {/* Logo */}
      <div className="p-4 text-center flex gap-2 items-center font-bold text-xl border-b border-gray-700">
      <div className="h-[70%]">
            <img className="h-full rounded-md" src={Logo} alt="" />
          </div>
        Dashboard
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col justify-between h-full mt-4">
        <ul className="space-y-2 ">
          {menuItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={item.path}
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
        <span className=" flex items-center gap-2 pl-4 mb-2 cursor-po">
            <LogoutOutlined /> Logout
        </span>
      </div>

      {/* Footer (Optional) */}
      <div className="p-4 border-t border-gray-700 text-sm text-center">
        
        © 2024 My Deep Tech
      </div>
    </div>
  );
};

export default Sidebar;
