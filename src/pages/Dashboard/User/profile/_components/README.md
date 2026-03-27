# Profile Components

This directory contains the refactored Profile component broken down into smaller, reusable components. The original monolithic Profile.tsx (2000+ lines) has been split into logical, manageable pieces.

## Component Structure

### Main Components

- **PersonalInfoCard** - User avatar, basic info, edit/save/cancel buttons
- **SystemInfoCard** - Device, OS, webcam, microphone information  
- **PersonalDetailsForm** - Email, status, personal information form fields
- **DomainsSection** - Domain selection and management
- **PaymentInfoForm** - Main payment information container with currency selection
- **ProfessionalBackgroundForm** - Education, experience, and language preferences
- **SkillsExperienceForm** - Annotation skills and tool experience
- **DocumentAttachmentsForm** - Resume and ID document upload management

### Payment Form Components (`./payment/`)

Currency-specific payment form components:

- **NGNPaymentForm** - Nigerian Naira with Paystack verification
- **USDPaymentForm** - US Dollar with multiple payment methods (PayPal, Wise, Bank Transfer, Crypto)
- **EURPaymentForm** - Euro with IBAN and SEPA transfers
- **GBPPaymentForm** - British Pound with sort codes
- **ZARPaymentForm** - South African Rand with local banks
- **KESPaymentForm** - Kenyan Shilling with MPESA integration
- **OtherCurrencyPaymentForm** - Generic form for other currencies

## Refactoring Benefits

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Components can be reused across different parts of the application
3. **Testing** - Easier to unit test individual components
4. **Code Review** - Smaller, focused components are easier to review
5. **Performance** - Only relevant components re-render when data changes
6. **Developer Experience** - Easier to find and modify specific functionality

## Usage

```tsx
import {
  PersonalInfoCard,
  SystemInfoCard, 
  PersonalDetailsForm,
  PaymentInfoForm,
  // ... other components
} from './_components';

// Or import directly
import PersonalInfoCard from './_components/PersonalInfoCard';
```

## Type Definitions

Shared types are defined in `../types.ts`:
- `Domain` - Domain object structure
- Payment-related types are imported from their respective hook files

## Key Features Preserved

- All original functionality maintained
- Form validation rules preserved  
- Payment method verification (especially NGN with Paystack)
- File upload handling
- Country/timezone auto-selection
- Domain management
- All error handling and notifications

## File Organization

```
_components/
├── index.ts                    # Component exports
├── PersonalInfoCard.tsx
├── SystemInfoCard.tsx  
├── PersonalDetailsForm.tsx
├── DomainsSection.tsx
├── PaymentInfoForm.tsx
├── ProfessionalBackgroundForm.tsx
├── SkillsExperienceForm.tsx
├── DocumentAttachmentsForm.tsx
└── payment/                    # Payment method components
    ├── NGNPaymentForm.tsx
    ├── USDPaymentForm.tsx
    ├── EURPaymentForm.tsx  
    ├── GBPPaymentForm.tsx
    ├── ZARPaymentForm.tsx
    ├── KESPaymentForm.tsx
    └── OtherCurrencyPaymentForm.tsx
```