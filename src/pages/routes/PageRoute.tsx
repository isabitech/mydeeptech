import { Button } from "antd";
import  { useState } from "react";
import { useNavigate } from "react-router-dom";

const PageRoute = () => {
  const [userStatus, setUserStatus] = useState("");
  const userRoles = [
    { id: 1, name: "admin" },
    { id: 2, name: "user" },
  ];

  const navigate = useNavigate();
  // const [openOutlet, setOpenOutlet] = useState(false);
  const openDashboard = () => {
    if (userStatus === "user") {
      // setOpenOutlet(true);
      navigate("/dashboard/overview");
    } else if (userStatus === "admin") {
      // setOpenOutlet(true);
      navigate("/admin");
    }
  };
  return (
    <div>
      <div className="font-[gilroy-regular] h-screen flex justify-center items-center flex-col gap-4">
        <p className="font-semibold">Welcome! John Doe</p>
        <img
          className="!h-[20rem] w-[35rem] rounded-md"
          src="https://img.freepik.com/premium-vector/welcome-gesture-hand-drawn-woman-waving-hello-with-smile_1316704-32146.jpg"
          alt="Welcome"
        />
        <div className="flex gap-4">
          <p className="my-auto">User Role</p>
          <select
            name="status"
            id="status"
            value={userStatus}
            onChange={(e) => setUserStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="" disabled>
              Select Role
            </option>
            {userRoles.map((role) => (
              <option value={role.name} key={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <Button
            className="!font-[gilroy-regular] !bg-secondary !border-none  !text-[#FFFFFF]  !flex !h-10 !items-center !justify-center !rounded-xl"
            onClick={openDashboard}
          >
            Go to Overview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PageRoute;
