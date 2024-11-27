import { Button } from "antd";

const Submitted = () => {
  const submitted = [
    {
      id: 1,
      userEmail: "user1@co.uk",
      taskName: "Image Annotation",
      dueDate: "2024-12-01",
      guideline: "",
      taskLink: "",
      taskStatus: "submitted",
      userTelegram: "",
    },
    {
      id: 2,
      userEmail: "user2@co.uk",
      taskName: "Text Annotation",
      dueDate: "2024-11-25",
      guideline: "",
      taskLink: "",
      taskStatus: "submitted",
      userTelegram: "",
    },
    {
      id: 3,
      userEmail: "user3@co.uk",
      taskName: "Video Annotation",
      dueDate: "2024-12-10",
      guideline: "",
      userTelegram: "",
      taskStatus: "submitted",
    },
  ];

  const date = new Date();
  const todaysDate = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return (
    <div>
      <p>
        Your submitted Jobs as at {todaysDate} {"-"} {month} {"-"} {year}{" "}
      </p>
      {/* Todays Task */}
      <div className="  w-full h-[70vh] overflow-y-auto flex flex-col gap-2 pt-4">
        <p className="text-primary">submitted Jobs</p>

        <table
          className=" w-full  
    "
        >
          <thead className=" text-left">
            <tr className=" ">
              <th className="p-2 font-normal">S/N</th>
              <th className="p-2 font-normal">Annotator Email</th>
              <th className="p-2 font-normal">Task Name</th>
              <th className="p-2 font-normal">Due Date</th>
              <th className="p-2 font-normal">Action</th>
              <th className="p-2 font-normal">Task Link</th>
              <th className="p-2 font-normal">Task Status</th>
            </tr>
          </thead>
          <tbody className=" h-full overflow-auto">
            {/* Sample data rows */}
            {submitted.map((row, index) => (
              <tr className=" " key={row.id}>
                <td className="p-2 ">{index + 1}</td>
                <td className="p-2 ">{row.userEmail}</td>
                <td className="p-2 ">{row.taskName}</td>
                <td className="p-2 ">{row.dueDate}</td>
                <td className="p-2 flex ">
                  <Button className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                    Approve
                  </Button>
                </td>
                <td className="p-2 ">
                  <Button className="!bg-primary !text-white !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                    View Task
                  </Button>
                </td>
                <td className="p-2 ">{row.taskStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Submitted;
