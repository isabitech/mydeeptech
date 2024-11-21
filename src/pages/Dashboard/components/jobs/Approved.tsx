const Approved = () => {
  const approved = [
    {
      id: 1,
      jobName: "Masks",
      jobType: "Image Annotation",
      approvedDate: "2024-12-01",
      approvedAmount: "N4000",
      taskLink: "",
    },
    {
      id: 2,
      jobName: "LLM",
      jobType: "Text Annotation",
      approvedDate: "2024-11-25",
      approvedAmount: "N10000",
      taskLink: "",
    },
    {
      id: 3,
      jobName: "CCTV",
      jobType: "Video Annotation",
      approvedDate: "2024-12-10",
      approvedAmount: "N20000",
    },
  ];

  const date = new Date();
  const todaysDate = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return (
    <div>
      <p>
        Your approved Jobs as at {todaysDate} {"-"} {month} {"-"} {year}{" "}
      </p>
      {/* Todays Task */}
      <div className="  w-full h-[70vh] overflow-y-auto flex flex-col gap-2 pt-4">
        <p className="text-primary">Approved Jobs</p>

        <table
          className=" w-full  
        "
        >
          <thead className=" text-left">
            <tr className=" ">
              <th className="p-2 font-normal">S/N</th>
              <th className="p-2 font-normal">Job Name</th>
              <th className="p-2 font-normal">Job Type</th>
              <th className="p-2 font-normal">Approved Date</th>
              <th className="p-2 font-normal">Approved Rate</th>
            </tr>
          </thead>
          <tbody className=" h-full overflow-auto">
            {/* Sample data rows */}
            {approved.map((row, index) => (
              <tr className=" " key={row.id}>
                <td className="p-2 ">{index + 1}</td>
                <td className="p-2 ">{row.jobName}</td>
                <td className="p-2 ">{row.jobType}</td>
                <td className="p-2 ">{row.approvedDate}</td>
                <td className="p-2 flex ">{row.approvedAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Approved;
