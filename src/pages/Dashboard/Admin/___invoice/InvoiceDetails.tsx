import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { useInvoiceContext } from "./invoiceContext";
const InvoiceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);

  const { invoices } = useInvoiceContext();

  const invoice = invoices.find(
    (inv) => inv.id.toString() === id
  );

  if (!invoice) {
    return <div className="p-8">Invoice not found</div>;
  }

  const handleExportPDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`invoice-${invoice.number}.pdf`);
  };

  const handleSendToClient = () => {
    navigate(`/admin/invoice-page/${invoice.id}/send`, {
      state: { invoice },
    });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      case "Draft":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const subtotal = invoice.items.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0,
  );

  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  return (
    <div className="h-full flex flex-col gap-6 font-[gilroy-regular] p-4 md:p-8">
      <div
        ref={invoiceRef}
        className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8"
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm text-gray-500 hover:underline"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-[gilroy-bold]">
              Invoice {invoice.number}
            </h1>
            <p className="text-gray-500 text-sm">
              Issued on {invoice.created}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Export PDF
            </button>

            <button
              onClick={() =>
                navigate(`/admin/invoice-page/${invoice.id}/edit`, {
                  state: { invoice },
                })
              }
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Edit Invoice
            </button>

            <button
              onClick={handleSendToClient}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Send to Client
            </button>
          </div>
        </div>

        {/* Client + Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="mb-3 font-medium text-gray-600">Bill To</h3>
            <p className="font-semibold">{invoice.client}</p>
            <p>{invoice.email}</p>
            <p>{invoice.location}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="mb-3 font-medium text-gray-600">Invoice Details</h3>
            <p>
              <strong>Issue Date:</strong> {invoice.created}
            </p>
            <p>
              <strong>Due Date:</strong> {invoice.dueDate}
            </p>
            <p className="flex items-center gap-2">
              <strong>Status:</strong>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                  invoice.status,
                )}`}
              >
                {invoice.status}
              </span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 text-xs text-gray-600 uppercase">
              <tr>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-right">Qty</th>
                <th className="p-4 text-right">Rate</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-4">{item.description}</td>
                  <td className="p-4 text-right">{item.quantity}</td>
                  <td className="p-4 text-right">
                    {formatCurrency(item.rate)}
                  </td>
                  <td className="p-4 text-right font-medium">
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
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tax (16%)</span>
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