import Logo from "../../../../../../assets/deeptech.png";
import { SidebarHeaderProps } from "../types";

const SidebarHeader = ({ className = "" }: SidebarHeaderProps) => {
  return (
    <div className={`hidden lg:flex p-4 gap-2 items-center font-bold text-xl border-b border-gray-700 ${className}`}>
      <img className="h-8 rounded-md" src={Logo} alt="logo" />
      Dashboard
    </div>
  );
};

export default SidebarHeader;