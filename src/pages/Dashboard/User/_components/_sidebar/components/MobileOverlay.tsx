import { MobileOverlayProps } from "../types";

const MobileOverlay = ({ isOpen, onClose }: MobileOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
      onClick={onClose}
    />
  );
};

export default MobileOverlay;