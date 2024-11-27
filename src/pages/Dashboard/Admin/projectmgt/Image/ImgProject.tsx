import { Button } from "antd";
import { UserPlus } from "lucide-react";
import TaskTable from "../../TaskTable";

const ImgProject = () => {
  return (
    <div className="">
      <div className="flex justify-between ">
        <p>List of Assigned Tasks</p>
        <Button className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md">
          Assign a Task <UserPlus />
        </Button>
      </div>
      <TaskTable/>
    </div>
  );
};

export default ImgProject;
