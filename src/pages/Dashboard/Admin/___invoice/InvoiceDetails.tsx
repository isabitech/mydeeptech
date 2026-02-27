import { useParams, useNavigate, } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoice = {
    id: id || "1",
    number: "INV-1771351258045",
    client: "Thomas Sankara",
    email: "example@gmail.com",
    location: "Dublin, Ireland",
    status: "Paid",
    issueDate: "Feb 17, 2026",
    dueDate: "Mar 19, 2026",
    items: [
      { description: "Printers", quantity: 1, rate: 500 },
      { description: "WiFi routers", quantity: 5, rate: 89 },
    ],
  };
  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`invoice-${invoice?.number}.pdf`);
  };
//   const handleSendEmail = async () => {
//   try {
//     await fetch("/api/send-invoice", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         invoiceId: id,
//       }),
//     });

//     alert("Invoice sent successfully!");
//   } catch (error) {
//     alert("Failed to send invoice.");
//   }
// };
const subtotal = invoice.items.reduce(
  (acc, item) => acc + item.quantity * item.rate,
  0
);



  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

 return (
  <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6 md:p-8">
    <div
      ref={invoiceRef}
      className="w-full max-w-5xl mx-auto bg-white p-4 sm:p-6 md:p-10 rounded-2xl shadow-xl"
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 text-sm text-gray-500 hover:underline"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold break-words">
            Invoice {invoice.number}
          </h1>

          <span className="w-fit px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm">
            {invoice.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 w-full sm:w-auto"
          >
            Export PDF
          </button>

          <button
            onClick={() =>
              navigate(`/admin/invoice-page/${id}/send`, {
                state: { invoice },
              })
            }
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 w-full sm:w-auto"
          >
            Send to Client
          </button>

          <button
            onClick={() =>
              navigate(`/admin/invoice-page/${id}/edit`, {
                state: { invoice },
              })
            }
            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 w-full sm:w-auto"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Bill + Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border">
          <h3 className="mb-3 font-medium text-gray-600">Bill To</h3>
          <p className="font-semibold">{invoice.client}</p>
          <p className="break-words">{invoice.email}</p>
          <p>{invoice.location}</p>
        </div>

        <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border">
          <h3 className="mb-3 font-medium text-gray-600">Invoice Details</h3>
          <p>
            <strong>Issue Date:</strong> {invoice.issueDate}
          </p>
          <p>
            <strong>Due Date:</strong> {invoice.dueDate}
          </p>
        </div>
      </div>

      {/* Table Wrapper for Mobile Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 text-xs sm:text-sm text-gray-600 uppercase">
            <tr>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right">Qty</th>
              <th className="p-3 text-right">Rate</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-3">{item.description}</td>
                <td className="p-3 text-right">{item.quantity}</td>
                <td className="p-3 text-right">
                  {formatCurrency(item.rate)}
                </td>
                <td className="p-3 text-right font-medium">
                  {formatCurrency(item.quantity * item.rate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mt-8">
        <div className="w-full sm:w-80 space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax (16%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>

          <div className="flex justify-between border-t pt-3 font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default InvoiceDetails;
