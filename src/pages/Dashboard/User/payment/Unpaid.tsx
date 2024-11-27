
const Unpaid = () => {
    const unpaid = [
        {
          id: 1,
          invoiceNumber: "001",
          invoiceAmount: "N150000",
          invoicedDate: "2024-12-01",
          guideline: "",
          taskLink: "",
        },
        {
          id: 2,
          invoiceNumber: "002",
          invoiceAmount: "N200000",
          invoicedDate: "2024-11-25",
          guideline: "",
          taskLink: "",
        },
        {
          id: 3,
          invoiceNumber: "003",
          invoiceAmount: "N300000",
          invoicedDate: "2024-12-10",
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
            Your Unpaid Jobs as at {todaysDate} {"-"} {month} {"-"} {year}{" "}
          </p>
          {/* Todays Task */}
          <div className="  w-full h-[70vh] overflow-y-auto flex flex-col gap-2 pt-4">
            <p className="text-primary">Unpaid Jobs</p>
    
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
                  <th className="p-2 font-normal">Status</th>
                </tr>
              </thead>
              <tbody className=" h-full overflow-auto">
                {/* Sample data rows */}
                {unpaid.map((row, index) => (
                  <tr className=" " key={row.id}>
                    <td className="p-2 ">{index + 1}</td>
                    <td className="p-2 ">{row.invoiceNumber}</td>
                    <td className="p-2 ">{row.invoiceAmount}</td>
                    <td className="p-2 ">{row.invoicedDate}</td>
                    <td className="p-2 flex ">
                     <span>Unpaid</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
}

export default Unpaid