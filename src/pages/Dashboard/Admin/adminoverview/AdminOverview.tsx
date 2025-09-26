import {
  BarChartOutlined,
  CodeSandboxOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { Button, notification } from "antd";
import Header from "../../User/Header";
import { useEffect, useState } from "react";
import { baseURL, endpoints } from "../../../../store/api/endpoints";
import { useNavigate } from "react-router-dom";
import { ProjectType } from "../projectmgt/ProjectManagement";
import { Project } from "../projectmgt/ProjectManagement";
import {
  differenceInDays,
  differenceInMonths,
  differenceInWeeks,
} from "date-fns";
import Loader from "../../../../components/Loader";

const AdminOverview = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalUser, settotalUser] = useState<number>(0);
  const [totalProject, settotalProject] = useState<number>(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalTask, settotalTask] = useState<number>(0);

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

  const navigate = useNavigate();
  useEffect(() => {
    setIsLoading(!isLoading);
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${baseURL}${endpoints.users.getAllUsers}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setIsLoading(false);
        const result = data.data;
        const totalUser = result.length;
        settotalUser(totalUser);
      } catch (error) {
        console.error("An error occurred:", error);
        notification.error({
          message: "Error fetching users",
          description:
            "An error occurred while fetching the user list. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    const fetchAllTasks = async () => {
      try {
        const response = await fetch(`${baseURL}${endpoints.tasks.getAllTasks}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setIsLoading(false);
        const result = data.data;
        const totalTask = result.length;
        settotalTask(totalTask);
      } catch (error) {
        console.error("An error occurred:", error);
        notification.error({
          message: "Error fetching tasks",
          description:
            "An error occurred while fetching the task list. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllTasks();

    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${baseURL}${endpoints.project.getProject}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        const data: ProjectType = await response.json();
        const result = data.data;
        const projectNumber = result.length;
        settotalProject(projectNumber);
        setProjects(result);

        // Update state with fetched data
      } catch (error: any) {
        notification.error({
          message: "Error Fetching Projects",
          description: error.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const calculateTimeLeft = (dueDate: string): string => {
    const now = new Date();
    const due = new Date(dueDate);

    const monthsLeft = differenceInMonths(due, now);
    const weeksLeft = differenceInWeeks(due, now) % 4;
    const daysLeft = differenceInDays(due, now) % 7;

    if (monthsLeft < 0 || weeksLeft < 0 || daysLeft < 0) {
      return "Past Due";
    }

    return `${monthsLeft} months, ${weeksLeft} weeks, ${daysLeft} days left`;
  };

  return (
    <div className=" h-full flex flex-col gap-4  font-[gilroy-regular]">
      {/* Header */}
      <Header title=" Admin Overview" />

      <hr />
      {/* Content */}

      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div className=" h-full  flex flex-col gap-4">
          {/* Cards */}
          <div className=" flex gap-2 justify-between text-white">
            {/* Revenue */}
            <div className=" w-[15rem] h-[15rem] hover:ease-in-out hover:transition-all hover:translate-y-3 bg-primary shadow-primary shadow-lg flex justify-center flex-col rounded-lg gap-4 px-2 pl-4">
              <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                <BarChartOutlined />
              </span>
              <p className="text-[12px]">Total Paid Out</p>
              <p className="text-[2rem]">$95,000.00</p>
            </div>
            {/* Projects */}
            <div
              onClick={() => {
                navigate("/admin/projects");
              }}
              className=" cursor-pointer hover:ease-in-out hover:transition-all hover:translate-y-3 w-[15rem] h-[15rem] bg-primary shadow-primary shadow-lg flex justify-center flex-col rounded-lg gap-4 px-2 pl-4"
            >
              <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                <CodeSandboxOutlined />
              </span>
              <p className="text-[12px]">Total Projects</p>

              <p className="text-[2rem]">
                {totalProject}
                <span className="text-[18px]"></span>
              </p>
            </div>

            {/* Time spent */}
            <div
              onClick={() => {
                navigate("/admin/users");
              }}
              className=" cursor-pointer hover:ease-in-out hover:transition-all hover:translate-y-3 w-[15rem] h-[15rem] bg-primary shadow-primary shadow-lg flex justify-center flex-col rounded-lg gap-4 px-2 pl-4"
            >
              <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                <ClockCircleOutlined />
              </span>
              <p className="text-[12px]">Total Users</p>

              <p className="text-[2rem]">
                {totalUser}
                <span className="text-[18px]"></span>
              </p>
            </div>

            {/* Resources */}
            <div className=" w-[15rem] h-[15rem] hover:ease-in-out hover:transition-all hover:translate-y-3 bg-primary flex shadow-primary shadow-lg justify-center flex-col rounded-lg gap-4 px-2 pl-4">
              <span className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                <InboxOutlined />
              </span>
              <p className="text-[12px]">Total Tasks</p>
              <p className="text-[2rem]">
                {totalTask}
                <span className="text-[12px]"> </span>
              </p>
            </div>
          </div>
          {/* Active Projects */}
          <div className=" bg-primary rounded-md shadow-primary shadow-md w-full h-[30vh] flex flex-col gap-2 pt-4">
            <p className="text-white">Active Projects</p>

            <div className=" h-[10rem] overflow-y-auto">
              <table
                className="text-white w-full border-collapse border border-white h-[15rem] overflow-y-auto
      "
              >
                <thead className=" text-left">
                  <tr className=" ">
                    <th className="p-2 font-normal">S/N</th>
                    <th className="p-2 font-normal">Name</th>
                    <th className="p-2 font-normal">Company</th>
                    <th className="p-2 font-normal">Due Date</th>
                    {/* <th className="p-2 font-normal">Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {/* Sample data rows */}
                  {projects.map((row, index) => (
                    <tr className=" " key={row._id}>
                      <td className="p-2 ">{index + 1}</td>
                      <td className="p-2 ">{row.projectName}</td>
                      <td className="p-2 ">{row.company}</td>
                      <td className="p-2 ">{calculateTimeLeft(row.dueDate)}</td>
                      {/* <td className="p-2 ">{row.status}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={() => {
                  navigate("/admin/projects");
                }}
                className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md"
              >
                Create New Project <PlusSquareOutlined />{" "}
              </Button>
            </div>
          </div>

          {/* Todays Task */}
          <div className=" bg-primary rounded-md w-full h-[30vh] shadow-primary shadow-md flex flex-col gap-2 pt-4">
            <p className="text-white">Todays Assigned Tasks</p>

            <div className=" h-[15rem] overflow-y-auto">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
