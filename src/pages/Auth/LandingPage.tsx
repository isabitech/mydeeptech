import { Button, ConfigProvider } from "antd";
import Logo from "../../assets/deeptech.png";
import freelancer from "../../assets/freelancer.jpg";
import { useState } from "react";
import PageModal from "../../components/Modal/PageModal";
import SignupContent from "./Signup";
import LoginContent from "./Login";

const LandingPage = () => {
  const [isLoginModal, setIsLoginModal] = useState(false);
  const [isSignUpModal, setIsSignUpModal] = useState(false);

  const handleOpenLogin = () => {
    setIsLoginModal(!isLoginModal);
  };

  const handleSignUpModal = () => {
    setIsSignUpModal(!isSignUpModal);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            colorBgMask: "rgba(0, 0, 0, 0.6)", // Semi-transparent overlay
            contentBg: "#333333", // Dark gray background for modal
            borderRadiusOuter:12

          },
        },
      }}
    >
      <div className="h-screen grid grid-rows-[5rem_1fr] font-[gilroy-regular] pt-4 bg-gradient-to-br from-[#333333] to-[#F6921E] text-white">
        {/* Nav Link */}
        <nav className="h-full flex justify-between mx-4 items-center">
          {/* logo */}
          <div className="h-[70%]">
            <img className="h-full rounded-md" src={Logo} alt="" />
          </div>
          <ul className="flex gap-4 cursor-pointer">
            <li>Home</li>
            <li>About</li>
          </ul>
          {/* Login / Signup */}
          <div className="flex gap-3">
            <Button
              className="!font-[gilroy-regular] !bg-primary !border-none  !text-[#FFFFFF]  !flex !h-10 !items-center !justify-center !rounded-xl"
              onClick={handleOpenLogin}
            >
              Login
            </Button>
            <Button
              className="!font-[gilroy-regular] !bg-secondary !border-none  !text-[#FFFFFF]  !flex !h-10 !items-center !justify-center !rounded-xl"
              onClick={handleSignUpModal}
            >
              Sign Up
            </Button>
          </div>
        </nav>

        {/* Hero */}
        <div className="flex gap-4 px-4 justify-center">
          {/* Text */}
          <div className="m-auto w-[50%] flex flex-col gap-4">
            <p className="text-[3rem] font-bold">
              Empowering Freelancers in Data Annotation and AI Development
            </p>
            <p className="text-[1.5rem] font-normal">
              Find gigs, showcase your skills, and grow your career in data
              annotation across text, image, audio, and video tasks.
            </p>
            <Button
              className="!font-[gilroy-regular] !w-[10rem] !bg-secondary !border-none  !text-[#FFFFFF]  !flex !h-10 !items-center !justify-center !rounded-xl"
              onClick={handleSignUpModal}
            >
              Get Started
            </Button>
          </div>
          {/* Image */}
          <div className="rounded-full border w-[30rem] h-[30rem] m-auto flex justify-center items-center py-[2px] px-[2px]">
            <img
              className="h-[90%] w-[90%] rounded-full"
              src={freelancer}
              alt=""
            />
          </div>
        </div>

        {/* Login Modal */}
        <PageModal
          openModal={isLoginModal}
          onCancel={handleOpenLogin}
          closable={true}
          className="custom-modal"
          modalwidth="400px"
        >
          <LoginContent />
        </PageModal>

        {/* Signup Modal */}
        <PageModal
          openModal={isSignUpModal}
          onCancel={handleSignUpModal}
          closable={true}
          className="custom-modal"
          modalwidth="400px"
        >
          <SignupContent />
        </PageModal>
      </div>
    </ConfigProvider>
  );
};

export default LandingPage;
