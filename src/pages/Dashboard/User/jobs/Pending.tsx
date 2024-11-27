import { Button } from "antd";

const Pending = () => {
  const pending = [
    {
      id: 1,
      jobName: "Masks",
      jobType: "Image Annotation",
      dueDate: "2024-12-01",
      guideline: "",
      taskLink: "",
    },
    {
      id: 2,
      jobName: "LLM",
      jobType: "Text Annotation",
      dueDate: "2024-11-25",
      guideline: "",
      taskLink: "",
    },
    {
      id: 3,
      jobName: "CCTV",
      jobType: "Video Annotation",
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
        Your Pending Jobs as at {todaysDate} {"-"} {month} {"-"} {year}{" "}
      </p>
      {/* Todays Task */}
      <div className="  w-full h-[70vh] overflow-y-auto flex flex-col gap-2 pt-4">
        <p className="text-primary">Pending Jobs</p>

        <table
          className=" w-full  
    "
        >
          <thead className=" text-left">
            <tr className=" ">
              <th className="p-2 font-normal">S/N</th>
              <th className="p-2 font-normal">Job Name</th>
              <th className="p-2 font-normal">Job Type</th>
              <th className="p-2 font-normal">Due Date</th>
              <th className="p-2 font-normal">Action</th>
            </tr>
          </thead>
          <tbody className=" h-full overflow-auto">
            {/* Sample data rows */}
            {pending.map((row, index) => (
              <tr className=" " key={row.id}>
                <td className="p-2 ">{index + 1}</td>
                <td className="p-2 ">{row.jobName}</td>
                <td className="p-2 ">{row.jobType}</td>
                <td className="p-2 ">{row.dueDate}</td>
                <td className="p-2 flex ">
                  <Button className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                    Submit{" "}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pending;
