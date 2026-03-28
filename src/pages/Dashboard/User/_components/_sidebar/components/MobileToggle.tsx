import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { MobileToggleProps } from "../types";

const MobileToggle = ({ isOpen, onToggle }: MobileToggleProps) => {
  return (
    <div className="absolute top-3 left-3 lg:hidden rounded-sm flex items-center justify-center size-10 bg-primary text-white">
      <button onClick={onToggle}>
        {isOpen ? <CloseOutlined className="text-lg" /> : <MenuOutlined className="text-lg" />}
      </button>
    </div>
  );
};

export default MobileToggle;