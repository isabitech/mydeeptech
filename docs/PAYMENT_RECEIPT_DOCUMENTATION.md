# Payment Receipt Generator

This feature allows administrators to generate and download professional payment receipts for invoices in the payment management system.

## Features

- **Professional PDF Receipts**: Generate clean, branded receipts with company information
- **Automatic Formatting**: Includes all invoice details, payment information, and work descriptions
- **Download Functionality**: One-click PDF download with proper filename formatting
- **Preview Option**: Preview receipts before downloading (Paid invoices only)
- **Responsive Design**: Works on desktop and mobile devices

## Usage

### For Paid Invoices

1. Navigate to **Payment Management > Paid Invoices**
2. Find the invoice you want to generate a receipt for
3. Click the **PDF** button in the Actions column
4. The receipt will be automatically generated and downloaded

**Additional Options:**
- Click **Preview** to view the receipt before downloading
- Click **Print** from the preview modal to print directly

### For Recently Paid Invoices (Unpaid Tab)

1. Navigate to **Payment Management > Unpaid Invoices**
2. If an invoice has been marked as paid, a **Receipt** button will appear
3. Click **Receipt** to generate and download the PDF

## Receipt Content

Each receipt includes:

### Header Information
- Company logo and branding
- Receipt number (auto-generated)
- Payment status (PAID)
- Generation date

### Company Details
- MyDeepTech Ltd information
- Contact details
- Address

### Customer Information
- DTUser name and contact details
- Associated project information

### Payment Details
- Receipt and invoice numbers
- Payment date and method
- Transaction reference (if available)

### Work Information
- Invoice type
- Hours worked (if applicable)
- Tasks completed (if applicable)
- Quality score (if applicable)
- Work period dates

### Descriptions
- Invoice description
- Detailed work description
- Payment notes (if any)

### Payment Summary
- Itemized breakdown
- Subtotal and taxes
- **Total paid amount** (highlighted)

## File Naming Convention

Generated receipts follow this naming pattern:
```
Receipt-[Invoice-Number]-[YYYY-MM-DD].pdf
```

Example: `Receipt-INV-001234-2025-11-23.pdf`

## Technical Implementation

### Components Used
- `PaymentReceipt.tsx`: React component for receipt layout
- `receiptGenerator.ts`: Utility for PDF generation
- `html2canvas`: Converts HTML to canvas
- `jsPDF`: Generates PDF from canvas

### Dependencies
- `html2canvas`: ^1.4.1
- `jspdf`: ^2.5.1
- `@types/html2canvas`: ^1.0.0

### Integration Points
- **Paid.tsx**: Main paid invoices component with full receipt functionality
- **Unpaid.tsx**: Unpaid invoices component with conditional receipt generation
- **PaymentManagement.tsx**: Parent component managing both paid and unpaid views

## Styling

Receipts maintain consistent branding:
- **Primary Color**: #F6921E (MyDeepTech Orange)
- **Secondary Color**: #333333 (Dark Gray)
- **Typography**: Gilroy font family
- **Layout**: Professional business receipt format

## Error Handling

The system includes comprehensive error handling:
- Loading states during PDF generation
- User-friendly error messages
- Automatic cleanup of temporary elements
- Network error handling

## Browser Compatibility

- Chrome/Chromium browsers (recommended)
- Firefox
- Safari
- Edge

**Note**: Some older browsers may have limited support for advanced PDF generation features.

## Future Enhancements

Potential improvements:
- Email receipt functionality
- Bulk receipt generation
- Custom receipt templates
- Receipt history tracking
- Digital signature integration

## Troubleshooting

**Common Issues:**

1. **PDF not downloading**: Check browser pop-up blockers
2. **Blank PDF generated**: Ensure all invoice data is properly loaded
3. **Slow generation**: Large images or complex layouts may take time
4. **Print preview issues**: Use browser's native print function

**Development Notes:**
- Receipt generation is client-side only
- No server storage of generated receipts
- Temporary DOM elements are automatically cleaned up
- All styling is inline for PDF compatibility