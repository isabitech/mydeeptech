import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useState } from "react";
import { Invoice, useInvoiceContext } from "./invoiceContext";

const SendInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { invoices } = useInvoiceContext();

  const invoice = (location.state?.invoice as Invoice | undefined) ||
    invoices.find(inv => inv._id === id);

  const [subject, setSubject] = useState(
    invoice ? `Invoice for ${invoice.name}` : ""
  );

  const [message, setMessage] = useState(
    invoice
      ? `Hi ${invoice.name},
      
Please find your invoice for ${invoice.duration} service attached.

Let us know if you have any questions.

Best regards.`
      : ""
  );

  const [loading, setLoading] = useState(false);

  if (!invoice) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-gray-500">Invoice data not found.</p>
      </div>
    );
  }

  const total = invoice?.amount || 0;

  const handleSend = async () => {
    try {
      setLoading(true);

      await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice._id,
          subject,
          message,
        }),
      });

      alert("Invoice sent successfully!");
      navigate(-1);
    } catch (error) {
      alert("Failed to send invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 font-[gilroy-regular] p-4 md:p-8">

      {/* Page Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 text-sm text-gray-500 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-[gilroy-bold]">
          Send Invoice
        </h1>
        <p className="text-gray-500 text-sm">
          Review and send this invoice to the client
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT - EMAIL FORM */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={invoice.email}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-500 bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Message
            </label>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSend}
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-lg text-sm disabled:opacity-50 hover:opacity-90"
            >
              {loading ? "Sending..." : "Send Invoice"}
            </button>
          </div>
        </div>

        {/* RIGHT - INVOICE PREVIEW */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">

          <h2 className="text-sm font-medium text-gray-600">
            Invoice Preview
          </h2>

          <div className="space-y-4 text-sm text-gray-700">

            <div className="flex justify-between">
              <span className="text-gray-500">Partner</span>
              <span>{invoice.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span>{invoice.duration}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Due Date</span>
              <span>{new Date(invoice.due_date).toLocaleDateString()}</span>
            </div>

            <div className="border-t pt-4 flex justify-between font-semibold text-base">
              <span>Total Amount</span>
              <span>€{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendInvoice;