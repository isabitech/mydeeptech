import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

const Paid = () => {
  const paid = [
    {
      id: 1,
      invoiceNumber: "001",
      invoiceAmount: "N150000",
      invoicedDate: "2024-12-01",
      guideline: "",
      taskLink: "https://example.com/link",
      taskName: "Image Annotation",
      taskStatus: "Approved",
      userEmail: "geee@co.uk",
    },
    {
      id: 2,
      invoiceNumber: "002",
      invoiceAmount: "N200000",
      invoicedDate: "2024-11-25",
      guideline: "",
      taskLink: "https://example.com/link",
      taskName: "Image Annotation",
      taskStatus: "Approved",
      userEmail: "geee@co.uk",
    },
    {
      id: 3,
      invoiceNumber: "003",
      invoiceAmount: "N300000",
      invoicedDate: "2024-12-10",
      guideline: "",
      taskLink: "https://example.com/link",
      taskName: "Image Annotation",
      taskStatus: "Approved",
      userEmail: "geee@co.uk",
    },
  ];

  const date = new Date();
  const todaysDate = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return (
    <div>
      <p>
        Your Paid Out Jobs as at {todaysDate} {"-"} {month} {"-"} {year}{" "}
      </p>
      {/* Todays Task */}
      <div className="  w-full h-[70vh] overflow-y-auto flex flex-col gap-2 pt-4">
        <p className="text-primary">paid Jobs</p>

        <table
          className=" w-full  
        "
        >
          <thead className=" text-left">
            <tr className=" ">
              <th className="p-2 font-normal">S/N</th>
              <th className="p-2 font-normal">Invoice Number</th>
              <th className="p-2 font-normal">Invoice Amount</th>
              <th className="p-2 font-normal">Invoiced Date</th>
              <th className="p-2 font-normal">Payment Status</th>
              <th className="p-2 font-normal">Action</th>

              <th className="p-2 font-normal">Task Status</th>
              <th className="p-2 font-normal">Task Link</th>
              <th className="p-2 font-normal">Task Name</th>
              <th className="p-2 font-normal">User Email</th>
            </tr>
          </thead>
          <tbody className=" h-full overflow-auto">
            {/* Sample data rows */}
            {paid.map((row, index) => (
              <tr className=" " key={row.id}>
                <td className="p-2 ">{index + 1}</td>
                <td className="p-2 ">{row.invoiceNumber}</td>
                <td className="p-2 ">{row.invoiceAmount}</td>
                <td className="p-2 ">{row.invoicedDate}</td>
                <td className="p-2  inline-flex gap-2">
                  <span>paid</span>
                </td>
                <td className="p-2  ">
                  <Button className="!bg-primary !text-white !border-none !mr-3 !font-[gilroy-regular] rounded-md">
                    Download Reciept <DownloadOutlined/>
                  </Button>
                </td>
                <td className="p-2 ">{row.taskStatus}</td>
                <td className="p-2 ">{row.taskLink}</td>
                <td className="p-2 ">{row.taskName}</td>
                <td className="p-2 ">{row.userEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Paid;
