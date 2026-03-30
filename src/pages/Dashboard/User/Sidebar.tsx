import { useUserInfoStates } from "../../../store/useAuthStore";
import useLogout from "../../../hooks/useLogout";
import {
  MobileToggle,
  SidebarHeader,
  NavigationList,
  SidebarFooter,
  LogoutSection,
  MobileOverlay,
  useSidebarLogic,
} from "./_components/_sidebar";

const Sidebar = () => {
  const { userInfo } = useUserInfoStates();
  const handleLogout = useLogout({ userType: 'user' });
  
  const { isOpen, setIsOpen, filteredMenuItems, isMenuItemLocked } = useSidebarLogic(userInfo);

  const handleMobileToggle = () => setIsOpen(!isOpen);
  const handleMobileItemClick = () => setIsOpen(false);
  const handleMobileOverlayClick = () => setIsOpen(false);

  return (
    <aside className="bg-white font-[gilroy-regular]">
      <MobileToggle isOpen={isOpen} onToggle={handleMobileToggle} />

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static top-0 left-0 h-full overflow-y-auto bg-primary text-white w-[250px] flex flex-col
          transform ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 transition-transform duration-300 z-50 p-2
        `}
      >
        <SidebarHeader />

        {/* Navigation Links */}
        <div className="flex flex-col justify-between flex-1 mt-4">
          <NavigationList 
            menuItems={filteredMenuItems}
            isMenuItemLocked={isMenuItemLocked}
            onItemClick={handleMobileItemClick}
          />
          <LogoutSection onLogout={handleLogout} />
        </div>

        <SidebarFooter />
      </div>

      <MobileOverlay isOpen={isOpen} onClose={handleMobileOverlayClick} />
    </aside>
  );
};

export default Sidebar;
