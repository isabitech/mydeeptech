import { Button, Form, Input, Select } from "antd";
import Header from "../Header";
import { useState } from "react";

const Profile = () => {
  const [isEditable] = useState(false);
  return (
    <div className="h-full flex flex-col gap-4  font-[gilroy-regular]">
      <Header title="Profile" />
      <div className=" mt-10 w-[90%] m-auto">
        <div className=" font-bold  justify-start">
          <p className=" text-lg">Profile</p>
          <hr />
        </div>
        <Form>
          <div className=" flex justify-between pt-[3rem] flex-wrap">
            <div className="flex flex-col gap-4">
              <span className=" flex flex-col gap-4">
                {/* Label */}
                <Form.Item>
                  {/* Content Container */}{" "}
                  <p className="font-[gilroy-medium] text-[1rem] ">
                    First name
                  </p>
                  <Input
                    // disabled={!isEditable}
                    // value={editedFirstname || userInfo?.firstname}
                    // onChange={isEditable ? handleFirstNameChange : noChange}
                    className=" !font-[gilroy-regular] w-[400px] border-[1px] border-[#E3E6EA] rounded-md pl-4 py-2"
                  />
                </Form.Item>
              </span>
              <span className=" flex flex-col gap-4">
                {/* Label */}
                <p className="font-[gilroy-medium] text-[1rem] ">Last name</p>
                {/* Content Container */}

                <span>
                  <Input
                    // disabled={!isEditable}
                    // value={editedLastname || userInfo?.lastname}
                    // onChange={isEditable ? handleLastNameChange : noChange}
                    className=" !font-[gilroy-regular] w-[400px] border-[1px] border-[#E3E6EA] rounded-md pl-4 py-2"
                  />
                </span>
              </span>
              <span className=" flex flex-col gap-4">
                {/* Label */}
                <p className="font-[gilroy-medium] text-[1rem] ">Email</p>
                {/* Content Container */}

                <span>
                  <Input
                    disabled
                    // value={userInfo?.email}
                    className=" !font-[gilroy-regular] w-[400px] border-[1px] border-[#E3E6EA] rounded-md pl-4 py-2"
                  />
                </span>
              </span>
              <span className="flex flex-col gap-4">
                {/* Label */}
                <p className="font-[gilroy-medium] text-[1rem] ">Phone Number</p>
                {/* Content Container */}

                
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <span className=" flex flex-col gap-4">
                {/* Label */}
                <p className="font-[gilroy-medium] text-[1rem] ">
                  Available Work Hours per week
                </p>
                {/* Content Container */}

                <span>
                  <Input
                    // value={userInfo?.dateOfBirth}
                    className=" !font-[gilroy-regular] w-[400px] border-[1px] border-[#E3E6EA] rounded-md pl-4 py-2"
                  />
                </span>
              </span>
              <span className=" flex flex-col gap-4">
                {/* Label */}
                <p className="font-[gilroy-medium] text-[1rem] ">
                  Account Name
                </p>
                {/* Content Container */}

                <Form.Item>
                  <Select
                    className="!font-[gilroy-medium] !text-[1rem]"
                    // placeholder={userInfo?.accent}
                    // onChange={handleAccentChange} // Updated onChange
                  >
                    {/* {accentData?.data.map((accent: string, index: number) => ( */}
                    <Select.Option>John Doe</Select.Option>
                    {/* ))} */}
                  </Select>
                </Form.Item>

                <p className="font-[gilroy-medium] text-[1rem] ">
                  Account Number
                </p>
                <div className=" w-[400px] border-[1px] border-[#E3E6EA] rounded-md pl-4 py-2">
                  <span className="font-[gilroy-medium]">
                    {/* {userInfo?.accent}{" "} */}
                    02211223344
                  </span>
                </div>
              </span>
              <span className=" flex flex-col gap-4">
                {/* Label */}
                <p className="font-[gilroy-medium] text-[1rem]">Bank</p>
                {/* Content Container */}

                <span>
                  {" "}
                  <Input
                    value={"First Bank"}
                    className=" !font-[gilroy-regular] w-[400px] border-[1px] border-[#E3E6EA] rounded-md pl-4 py-2"
                  />
                </span>
              </span>
              {/* <span className=" flex flex-col gap-4">
            
                <p className="font-[gilroy-medium] text-[1rem] ">Tribe</p>
                
                <div className=" w-[400px] border-[1px] border-[#E3E6EA] rounded-md pl-4 py-2">
                  <span>{"N/A"} </span>
                </div>
              </span> */}
            </div>

            {/* User Div & Edit button */}
            <div className=" flex md:flex-col  justify-between md:w-[10%] w-full ">
              {/* User Div */}
              <div className=" mt-4 md:mt-0">
                <div className="flex h-[4rem] w-[4rem] cursor-pointer items-center justify-center rounded-full bg-gray-300">
                  <span className="font-[gilroy-medium] font-bold text-4xl">
                    {/* {userInfo?.firstname?.charAt(0) +
                      "" +
                      userInfo?.lastname.charAt(0)} */}
                      JD
                  </span>
                </div>
              </div>
              {/* Edit Button & Save button */}
              <div className=" flex justify-end my-auto md:my-0">
                {isEditable ? (
                  <span className=" flex gap-2">
                    <Button
                      className="!bg-[#E3E6EA] !text-[#666666] rounded-lg !font-[gilroy-regular]"
                      // onClick={handleCancel}
                    >
                      Cancel
                    </Button>

                    <Button
                      className="!bg-[#096A95] !text-[#FFFFFF] rounded-lg !font-[gilroy-regular]"
                      // onClick={handleSave}
                      // loading={isPending}
                    >
                      Save
                    </Button>
                  </span>
                ) : (
                  <Button
                    className="!bg-secondary !text-[#19213D] rounded-lg !font-[gilroy-regular]"
                    // onClick={handleEditToggle}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Profile;                                                                
