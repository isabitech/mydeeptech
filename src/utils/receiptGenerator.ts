import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import { AdminInvoice } from '../types/admin-invoice-type';

export interface ReceiptGenerationOptions {
  filename?: string;
  format?: 'a4' | 'letter';
  quality?: number;
  margin?: number;
}

/**
 * Generate and download a PDF receipt from an invoice
 */
export const generatePaymentReceipt = async (
  invoice: AdminInvoice,
  options: ReceiptGenerationOptions = {}
): Promise<void> => {
  const {
    filename = `Receipt-${invoice.invoiceNumber || invoice._id.slice(-6)}-${dayjs().format('YYYY-MM-DD')}.pdf`,
    format = 'a4',
    quality = 2,
    margin = 10
  } = options;

  try {
    // Create a temporary container for the receipt
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    
    // Generate receipt HTML content
    const receiptHTML = generateReceiptHTML(invoice);
    tempContainer.innerHTML = receiptHTML;
    
    document.body.appendChild(tempContainer);

    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate canvas from the HTML
    const canvas = await html2canvas(tempContainer, {
      useCORS: true,
      allowTaint: false,
      background: '#ffffff',
      logging: false,
      width: tempContainer.offsetWidth,
      height: tempContainer.offsetHeight,
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: format,
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate scaling to fit page with margins
    const scale = Math.min(
      (pdfWidth - 2 * margin) / (canvasWidth / 2),  // Use fixed scale factor of 2
      (pdfHeight - 2 * margin) / (canvasHeight / 2)
    );
    
    const imgWidth = (canvasWidth / 2) * scale;
    const imgHeight = (canvasHeight / 2) * scale;
    
    // Center the image
    const x = (pdfWidth - imgWidth) / 2;
    const y = margin;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(filename);
    
  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error('Failed to generate receipt PDF');
  }
};

/**
 * Generate HTML content for the receipt
 */
const generateReceiptHTML = (invoice: AdminInvoice): string => {
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

  return `
    <div style="
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
      font-family: Arial, sans-serif;
      background: white;
      color: #333;
    ">
      <!-- Header -->
      <div style="
        border-bottom: 3px solid #F6921E;
        padding-bottom: 30px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      ">
        <div>
          <h1 style="
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin: 0 0 10px 0;
          ">PAYMENT RECEIPT</h1>
          <p style="
            color: #666;
            margin: 0;
            font-size: 16px;
          ">Receipt #${receiptNumber}</p>
        </div>
        <div style="text-align: right;">
          <div style="
            background: #d4edda;
            color: #155724;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
            margin-bottom: 10px;
          ">PAID</div>
          <p style="
            color: #666;
            margin: 0;
            font-size: 14px;
          ">Generated on ${dayjs().format('MMMM DD, YYYY')}</p>
        </div>
      </div>

      <!-- Company and Customer Information -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-bottom: 40px;
      ">
        <!-- Company Information -->
        <div>
          <h3 style="
            font-size: 18px;
            font-weight: bold;
            color: #F6921E;
            margin-bottom: 15px;
          ">From:</h3>
          <div style="line-height: 1.6;">
            <p style="margin: 0 0 5px 0; font-weight: bold;">MyDeepTech Ltd</p>
            <p style="margin: 0 0 5px 0; color: #666;">Lagos, Nigeria</p>
            <p style="margin: 0 0 5px 0; color: #666;">Phone: +234 000 000 0000</p>
            <p style="margin: 0 0 5px 0; color: #666;">Email: support@mydeeptech.ng</p>
            <p style="margin: 0 0 5px 0; color: #666;">Website: www.mydeeptech.ng</p>
          </div>
        </div>

        <!-- Customer Information -->
        <div>
          <h3 style="
            font-size: 18px;
            font-weight: bold;
            color: #F6921E;
            margin-bottom: 15px;
          ">To:</h3>
          <div style="line-height: 1.6;">
            <p style="margin: 0 0 5px 0; font-weight: bold;">${getDTUserName(invoice.dtUserId)}</p>
            <p style="margin: 0 0 5px 0; color: #666;">Email: ${getDTUserEmail(invoice.dtUserId)}</p>
            <p style="margin: 0 0 5px 0; color: #666;">Phone: ${getDTUserPhone(invoice.dtUserId)}</p>
            <p style="margin: 0 0 5px 0; color: #666;">Project: ${getProjectName(invoice.projectId)}</p>
          </div>
        </div>
      </div>

      <!-- Payment Details -->
      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
        margin-bottom: 40px;
      ">
        <!-- Payment Information -->
        <div>
          <h3 style="
            font-size: 18px;
            font-weight: bold;
            color: #F6921E;
            margin-bottom: 15px;
          ">Payment Details:</h3>
          <div style="line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Receipt Number:</span>
              <span style="font-weight: bold;">${receiptNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Invoice Number:</span>
              <span style="font-weight: bold;">${invoice.formattedInvoiceNumber || invoice.invoiceNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Payment Date:</span>
              <span style="font-weight: bold;">
                ${invoice.paidAt ? dayjs(invoice.paidAt).format('MMMM DD, YYYY') : 'N/A'}
              </span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Payment Method:</span>
              <span style="font-weight: bold;">
                ${invoice.paymentMethod ? invoice.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A'}
              </span>
            </div>
            ${invoice.paymentReference ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Reference:</span>
                <span style="font-weight: bold;">${invoice.paymentReference}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Work Information -->
        <div>
          <h3 style="
            font-size: 18px;
            font-weight: bold;
            color: #F6921E;
            margin-bottom: 15px;
          ">Work Details:</h3>
          <div style="line-height: 1.8;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #666;">Invoice Type:</span>
              <span style="font-weight: bold;">
                ${invoice.invoiceType?.replace('_', ' ').toUpperCase() || 'N/A'}
              </span>
            </div>
            ${invoice.hoursWorked ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Hours Worked:</span>
                <span style="font-weight: bold;">${invoice.hoursWorked}</span>
              </div>
            ` : ''}
            ${invoice.tasksCompleted ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Tasks Completed:</span>
                <span style="font-weight: bold;">${invoice.tasksCompleted}</span>
              </div>
            ` : ''}
            ${invoice.qualityScore ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Quality Score:</span>
                <span style="font-weight: bold;">${invoice.qualityScore}%</span>
              </div>
            ` : ''}
            ${(invoice.workPeriodStart && invoice.workPeriodEnd) ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #666;">Work Period:</span>
                <span style="font-weight: bold;">
                  ${dayjs(invoice.workPeriodStart).format('MMM DD')} - ${dayjs(invoice.workPeriodEnd).format('MMM DD, YYYY')}
                </span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      ${(invoice.description || invoice.workDescription) ? `
        <!-- Work Description -->
        <div style="margin-bottom: 40px;">
          <h3 style="
            font-size: 18px;
            font-weight: bold;
            color: #F6921E;
            margin-bottom: 15px;
          ">Description:</h3>
          ${invoice.description ? `
            <div style="margin-bottom: 15px;">
              <h4 style="font-weight: bold; color: #333; margin-bottom: 8px;">Invoice Description:</h4>
              <p style="
                color: #666;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin: 0;
                line-height: 1.6;
              ">${invoice.description}</p>
            </div>
          ` : ''}
          ${invoice.workDescription ? `
            <div>
              <h4 style="font-weight: bold; color: #333; margin-bottom: 8px;">Work Description:</h4>
              <p style="
                color: #666;
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                margin: 0;
                line-height: 1.6;
              ">${invoice.workDescription}</p>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Amount Summary -->
      <div style="
        background: #f8f9fa;
        border-radius: 8px;
        padding: 30px;
        margin-bottom: 40px;
      ">
        <h3 style="
          font-size: 18px;
          font-weight: bold;
          color: #F6921E;
          margin-bottom: 20px;
        ">Payment Summary:</h3>
        <div style="line-height: 2;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Subtotal:</span>
            <span style="font-weight: bold;">${invoice.currency} ${invoice.invoiceAmount.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
            <span style="color: #666;">Taxes:</span>
            <span style="font-weight: bold;">${invoice.currency} 0.00</span>
          </div>
          <div style="
            border-top: 2px solid #ddd;
            padding-top: 15px;
            margin-top: 15px;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 20px; font-weight: bold; color: #333;">Total Paid:</span>
              <span style="
                font-size: 24px;
                font-weight: bold;
                color: #28a745;
              ">${invoice.currency} ${(invoice.paidAmount || invoice.invoiceAmount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      ${invoice.paymentNotes ? `
        <!-- Payment Notes -->
        <div style="margin-bottom: 40px;">
          <h3 style="
            font-size: 18px;
            font-weight: bold;
            color: #F6921E;
            margin-bottom: 15px;
          ">Payment Notes:</h3>
          <p style="
            color: #666;
            background: #e3f2fd;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #2196f3;
            margin: 0;
            line-height: 1.6;
          ">${invoice.paymentNotes}</p>
        </div>
      ` : ''}

      <!-- Footer -->
      <div style="
        border-top: 3px solid #F6921E;
        padding-top: 30px;
        margin-top: 40px;
        text-align: center;
      ">
        <div style="margin-bottom: 20px;">
          <p style="
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
            margin: 0 0 10px 0;
          ">Thank you for your excellent work!</p>
          <p style="
            color: #666;
            margin: 0 0 10px 0;
          ">This receipt confirms that payment has been successfully processed.</p>
          <p style="
            font-size: 14px;
            color: #999;
            margin: 0;
          ">Generated automatically by MyDeepTech Payment System</p>
        </div>
        
        <!-- Contact Information -->
        <div style="
          margin-top: 30px;
          font-size: 14px;
          color: #999;
          line-height: 1.6;
        ">
          <p style="margin: 0 0 5px 0;">For any questions regarding this receipt, please contact us:</p>
          <p style="margin: 0 0 5px 0;">Email: support@mydeeptech.ng | Phone: +234 000 000 0000</p>
          <p style="margin: 0;">Website: www.mydeeptech.ng</p>
        </div>
      </div>
    </div>
  `;
};