import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
}

interface Invoice {
  id: string;
  number: string;
  client: string;
  email: string;
  location: string;
  status: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
}
const SendInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const invoice = location.state?.invoice as Invoice | undefined;

  const [subject, setSubject] = useState(
    invoice ? `Invoice ${invoice.number} for Your Company` : "",
  );

  const [message, setMessage] = useState(
    invoice
      ? `Hi ${invoice.client},

Please find your invoice ${invoice.number} attached.

Let us know if you have any questions.

Best regards.`
      : "",
  );

  const [loading, setLoading] = useState(false);

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Invoice data not found.</p>
      </div>
    );
  }
  const subtotal = invoice.items.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0,
  );

  const tax = subtotal * 0.16;

  const total = subtotal + tax;
  const handleSend = async () => {
    try {
      setLoading(true);

      await fetch("/api/send-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT SIDE - EMAIL FORM */}
        <div className="p-10 border-r">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm text-gray-500 hover:underline"
          >
            ← Back
          </button>

          <h1 className="text-xl font-medium text-gray-800 mb-8">
            Send Invoice
          </h1>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Recipient Email
              </label>
              <input
                type="email"
                value={invoice.email}
                disabled
                className="w-full border rounded-lg px-4 py-2 text-sm font-light text-gray-500 bg-gray-50"
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
                className="w-full border rounded-lg px-4 py-2 text-sm font-light text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
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
                className="w-full border rounded-lg px-4 py-2 text-sm font-light text-gray-700 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSend}
                disabled={loading}
                className="px-5 py-2 bg-black text-white rounded-lg text-sm disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Invoice"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - INVOICE PREVIEW */}
        <div className="p-10 bg-gray-50">
          <h2 className="text-xs font-medium text-gray-500 mb-4">
            Invoice Preview
          </h2>

          <div className="bg-white border rounded-xl p-6 shadow-sm text-sm font-light text-gray-700 space-y-6">
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice #</span>
              <span>{invoice.number}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Client</span>
              <span>{invoice.client}</span>
            </div>

            <div className="border-t pt-4 space-y-2">
              {invoice.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>
                    {item.description} × {item.quantity}
                  </span>
                  <span>${(item.rate * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex justify-between font-medium">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendInvoice;
