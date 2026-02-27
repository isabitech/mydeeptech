import { useParams, useNavigate } from "react-router-dom";

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const invoice = {
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-xl">

        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-500 hover:underline"
        >
          ← Back
        </button>

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-semibold">
            Invoice {invoice.number}
          </h1>

          <span className="px-4 py-1 bg-green-100 text-green-600 rounded-full text-sm">
            {invoice.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="mb-4 font-medium text-gray-600">Bill To</h3>
            <p className="font-semibold">{invoice.client}</p>
            <p>{invoice.email}</p>
            <p>{invoice.location}</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border">
            <h3 className="mb-4 font-medium text-gray-600">
              Invoice Details
            </h3>
            <p><strong>Issue Date:</strong> {invoice.issueDate}</p>
            <p><strong>Due Date:</strong> {invoice.dueDate}</p>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 text-sm text-gray-600 uppercase">
            <tr>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-right">Qty</th>
              <th className="p-4 text-right">Rate</th>
              <th className="p-4 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b">
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

        <div className="flex justify-end mt-8">
          <div className="w-80 space-y-3">
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