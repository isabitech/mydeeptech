import React from 'react';
import { AdminInvoice } from '../../types/admin-invoice-type';
import dayjs from 'dayjs';
import Logo from '../../assets/deeptech.png';

interface PaymentReceiptProps {
  invoice: AdminInvoice;
  companyInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ 
  invoice, 
  companyInfo = {
    name: "MyDeepTech Ltd",
    address: "Lagos, Nigeria",
    phone: "+234 000 000 0000",
    email: "support@mydeeptech.ng",
    website: "www.mydeeptech.ng"
  }
}) => {
  const receiptNumber = `RCP-${invoice.invoiceNumber?.replace('INV-', '') || invoice._id.slice(-6)}`;
  
  const getProjectName = (projectId: any): string => {
    if (typeof projectId === "string") return projectId;
    return projectId?.projectName || "Unknown Project";
  };

  const getDTUserName = (dtUserId: any): string => {
    if (typeof dtUserId === "string") return dtUserId;
    return dtUserId?.fullName || "Unknown User";
  };

  const getDTUserEmail = (dtUserId: any): string => {
    if (typeof dtUserId === "string") return "N/A";
    return dtUserId?.email || "N/A";
  };

  const getDTUserPhone = (dtUserId: any): string => {
    if (typeof dtUserId === "string") return "N/A";
    return dtUserId?.phone || "N/A";
  };

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Gilroy-Regular' }}>
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <img src={Logo} alt="MyDeepTech Logo" className="h-16 w-auto mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Gilroy-Bold', color: '#333333' }}>
                PAYMENT RECEIPT
              </h1>
              <p className="text-gray-600 mt-1">Receipt #{receiptNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block">
              <span className="font-semibold">PAID</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Generated on {dayjs().format('MMMM DD, YYYY')}
            </p>
          </div>
        </div>
      </div>

      {/* Company and Customer Information */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Company Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#F6921E]" style={{ fontFamily: 'Gilroy-Bold' }}>
            From:
          </h3>
          <div className="space-y-1">
            <p className="font-semibold text-gray-800">{companyInfo.name}</p>
            <p className="text-gray-600">{companyInfo.address}</p>
            <p className="text-gray-600">Phone: {companyInfo.phone}</p>
            <p className="text-gray-600">Email: {companyInfo.email}</p>
            {companyInfo.website && (
              <p className="text-gray-600">Website: {companyInfo.website}</p>
            )}
          </div>
        </div>

        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#F6921E]" style={{ fontFamily: 'Gilroy-Bold' }}>
            To:
          </h3>
          <div className="space-y-1">
            <p className="font-semibold text-gray-800">{getDTUserName(invoice.dtUserId)}</p>
            <p className="text-gray-600">Email: {getDTUserEmail(invoice.dtUserId)}</p>
            <p className="text-gray-600">Phone: {getDTUserPhone(invoice.dtUserId)}</p>
            <p className="text-gray-600">Project: {getProjectName(invoice.projectId)}</p>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Payment Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#F6921E]" style={{ fontFamily: 'Gilroy-Bold' }}>
            Payment Details:
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt Number:</span>
              <span className="font-medium">{receiptNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Number:</span>
              <span className="font-medium">{invoice.formattedInvoiceNumber || invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Date:</span>
              <span className="font-medium">
                {invoice.paidAt ? dayjs(invoice.paidAt).format('MMMM DD, YYYY') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">
                {invoice.paymentMethod ? invoice.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A'}
              </span>
            </div>
            {invoice.paymentReference && (
              <div className="flex justify-between">
                <span className="text-gray-600">Reference:</span>
                <span className="font-medium">{invoice.paymentReference}</span>
              </div>
            )}\n          </div>
        </div>

        {/* Work Information */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-[#F6921E]" style={{ fontFamily: 'Gilroy-Bold' }}>
            Work Details:
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Invoice Type:</span>
              <span className="font-medium">
                {invoice.invoiceType?.replace('_', ' ').toUpperCase() || 'N/A'}
              </span>
            </div>
            {invoice.hoursWorked && (
              <div className="flex justify-between">
                <span className="text-gray-600">Hours Worked:</span>
                <span className="font-medium">{invoice.hoursWorked}</span>
              </div>
            )}
            {invoice.tasksCompleted && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tasks Completed:</span>
                <span className="font-medium">{invoice.tasksCompleted}</span>
              </div>
            )}
            {invoice.qualityScore && (
              <div className="flex justify-between">
                <span className="text-gray-600">Quality Score:</span>
                <span className="font-medium">{invoice.qualityScore}%</span>
              </div>
            )}
            {invoice.workPeriodStart && invoice.workPeriodEnd && (
              <div className="flex justify-between">
                <span className="text-gray-600">Work Period:</span>
                <span className="font-medium">
                  {dayjs(invoice.workPeriodStart).format('MMM DD')} - {dayjs(invoice.workPeriodEnd).format('MMM DD, YYYY')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work Description */}
      {(invoice.description || invoice.workDescription) && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-[#F6921E]" style={{ fontFamily: 'Gilroy-Bold' }}>
            Description:
          </h3>
          {invoice.description && (
            <div className="mb-3">
              <h4 className="font-medium text-gray-700 mb-1">Invoice Description:</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">{invoice.description}</p>
            </div>
          )}
          {invoice.workDescription && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Work Description:</h4>
              <p className="text-gray-600 bg-gray-50 p-3 rounded">{invoice.workDescription}</p>
            </div>
          )}
        </div>
      )}

      {/* Amount Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 text-[#F6921E]" style={{ fontFamily: 'Gilroy-Bold' }}>
          Payment Summary:
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">{invoice.currency} {invoice.invoiceAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Taxes:</span>
            <span className="font-medium">{invoice.currency} 0.00</span>
          </div>
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-800">Total Paid:</span>
              <span className="text-2xl font-bold text-green-600">
                {invoice.currency} {(invoice.paidAmount || invoice.invoiceAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Notes */}
      {invoice.paymentNotes && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-[#F6921E]" style={{ fontFamily: 'Gilroy-Bold' }}>
            Payment Notes:
          </h3>
          <p className="text-gray-600 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            {invoice.paymentNotes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6 mt-8">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-green-600">
            Thank you for your excellent work!
          </p>
          <p className="text-gray-600">
            This receipt confirms that payment has been successfully processed.
          </p>
          <p className="text-sm text-gray-500">
            Generated automatically by MyDeepTech Payment System
          </p>
        </div>
        
        {/* Contact Information */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>For any questions regarding this receipt, please contact us:</p>
          <p>Email: {companyInfo.email} | Phone: {companyInfo.phone}</p>
          {companyInfo.website && <p>Website: {companyInfo.website}</p>}
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;