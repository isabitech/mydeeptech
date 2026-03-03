import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useInvoiceContext, Invoice } from "./invoiceContext";

const EditInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const { invoices, updateInvoice } = useInvoiceContext();

  const initialInvoice = (location.state?.invoice as Invoice | undefined) ||
    invoices.find(inv => inv._id === id);

  if (!initialInvoice) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        Invoice not found
      </div>
    );
  }

  const [formData, setFormData] = useState<Invoice>(() => {
    if (initialInvoice.due_date) {
      return {
        ...initialInvoice,
        due_date: initialInvoice.due_date.split("T")[0],
      };
    }
    return initialInvoice;
  });

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      await updateInvoice(id, formData);
      navigate(-1);
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <div className="h-full flex flex-col gap-8 font-[gilroy-regular] p-4 md:p-8">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-[gilroy-bold]">
          Edit Invoice for {formData.name}
        </h1>
        <p className="text-gray-500 text-sm">
          Update the invoice details below
        </p>
      </div>

      {/* Partner Info */}
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
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Partner Name"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Partner Email"
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
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-600">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Description"
            rows={4}
          />
        </div>
      </div>


      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdate}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90"
        >
          Update Invoice
        </button>
      </div>
    </div>
  );
};

export default EditInvoice;