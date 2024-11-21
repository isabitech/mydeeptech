import { Button } from "antd";

const Text = () => {
    const todayTasks = [
        {
          id: 1,
          taskName: "LLM",
          taskType: "Assess LLM Response",
          dueDate: "2024-12-01",
          guideline: "",
          taskLink: "",
        },
        {
          id: 2,
          taskName: "Chatbot training",
          taskType: "Train chatbot on corrrect response",
          dueDate: "2024-11-25",
          guideline: "",
          taskLink: "",
        },
        {
          id: 3,
          taskName: "Correct Errors",
          taskType: "Correct erratic annotations",
          dueDate: "2024-12-10",
          guideline: "",
        },
      ];
    
      const date = new Date();
      const todaysDate = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();
  return (
    <div>
      <p>
        Your Tasks as at {todaysDate} {"-"} {month} {"-"} {year}{" "}
      </p>
      {/* Todays Task */}
      <div className="  w-full h-[70vh] overflow-y-auto flex flex-col gap-2 pt-4">
        <p className="text-primary">Todays Tasks</p>

        <table
          className=" w-full  
      "
        >
          <thead className=" text-left">
            <tr className=" ">
              <th className="p-2 font-normal">S/N</th>
              <th className="p-2 font-normal">Task Name</th>
              <th className="p-2 font-normal">Task Type</th>
              <th className="p-2 font-normal">Due Date</th>
              <th className="p-2 font-normal">Action</th>
            </tr>
          </thead>
          <tbody className=" h-full overflow-auto">
            {/* Sample data rows */}
            {todayTasks.map((row, index) => (
              <tr className=" " key={row.id}>
                <td className="p-2 ">{index + 1}</td>
                <td className="p-2 ">{row.taskName}</td>
                <td className="p-2 ">{row.taskType}</td>
                <td className="p-2 ">{row.dueDate}</td>
                <td className="p-2 flex ">
                  <Button className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                    Work{" "}
                  </Button>
                  <Button className="!bg-primary !text-white !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                    Guideline{" "}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Text