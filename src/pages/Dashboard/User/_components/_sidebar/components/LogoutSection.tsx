import { useState } from "react";
import { LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";
import PageModal from "../../../../../../components/Modal/PageModal";
import { LogoutSectionProps } from "../types";

const LogoutSection = ({ onLogout }: LogoutSectionProps) => {
  const [openModal, setOpenModal] = useState(false);

  const handleLogOutModal = () => setOpenModal(!openModal);

  return (
    <>
      <button
        onClick={() => setOpenModal(true)}
        className="flex items-center gap-2 pl-4 my-1.5 h-11 text-red-500 hover:bg-black/20 rounded-md transition-colors"
      >
        <LogoutOutlined /> Logout
      </button>

      {/* Logout Modal */}
      <PageModal
        openModal={openModal}
        onCancel={handleLogOutModal}
        closable={true}
        className="custom-modal"
        modalwidth="400px"
      >
        <div className="font-[gilroy-regular] flex flex-col gap-4">
          <p>Are you sure you want to Logout?</p>
          <span className="flex justify-end gap-4">
            <Button
              onClick={onLogout}
              className="!font-[gilroy-regular] !bg-secondary !text-primary !border-none"
            >
              Yes
            </Button>
            <Button
              onClick={() => setOpenModal(false)}
              className="!font-[gilroy-regular] !border-none !bg-primary !text-white"
            >
              No
            </Button>
          </span>
        </div>
      </PageModal>
    </>
  );
};

export default LogoutSection;