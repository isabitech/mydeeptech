import { useState } from "react";

const InvoicePage = () => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const invoices = [
    {
      id: 1,
      number: "INV-1771351258045",
      client: "Thomas Sankara",
      amount: "€1,096.20",
      status: "Paid",
      created: "Feb 17, 2026",
      due: "Mar 19, 2026",
    },
    {
      id: 2,
      number: "INV-1771351258046",
      client: "Ada Lovelace",
      amount: "€500.00",
      status: "Pending",
      created: "Feb 20, 2026",
      due: "Mar 25, 2026",
    },
    {
      id: 3,
      number: "INV-1771351258047",
      client: "Alan Turing",
      amount: "€2,000.00",
      status: "Paid",
      created: "Feb 22, 2026",
      due: "Mar 27, 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
    {/* Header */}
    <div className="flex items-center justify-between mb-10">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p>Manage your invoices and track payments</p>
      </div>

      <button className="bg-black text-white px-4 py-2 rounded-lg font-medium transition">
        + New Invoice
      </button>
    </div>

    {/* Stats Section */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <div className=" p-6 rounded-2xl border border-zinc-800">
        <p className="text-sm mb-2">Total Revenue</p>
        <h2 className="text-2xl font-semibold">KSH 333,436.20</h2>
        <p className="text-sm mt-2">From 2 paid invoices</p>
      </div>

      <div className=" p-6 rounded-2xl border border-zinc-800">
        <p className="text-sm mb-2">Total Invoices</p>
        <h2 className="text-2xl font-semibold">{invoices.length}</h2>
        <p className="text-sm mt-2">All time invoices created</p>
      </div>

      <div className=" p-6 rounded-2xl border border-zinc-800">
        <p className="text-sm mb-2">Pending</p>
        <h2 className="text-2xl font-semibold">
          {invoices.filter((inv) => inv.status === "Pending").length}
        </h2>
        <p className="text-sm mt-2">Awaiting payment</p>
      </div>
    </div>

    {/* Recent Invoices */}
    <div>
      <h2 className="text-xl font-semibold mb-6">Recent Invoices</h2>

      <div className="rounded-2xl border border-zinc-800 overflow-x-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-zinc-800 text-gray-400 text-sm">
            <tr>
              <th className="p-4">Invoice #</th>
              <th className="p-4">Client</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => (
              <tr
                key={invoice.id}
                className=" border-zinc-800 transition"
              >
                <td className="p-4">{invoice.number}</td>
                <td className="p-4">{invoice.client}</td>
                <td className="p-4">{invoice.amount}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      invoice.status === "Paid"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>
                <td className="p-4">{invoice.created}</td>
                <td className="p-4">{invoice.due}</td>
                <td className="p-4 relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(
                        openDropdown === invoice.id ? null : invoice.id
                      )
                    }
                    className="px-2 py-1 hover:bg-zinc-200 rounded text-xl font-bold"
                  >
                    ⋯
                  </button>

            {openDropdown === invoice.id && (
              <div className="absolute  top-0 right-20 ml-2 bg-white  w-40 py-2  border border-zinc-800 rounded-xl shadow-lg z-10">
                <button className="block w-full text-left px-4 py-1 hover:bg-zinc-800 text-sm">
                  View invoice
                </button>
                <button className="block w-full text-left px-4 py-1 hover:bg-zinc-800 text-sm">
                  Send as Email
                </button>
                <button className="block w-full text-left px-4 py-1 hover:bg-zinc-800 text-sm text-green-400">
                  Mark as Draft
                </button>
                 <button className="block w-full text-left px-4 py-1 hover:bg-zinc-200 text-sm">
                  Cancel invoice
                </button>
                <button className="block w-full text-left px-4 py-1 hover:bg-zinc-800 text-sm text-red-400">
                  Delete
                </button>
              </div>
            )}
                </td>
              </tr>
            ))}
          </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;