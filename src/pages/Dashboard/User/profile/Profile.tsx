import { Form, Card } from "antd";
import profileService from "../../../../services/profile-service/profile-query.js";
import { useListAllNGNBanks } from "../../../../hooks/Auth/User/Paystack/useListAllNGNBanks";
import { useUserInfoStates } from "../../../../store/useAuthStore";

// Import custom hooks
import { useAccountVerification } from "./hooks/useAccountVerification";
import { useDomainManagement } from "./hooks/useDomainManagement";
import { useFileUploads } from "./hooks/useFileUploads";
import { useProfileActions } from "./hooks/useProfileActions";

// Import components
import PersonalInfoCard from "./_components/PersonalInfoCard";
import SystemInfoCard from "./_components/SystemInfoCard";
import PersonalDetailsForm from "./_components/PersonalDetailsForm";
import PaymentInfoForm from "./_components/PaymentInfoForm";
import ProfessionalBackgroundForm from "./_components/ProfessionalBackgroundForm";
import SkillsExperienceForm from "./_components/SkillsExperienceForm";
import DocumentAttachmentsForm from "./_components/DocumentAttachmentsForm";
import SystemInfoForm from "./_components/SystemInfoForm";
import ProfileLoading from "./_components/ProfileLoading";
import ProfileError from "./_components/ProfileError";
import ErrorMessage from "../../../../lib/error-message.js";

const Profile = () => {
  const [form] = Form.useForm();
  
  const { userInfo } = useUserInfoStates();
  // Get userId directly from userInfo
  const userId = userInfo?.id;

  const { profile, isProfileLoading, profileRefetch, isProfileError, profileError } = profileService.useGetProfile(userId);

  // Custom hooks
  const domainHooks = useDomainManagement(profile);
  
  // Watch form values for account verification
  const paymentCurrency = Form.useWatch("paymentCurrency", form);
  const paymentMethod = Form.useWatch("paymentMethod", form);
  const accountNumber = Form.useWatch("accountNumber", form);
  const bankCode = Form.useWatch("bankCode", form);

  // Profile actions hook (includes isEditing state)
  const profileActions = useProfileActions(
    profile,
    userId,
    profileRefetch,
    form,
    domainHooks.handleSaveDomains,
    domainHooks.initializeSelectedDomains
  );

  // Account verification hook using isEditing from profile actions
  const accountVerification = useAccountVerification(
    profileActions.isEditing,
    paymentCurrency,
    accountNumber,
    bankCode,
    form
  );

  // Create a wrapped handleSave that passes verification data
  const handleSaveWithVerification = () => {
    profileActions.handleSave(
      accountVerification.hasVerifiedAccount,
      accountVerification.verificationSuccess
    );
  };

  // File uploads hook
  const fileUploads = useFileUploads(userId, profileRefetch, form);

  // Update bank type import
  const { allNGNBanks } = useListAllNGNBanks();

  if (!userInfo?.id || isProfileLoading) {
    return <ProfileLoading />;
  }

  if (isProfileError || !profile) {
    const errorMessage = ErrorMessage(profileError?.message) || "Failed to load profile. Please try again.";
    return <ProfileError errorMessage={errorMessage} onRetry={profileRefetch} />;
  }

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <div className="mt-10 w-[90%] m-auto">
        <div className="w-full">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12">
              <PersonalInfoCard
                profile={profile}
                userInfo={userInfo}
                isEditing={profileActions.isEditing}
                updateLoading={profileActions.updateLoading}
                assignedDomains={domainHooks.assignedDomains}
                mergedDomains={domainHooks.mergedDomains}
                onEditClick={profileActions.handleEditClick}
                onSave={handleSaveWithVerification}
                onCancel={profileActions.handleCancel}
              />
              <SystemInfoCard profile={profile} />
            </div>

            <div className="col-span-12">
              <Form form={form} layout="vertical">
                <Card title="Personal Information" className="mb-6">
                  <PersonalDetailsForm
                    profile={profile}
                    userInfo={userInfo}
                    isEditing={profileActions.isEditing}
                    hasSelectedCountry={profileActions.hasSelectedCountry}
                    onCountryChange={profileActions.handleCountryChange}
                    assignedDomains={domainHooks.assignedDomains}
                    mergedDomains={domainHooks.mergedDomains}
                    selectedDomains={domainHooks.selectedDomains}
                    onDomainsChange={domainHooks.handleDomainsChange}
                  />
                </Card>

                <PaymentInfoForm
                  form={form}
                  isEditing={profileActions.isEditing}
                  paymentCurrency={paymentCurrency}
                  paymentMethod={paymentMethod}
                  accountNumber={accountNumber}
                  bankCode={bankCode}
                  isVerifying={accountVerification.isVerifying}
                  verificationSuccess={accountVerification.verificationSuccess}
                  verificationError={accountVerification.verificationError}
                  hasVerifiedAccount={accountVerification.hasVerifiedAccount}
                  allNGNBanks={allNGNBanks}
                  onManualVerification={accountVerification.handleManualVerification}
                  onVerificationRefetch={accountVerification.verificationRefetch}
                />

                <Card title="Professional Background" className="mb-6">
                  <ProfessionalBackgroundForm isEditing={profileActions.isEditing} />
                </Card>

                <Card title="System Information" className="mb-6">
                  <SystemInfoForm isEditing={profileActions.isEditing} />
                </Card>

                <SkillsExperienceForm isEditing={profileActions.isEditing} />

                <Card title="Document Attachments" className="mb-6">
                  <DocumentAttachmentsForm
                    profile={profile}
                    isEditing={profileActions.isEditing}
                    uploading={fileUploads.uploading}
                    onResumeUpload={fileUploads.handleResumeUpload}
                    onIdDocumentUpload={fileUploads.handleIdDocumentUpload}
                    onRemoveDocument={fileUploads.handleRemoveDocument}
                  />
                </Card>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
