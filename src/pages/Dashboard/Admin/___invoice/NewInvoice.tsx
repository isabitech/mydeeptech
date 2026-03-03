import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useInvoiceContext, Invoice } from "./invoiceContext";

const NewInvoice = () => {
  const navigate = useNavigate();
  const { addInvoice } = useInvoiceContext();

  const [formData, setFormData] = useState<Omit<Invoice, "_id">>({
    name: "",
    amount: 0,
    email: "",
    duration: "Monthly",
    due_date: "",
    description: "",
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  return (
    <div className="h-full flex flex-col gap-8 font-[gilroy-regular] p-4 md:p-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-[gilroy-bold]">
          Create New Invoice
        </h1>
        <p className="text-gray-500 text-sm">
          Fill in the invoice details below
        </p>
      </div>

      {/* Client Info */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-medium text-gray-700">
          Partner Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Partner Name</label>
            <input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2"
              placeholder="e.g. John Doe / Company Name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2"
              placeholder="partner@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Amount (EUR)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) })
              }
              className="border border-gray-300 rounded-lg px-4 py-2"
              placeholder="500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
            >
              <option value="One-time">One-time</option>
              <option value="Weekly">Weekly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Half-yearly">Half-yearly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Additional notes or service details..."
            rows={4}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            try {
              await addInvoice(formData);
              navigate("/admin/invoice-page");
            } catch (err) {
              // Error handled in context/toast
            }
          }}
          className="px-6 py-2 bg-primary text-white rounded-lg"
        >
          Create Invoice
        </button>
      </div>
    </div>
  );
};

export default NewInvoice;
