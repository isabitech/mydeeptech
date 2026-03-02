import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useInvoiceContext, Invoice, InvoiceItem } from "./invoiceContext";

const NewInvoice = () => {
  const navigate = useNavigate();
  const { addInvoice } = useInvoiceContext();

  const [formData, setFormData] = useState<Omit<Invoice, "id" | "amount" | "status" | "created" | "due">>({
    number: "",
    client: "",
    email: "",
    location: "",
    dueDate: "",
    items: [],
  });
  const [taxRate, setTaxRate] = useState(16);

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

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const handleDeleteItem = (index: number) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

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
          Client Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <input
            value={formData.number}
            onChange={(e) =>
              setFormData({ ...formData, number: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Invoice Number"
          />

          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2"
          />

          <input
            value={formData.client}
            onChange={(e) =>
              setFormData({ ...formData, client: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Client Name"
          />

          <input
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2"
            placeholder="Client Email"
          />
        </div>

        <textarea
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          className="w-full border border-gray-300 rounded-lg px-4 py-2"
          placeholder="Client Address"
        />
      </div>

      {/* Invoice Items */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-700">
            Invoice Items
          </h2>

          <button
            onClick={handleAddItem}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
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
              className="col-span-2 border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Description"
            />

            <input
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />

            <input
              type="number"
              value={item.rate}
              onChange={(e) =>
                handleItemChange(index, "rate", e.target.value)
              }
              className="border border-gray-300 rounded-lg px-3 py-2"
            />

            <div className="flex items-center gap-3">
              <div className="border border-gray-300 rounded-lg px-3 py-2 w-full text-right bg-gray-50">
                {formatCurrency(item.quantity * item.rate)}
              </div>

              <button
                onClick={() => handleDeleteItem(index)}
                className="text-red-500"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8 space-y-4">
        <h2 className="text-lg font-medium text-gray-700">
          Invoice Summary
        </h2>

        <div className="flex justify-between items-center">
          <span>Tax (%)</span>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value))}
            className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-right"
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
          className="px-6 py-2 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            const newInvoice: Invoice = {
              ...formData,
              id: Date.now(),
              amount: total.toFixed(2), // Store total as amount for the table
              status: "Pending",
              created: new Date().toLocaleDateString(),
              due: formData.dueDate,
            };

            addInvoice(newInvoice);
            navigate("/admin/invoice-page");
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