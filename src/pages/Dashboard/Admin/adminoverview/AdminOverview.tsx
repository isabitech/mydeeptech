import {
  BarChartOutlined,
  CodeSandboxOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import Header from "../../User/Header";
import { MessageCircleDashed } from "lucide-react";

const AdminOverview = () => {
  const activeProjects = [
    {
      id: 1,
      name: "Image Annotation",
      company: "CVAT",
      dueDate: "2024-12-01",
      status: "Pending",
    },
    {
      id: 2,
      name: "Text Annotation",
      company: "e2f",
      dueDate: "2024-11-25",
      status: "Completed",
    },
    {
      id: 3,
      name: "Data Collection",
      company: "Appen",
      dueDate: "2024-12-10",
      status: "In Progress",
    },
  ];

  const todayTasks = [
    {
      id: 1,
      name: "John Doe",
      email: "johndoe@gmail.com",
      dueDate: "2024-12-01",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "janesmith@d.co",
      dueDate: "2024-11-25",
    },
    {
      id: 3,
      name: "Robert Brown",
      email: "robertbrown@g.co",
      dueDate: "2024-12-10",
    },
  ];


  return (
    <div className=" h-full flex flex-col gap-4  font-[gilroy-regular]">
      {/* Header */}
      <Header title=" Admin Overview" />

      <hr />
      {/* Content */}

      <div className=" h-full  flex flex-col gap-4">
        {/* Cards */}
        <div className=" flex gap-2 justify-between text-white">
          {/* Revenue */}
          <div className=" w-[15rem] h-[15rem] bg-primary shadow-primary shadow-lg flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
              <BarChartOutlined />
            </span>
            <p className="text-[12px]">Total Paid Out</p>
            <p className="text-[2rem]">$95,000.00</p>
          </div>
          {/* Projects */}
          <div className=" w-[15rem] h-[15rem] bg-primary shadow-primary shadow-lg flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
              <CodeSandboxOutlined />
            </span>
            <p className="text-[12px]">Total Projects</p>
            <p className="text-[2rem]">
              21<span className="text-[18px]"></span>
            </p>
          </div>

          {/* Time spent */}
          <div className=" w-[15rem] h-[15rem] bg-primary shadow-primary shadow-lg flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
              <ClockCircleOutlined />
            </span>
            <p className="text-[12px]">Total Users</p>
            <p className="text-[2rem]">
              1000<span className="text-[18px]"></span>
            </p>
          </div>

          {/* Resources */}
          <div className=" w-[15rem] h-[15rem] bg-primary flex shadow-primary shadow-lg justify-center flex-col rounded-lg gap-4 px-2 pl-4">
            <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
              <InboxOutlined />
            </span>
            <p className="text-[12px]">Total Tasks</p>
            <p className="text-[2rem]">
            147<span className="text-[12px]"> </span>
            </p>
          </div>
        </div>
        {/* Active Projects */}
        <div className=" bg-primary rounded-md shadow-primary shadow-md w-full h-[30vh] flex flex-col gap-2 pt-4">
          <p className="text-white">Active Projects</p>

          <table
            className="text-white w-full border-collapse border border-white 
      "
          >
            <thead className=" text-left">
              <tr className=" ">
                <th className="p-2 font-normal">S/N</th>
                <th className="p-2 font-normal">Name</th>
                <th className="p-2 font-normal">Company</th>
                <th className="p-2 font-normal">Due Date</th>
                <th className="p-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample data rows */}
              {activeProjects.map((row, index) => (
                <tr className=" " key={row.id}>
                  <td className="p-2 ">{index + 1}</td>
                  <td className="p-2 ">{row.name}</td>
                  <td className="p-2 ">{row.company}</td>
                  <td className="p-2 ">{row.dueDate}</td>
                  <td className="p-2 ">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <Button className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md">
             Create New Project <PlusSquareOutlined />{" "}
            </Button>
          </div>
        </div>

        {/* Todays Task */}
        <div className=" bg-primary rounded-md w-full h-[30vh] shadow-primary shadow-md flex flex-col gap-2 pt-4">
          <p className="text-white">Todays Assigned Tasks</p>

          <table
            className="text-white w-full border-collapse border border-white 
      "
          >
            <thead className=" text-left">
              <tr className=" ">
                <th className="p-2 font-normal">S/N</th>
                <th className="p-2 font-normal">Task Name</th>
                <th className="p-2 font-normal">Assigned User Email</th>
                <th className="p-2 font-normal">Due Date</th>
                <th className="p-2 font-normal">Action</th>
              </tr>
            </thead>
            <tbody className=" h-full overflow-auto">
              {/* Sample data rows */}
              {todayTasks.map((row, index) => (
                <tr className=" " key={row.id}>
                  <td className="p-2 ">{index + 1}</td>
                  <td className="p-2 ">{row.name}</td>
                  <td className="p-2 ">{row.email}</td>
                  <td className="p-2 ">{row.dueDate}</td>
                  <td className="p-2 flex gap-2 ">
                    <Button className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                      Open Task <PlusSquareOutlined />{" "}
                    </Button>
                    <Button className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                      Message User <MessageCircleDashed/>                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
