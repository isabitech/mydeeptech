import { NavLink } from "react-router-dom";
import { LockOutlined } from "@ant-design/icons";
import { NavigationListProps } from "../types";

const NavigationList = ({ menuItems, isMenuItemLocked, onItemClick }: NavigationListProps) => {
  return (
    <ul className="space-y-2">
      {menuItems?.map((item) => {
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
              onClick={onItemClick} // close menu on mobile click
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                  isActive 
                    ? "bg-secondary rounded-md" 
                    : "hover:bg-gray-800"
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
  );
};

export default NavigationList;