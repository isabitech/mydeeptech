import { NavLink } from "react-router-dom";
import {
  LogoutOutlined,
  DownOutlined,
  RightOutlined
} from "@ant-design/icons";
import Logo from "../../../assets/deeptech.png";
import { useState } from "react";
import PageModal from "../../../components/Modal/PageModal";
import { Button, Drawer, Skeleton } from "antd";
import { useSidebarContext } from "./_context/SidebarContext";
import useLogout from "../../../hooks/useLogout";
import { useSidebarResources } from "../../../hooks/useSidebarResources";
import { getIconElement } from "../User/SidebarIcon";
import { ResourceNode } from "../../../api/rbac/rbacSchema";

const SidebarMenus = ({ openModal, handleLogOutModal }: { openModal: boolean; handleLogOutModal: () => void }) => {
  const { handleCloseSidebar } = useSidebarContext();
  const { resources, loading, error } = useSidebarResources();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderNavNode = (node: ResourceNode, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedItems[node._id];

    // Padding based on depth to indent subclasses
    const paddingLeft = depth > 0 ? `${depth * 1.5 + 1}rem` : '1rem';

    if (hasChildren) {
      return (
        <li key={node._id} className="w-full">
          <button
            onClick={(e) => toggleExpand(node._id, e)}
            className="w-full flex items-center justify-between py-3 pr-4 text-sm font-medium hover:bg-gray-800 transition-colors"
            style={{ paddingLeft }}
          >
            <div className="flex items-center gap-3">
              {getIconElement(node.icon)}
              <span>{node.title}</span>
            </div>
            {isExpanded ? <DownOutlined className="text-[10px]" /> : <RightOutlined className="text-[10px]" />}
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            <ul className="flex flex-col w-full bg-black/20">
              {node.children!.map(child => renderNavNode(child, depth + 1))}
            </ul>
          </div>
        </li>
      );
    }

    return (
      <li key={node._id} className="w-full">
        <NavLink
          to={`/admin${node.link}`}
          onClick={handleCloseSidebar}
          className={({ isActive }) =>
            `flex items-center gap-3 py-3 pr-4 text-sm font-medium transition-colors ${
              isActive ? "bg-secondary rounded-md" : "hover:bg-gray-800"
            }`
          }
          style={{ paddingLeft }}
        >
          {getIconElement(node.icon)}
          <span>{node.title}</span>
        </NavLink>
      </li>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 text-center flex flex-col gap-2 items-center justify-center font-bold text-xl border-b border-gray-700">
        <div className="h-[80px]">
          <img className="h-full w-full rounded-md pointer-events-none" src={Logo} alt="" />
        </div>
        <span className="text-white text-sm font-semibold opacity-55">
          Admin Dashboard
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col justify-between h-full mt-4">
        <ul className="space-y-1 w-full flex flex-col">
          {loading ? (
            <div className="px-4 py-2 space-y-4">
               {[...Array(6)].map((_, i) => (
                  <Skeleton.Button key={i} active size="small" block shape="round" style={{ height: '32px' }}/>
               ))}
            </div>
          ) : error ? (
            <div className="px-4 py-4 text-sm text-red-400 text-center">
               {error}
            </div>
          ) : resources.length === 0 ? (
            <div className="px-4 py-4 text-sm text-gray-400 text-center">
               No menus available
            </div>
          ) : (
            resources.map((item) => renderNavNode(item))
          )}
        </ul>

        {/* Global actions at bottom */}
        <div className="mt-8 pt-4 border-t border-gray-800 w-full mb-4 px-2">
          <button
            onClick={handleLogOutModal}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-500 hover:bg-black/20 rounded-md transition-colors"
          >
            <LogoutOutlined className="scale-90" /> Logout
          </button>
        </div>
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

  const handleLogout = useLogout({ userType: 'admin' });

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
            <Button onClick={() => handleLogout()} className=" !font-[gilroy-regular] !bg-secondary !text-primary !border-none">
              Yes
            </Button>
            <Button onClick={handleLogOutModal} className=" !font-[gilroy-regular]  !border-none !bg-primary !text-white">
              No
            </Button>
          </span>
        </div>
      </PageModal>
    </>
  );
};

export default AdminSidebar;
