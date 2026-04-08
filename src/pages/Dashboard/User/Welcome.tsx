import { Button } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import Overview from "./Overview";
import { useGetUserInfo } from "../../../store/useAuthStore";

const Welcome = () => {
  const [searchParams] = useSearchParams();
   const userInfo = useGetUserInfo("user");
  const resultSubmitted = searchParams.get("resultSubmitted=true");

  if (userInfo?.annotatorStatus === "pending" && userInfo?.microTaskerStatus === "pending") {
    return (
      <div className=" font-[gilroy-regular]">
        <div className="font-[gilroy-regular] h-[70svh] flex justify-center items-center flex-col gap-4">
          <p className="font-semibold">Welcome! {userInfo?.fullName} </p>
          <img
            className="!h-[20rem] w-[35rem] rounded-md"
            src="https://img.freepik.com/premium-vector/welcome-gesture-hand-drawn-woman-waving-hello-with-smile_1316704-32146.jpg"
            alt="Welcome"
          />
          <div className="flex gap-4">
            {/* <p className="my-auto">User Role</p> */}
            <Link to={"/dashboard/assessment"}>
              <Button
                className="!font-[gilroy-regular] !bg-secondary !border-none  !text-[#FFFFFF]  !flex !h-10 !items-center !justify-center !rounded-xl hover:!bg-[#393735] hover:!text-secondary"
              // onClick={openDashboard}
              >
                Take Assessment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if ((userInfo?.annotatorStatus === "submitted" && userInfo?.microTaskerStatus === "pending") || resultSubmitted) {
    return (
      <div className="flex-1 font-[gilroy-regular]">
        <div className="font-[gilroy-regular] h-[70svh] flex justify-center items-center flex-col gap-4">
          <p className="font-semibold">Welcome! {userInfo?.fullName} </p>
          <img
            className="!h-[20rem] w-[35rem] rounded-md"
            src="https://img.freepik.com/premium-vector/welcome-gesture-hand-drawn-woman-waving-hello-with-smile_1316704-32146.jpg"
            alt="Welcome"
          />
          <div className="flex gap-4">
            <p className="text-center max-w-md">
              Your submission has been received! You will receive the next steps
              via email shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Overview />;
};

export default Welcome;
