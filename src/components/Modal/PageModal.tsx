import { Modal } from "antd";

type Props = {
  children: React.ReactNode;
  openModal: boolean;
  onCancel: () => void;
  closable: boolean;
  className: string;
  footer?: boolean | React.ReactNode;
  modalwidth: string;
};

const PageModal = ({
  children,
  openModal,
  onCancel,
  closable,
  className,
  
  modalwidth,
}: Props) => {
  return (
    <Modal
      open={openModal}
      onCancel={onCancel}
      closable={closable}
      className={className}
      footer={null}
      centered
      width={modalwidth}
      style={{
        // Set a solid or semi-transparent background
        backgroundColor: "#333333", // Dark gray background for the modal
      
      }}
      maskStyle={{
        // Optional: Adjust the overlay opacity
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Darkened semi-transparent overlay
      }}
    >
      <div className="h-[70svh] overflow-auto">{children}</div>
    </Modal>
  );
};

export default PageModal;
