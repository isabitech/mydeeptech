import { Button } from "antd";
import { useEffect, useState } from "react";
import { retrieveUserInfoFromStorage } from "../../../helpers";
import Header, { UserInfoProps } from "./Header";
import { Link } from "react-router-dom";

const Welcome = () => {
  const [userInfo, setUserInfo] = useState<UserInfoProps | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await retrieveUserInfoFromStorage();
      console.log("User info:", user);
      setUserInfo(user);
    };
    loadUser();
  }, []);

  return (
    <div className=" font-[gilroy-regular]">
      <Header title="Welcome" key={""} />
      <div className="font-[gilroy-regular] h-[70svh] flex justify-center items-center flex-col gap-4">
        <p className="font-semibold">
          Welcome! {userInfo?.firstname} {userInfo?.lastname}
        </p>
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
              Take Assesment
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
