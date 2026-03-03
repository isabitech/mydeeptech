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
    (inv) => inv._id === id
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
    pdf.save(`invoice-${invoice.name}.pdf`);
  };

  const handleSendToClient = () => {
    navigate(`/admin/invoice-page/${invoice._id}/send`, {
      state: { invoice },
    });
  };

  const total = invoice.amount;

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
              Invoice for {invoice.name}
            </h1>
            <p className="text-gray-500 text-sm">
              Created on {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
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
                navigate(`/admin/invoice-page/${invoice._id}/edit`, {
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
            <h3 className="mb-3 font-medium text-gray-600">Partner Details</h3>
            <p className="font-semibold text-lg">{invoice.name}</p>
            <p className="text-gray-600">{invoice.email}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="mb-3 font-medium text-gray-600">Invoice Details</h3>
            <p>
              <strong>Duration:</strong> {invoice.duration}
            </p>
            <p>
              <strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Description Section */}
        {invoice.description && (
          <div className="mb-8">
            <h3 className="mb-3 font-medium text-gray-600 border-b pb-2">Description / Notes</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
              {invoice.description}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-8">
          <div className="w-full sm:w-80 space-y-3">
            <div className="flex justify-between border-t pt-3 font-semibold text-xl">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;