export { default as PersonalInfoCard } from './PersonalInfoCard';
export { default as SystemInfoCard } from './SystemInfoCard';
export { default as SystemInfoForm } from './SystemInfoForm';
export { default as PersonalDetailsForm } from './PersonalDetailsForm';
export { default as DomainsSection } from './DomainsSection';
export { default as PaymentInfoForm } from './PaymentInfoForm';
export { default as ProfessionalBackgroundForm } from './ProfessionalBackgroundForm';
export { default as SkillsExperienceForm } from './SkillsExperienceForm';
export { default as DocumentAttachmentsForm } from './DocumentAttachmentsForm';

// SystemInfoForm related exports
export { default as DetectionStatusAlert } from './DetectionStatusAlert';
export { default as DetectedFieldLabel } from './DetectedFieldLabel';
export { useDeviceDetection } from './hooks/useDeviceDetection';
export * from './utils/deviceDetectionUtils';

// Payment form exports
export { default as NGNPaymentForm } from './payment/NGNPaymentForm';
export { default as USDPaymentForm } from './payment/USDPaymentForm';
export { default as EURPaymentForm } from './payment/EURPaymentForm';
export { default as GBPPaymentForm } from './payment/GBPPaymentForm';
export { default as ZARPaymentForm } from './payment/ZARPaymentForm';
export { default as KESPaymentForm } from './payment/KESPaymentForm';
export { default as OtherCurrencyPaymentForm } from './payment/OtherCurrencyPaymentForm';