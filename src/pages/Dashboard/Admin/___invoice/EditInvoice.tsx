import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

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
  dueDate: string;
  items: InvoiceItem[];
}

const EditInvoice = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const invoice = location.state?.invoice as Invoice | undefined;

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Invoice not found
      </div>
    );
  }

  const [formData, setFormData] = useState(invoice);
  const [taxRate, setTaxRate] = useState(16);

  // 🔹 Handle item change
  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string
  ) => {
    const updated = [...formData.items];
    updated[index] = {
      ...updated[index],
      [field]: field === "description" ? value : Number(value),
    };

    setFormData({ ...formData, items: updated });
  };

  // 🔹 Add new item
  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  // 🔹 Delete item
  const handleDeleteItem = (index: number) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  // 🔹 Calculations
  const subtotal = formData.items.reduce(
    (acc, item) => acc + item.quantity * item.rate,
    0
  );

  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(value);

 return (
  <div className="min-h-screen bg-gray-50 p-10">
    <div className="max-w-6xl mx-auto space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Invoice {formData.number}
        </h1>
        <p className="text-gray-500">
          Update the invoice details below
        </p>
      </div>

      {/* Client Info */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Client Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <input
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Invoice Number"
          />

          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <input
            value={formData.client}
            onChange={(e) =>
              setFormData({ ...formData, client: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Client Name"
          />

          <input
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Client Email"
          />
        </div>

        <textarea
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="Client Address"
        />
      </div>

      {/* Invoice Items */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Invoice Items
          </h2>

          <button
            onClick={handleAddItem}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            + Add Item
          </button>
        </div>

        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 items-center">
            <input
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
              className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
              placeholder="Description"
            />

            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
            />

            <input
              type="number"
              value={item.rate}
              onChange={(e) =>
                handleItemChange(index, "rate", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black"
            />

            <div className="flex items-center gap-3">
              <div className="border border-gray-300 rounded-lg px-3 py-2 w-full text-right bg-gray-50">
                {formatCurrency(item.quantity * item.rate)}
              </div>

              <button
                onClick={() => handleDeleteItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Invoice Summary
        </h2>

        <div className="flex justify-between items-center">
          <span>Tax (%)</span>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-right focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax ({taxRate}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between text-lg font-semibold border-t pt-4">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            console.log("Updated:", formData);
            navigate(-1);
          }}
          className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90"
        >
          Update Invoice
        </button>
      </div>

    </div>
  </div>
);
};

export default EditInvoice;