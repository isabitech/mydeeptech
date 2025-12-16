import { Button, Form, Input, Select, Tag, Divider, Card, Upload, Space } from "antd";
import { UploadOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import Header from "../Header";
import { useState, useEffect } from "react";
import { useGetProfile } from "../../../../hooks/useGetProfile";
import { useUpdateProfile } from "../../../../hooks/useUpdateProfile";
import { useUserContext } from "../../../../UserContext";
import { retrieveUserInfoFromStorage } from "../../../../helpers";
import { notification } from "antd";
import { africanCountries } from "../../../../utils/africanCountries";
import { getTimezoneByCountry, getTimezoneDisplayName } from "../../../../utils/countryTimezoneMapping";
import { baseURL, endpoints } from "../../../../store/api/endpoints";
import { useUploadFile } from "../../../../hooks/useUploadFile";

const Profile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [hasSelectedCountry, setHasSelectedCountry] = useState(false);
  const [form] = Form.useForm();

  const { userInfo, setUserInfo } = useUserContext();
  const { getProfile, loading, error, profile } = useGetProfile();
  const { updateProfile, loading: updateLoading, error: updateError } = useUpdateProfile();
  const { uploadFile, uploading } = useUploadFile();

  // Watch form values at the top level to avoid conditional hooks
  const paymentCurrency = Form.useWatch('paymentCurrency', form);
  const paymentMethod = Form.useWatch('paymentMethod', form);

  // Load user from storage (if not already in context)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await retrieveUserInfoFromStorage();
        console.log("User info from storage:", user);
        if (user) {
          setUserInfo(user);
          setUserId(user.id);
        }
      } catch (err) {
        console.error("⚠️ Error retrieving user info:", err);
      } finally {
        setUserLoaded(true);
      }
    };

    if (!userInfo?.id) {
      loadUser();
    } else {
      setUserId(userInfo.id);
      setUserLoaded(true);
    }
  }, [userInfo?.id, setUserInfo]);

  // Fetch profile when userId becomes available
const [hasFetchedProfile, setHasFetchedProfile] = useState(false);

useEffect(() => {
  if (!userId || hasFetchedProfile) return; // ✅ Only fetch if not fetched yet

  const fetchProfile = async () => {
    try {
      console.log("🚀 Fetching profile for userId:", userId);
      const result = await getProfile(userId);

      if (result.success) {
        form.setFieldsValue({
          fullName: result.data?.personalInfo?.fullName,
          phoneNumber: result.data?.personalInfo?.phoneNumber,
          country: result.data?.personalInfo?.country,
          timeZone: result.data?.personalInfo?.timeZone,
          availableHoursPerWeek: result.data?.personalInfo?.availableHoursPerWeek,
          preferredCommunicationChannel: result.data?.personalInfo?.preferredCommunicationChannel,
          accountName: result.data?.paymentInfo?.accountName,
          accountNumber: result.data?.paymentInfo?.accountNumber,
          bankName: result.data?.paymentInfo?.bankName,
          paymentMethod: result.data?.paymentInfo?.paymentMethod,
          paymentCurrency: result.data?.paymentInfo?.paymentCurrency,
          educationField: result.data?.professionalBackground?.educationField,
          yearsOfExperience: result.data?.professionalBackground?.yearsOfExperience,
          // Skills & Experience
          annotationSkills: result.data?.annotationSkills || [],
          toolExperience: result.data?.toolExperience || [],
          primaryLanguage: result.data?.languageProficiency?.primaryLanguage,
          englishFluencyLevel: result.data?.languageProficiency?.englishFluencyLevel,
          // Attachments
          resumeUrl: result.data?.attachments?.resumeUrl,
          idDocumentUrl: result.data?.attachments?.idDocumentUrl,
        });

        // Check if country is already selected and set state accordingly
        if (result.data?.personalInfo?.country) {
          setHasSelectedCountry(true);
          console.log("🔒 Country already selected, timezone field locked");
        }

        setHasFetchedProfile(true); // ✅ Mark as fetched
      } else {
        console.log("❌ Profile fetch error:", result.error);
      }
    } catch (err) {
      console.error("⚠️ Unexpected error fetching profile:", err);
    }
  };

  fetchProfile();
}, [userId, hasFetchedProfile, getProfile]);


  const handleEditToggle = () => {
    setIsEditable(!isEditable);
  };

  const handleCountryChange = (countryValue: string) => {
    // Auto-update timezone based on selected country
    const timezone = getTimezoneByCountry(countryValue);
    if (timezone) {
      const timezoneDisplayName = getTimezoneDisplayName(timezone);
      form.setFieldsValue({
        timeZone: timezoneDisplayName,
      });
      
      console.log(`🌍 Country changed to: ${countryValue}`);
      console.log(`⏰ Timezone auto-updated to: ${timezoneDisplayName}`);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log("💾 Saving profile:", values);

      if (!userId) {
        notification.error({
          message: "Error",
          description: "User ID not found. Please try logging in again.",
        });
        return;
      }

      // Prepare the payload according to the API structure
      const payload = {
        personalInfo: {
          country: values.country,
          timeZone: values.timeZone,
          availableHoursPerWeek: values.availableHoursPerWeek ? Number(values.availableHoursPerWeek) : undefined,
          preferredCommunicationChannel: values.preferredCommunicationChannel,
        },
        paymentInfo: {
          accountName: values.accountName,
          accountNumber: values.accountNumber,
          bankName: values.bankName,
          paymentMethod: values.paymentMethod,
          paymentCurrency: values.paymentCurrency,
        },
        professionalBackground: {
          educationField: values.educationField,
          yearsOfExperience: values.yearsOfExperience ? Number(values.yearsOfExperience) : undefined,
        },
        // Skills & Experience
        annotationSkills: values.annotationSkills || [],
        toolExperience: values.toolExperience || [],
        languageProficiency: {
          primaryLanguage: values.primaryLanguage,
          englishFluencyLevel: values.englishFluencyLevel,
        },
        // Attachments
        attachments: {
          resumeUrl: values.resumeUrl,
          idDocumentUrl: values.idDocumentUrl,
        },
      };

      // Remove undefined values to avoid sending empty data
      const cleanPayload = JSON.parse(JSON.stringify(payload));

      const result = await updateProfile(userId, cleanPayload);

      if (result.success) {
        notification.success({
          message: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditable(false);
        
        // Refresh the profile data to update UI with latest changes
        const refreshResult = await getProfile(userId);
        if (refreshResult.success) {
          console.log("✅ Profile refreshed after update");
          // Update form with fresh data
          form.setFieldsValue({
            fullName: refreshResult.data?.personalInfo?.fullName,
            phoneNumber: refreshResult.data?.personalInfo?.phoneNumber,
            country: refreshResult.data?.personalInfo?.country,
            timeZone: refreshResult.data?.personalInfo?.timeZone,
            availableHoursPerWeek: refreshResult.data?.personalInfo?.availableHoursPerWeek,
            preferredCommunicationChannel: refreshResult.data?.personalInfo?.preferredCommunicationChannel,
            accountName: refreshResult.data?.paymentInfo?.accountName,
            accountNumber: refreshResult.data?.paymentInfo?.accountNumber,
            bankName: refreshResult.data?.paymentInfo?.bankName,
            paymentMethod: refreshResult.data?.paymentInfo?.paymentMethod,
            paymentCurrency: refreshResult.data?.paymentInfo?.paymentCurrency,
            educationField: refreshResult.data?.professionalBackground?.educationField,
            yearsOfExperience: refreshResult.data?.professionalBackground?.yearsOfExperience,
            annotationSkills: refreshResult.data?.annotationSkills || [],
            toolExperience: refreshResult.data?.toolExperience || [],
            primaryLanguage: refreshResult.data?.languageProficiency?.primaryLanguage,
            englishFluencyLevel: refreshResult.data?.languageProficiency?.englishFluencyLevel,
            resumeUrl: refreshResult.data?.attachments?.resumeUrl,
            idDocumentUrl: refreshResult.data?.attachments?.idDocumentUrl,
          });
        }
      } else {
        notification.error({
          message: "Update Failed",
          description: result.data?.message || result.error || "Failed to update profile. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("❌ Validation or update error:", error);
      
      // Check if it's a validation error or API error
      if (error.errorFields && error.errorFields.length > 0) {
        // Form validation error
        notification.error({
          message: "Validation Error",
          description: "Please check all required fields and try again.",
        });
      } else {
        // API error or other errors
        const errorMessage = error.response?.data?.message || 
                            error.message || 
                            updateError || 
                            "An unexpected error occurred. Please try again.";
        
        notification.error({
          message: "Update Failed",
          description: errorMessage,
        });
      }
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    if (profile) {
      form.setFieldsValue({
        fullName: profile?.personalInfo?.fullName,
        phoneNumber: profile?.personalInfo?.phoneNumber,
        country: profile?.personalInfo?.country,
        timeZone: profile?.personalInfo?.timeZone,
        availableHoursPerWeek: profile?.personalInfo?.availableHoursPerWeek,
        preferredCommunicationChannel: profile?.personalInfo?.preferredCommunicationChannel,
        accountName: profile?.paymentInfo?.accountName,
        accountNumber: profile?.paymentInfo?.accountNumber,
        bankName: profile?.paymentInfo?.bankName,
        paymentMethod: profile?.paymentInfo?.paymentMethod,
        paymentCurrency: profile?.paymentInfo?.paymentCurrency,
        educationField: profile?.professionalBackground?.educationField,
        yearsOfExperience: profile?.professionalBackground?.yearsOfExperience,
        // Skills & Experience
        annotationSkills: profile?.annotationSkills || [],
        toolExperience: profile?.toolExperience || [],
        primaryLanguage: profile?.languageProficiency?.primaryLanguage,
        englishFluencyLevel: profile?.languageProficiency?.englishFluencyLevel,
        // Attachments
        resumeUrl: profile?.attachments?.resumeUrl,
        idDocumentUrl: profile?.attachments?.idDocumentUrl,
      });
    }
    setIsEditable(false);
  };

  const handleResumeUpload = async (file: File) => {
    if (file.size / 1024 / 1024 > 5) {
      notification.error({ 
        message: "File too large", 
        description: "Resume must be less than 5MB." 
      });
      return false;
    }

    try {
      const result = await uploadFile(file, endpoints.profileDT.uploadResume);
      if (result.success) {
        form.setFieldsValue({ resumeUrl: result.url });
        notification.success({ 
          message: "Resume uploaded", 
          description: "Resume uploaded successfully." 
        });
        // Refresh profile to update UI
        if (userId) {
          await getProfile(userId);
        }
      } else {
        notification.error({ 
          message: "Upload failed", 
          description: result.error || "Failed to upload resume"
        });
      }
    } catch (error) {
      notification.error({ 
        message: "Upload failed", 
        description: "An unexpected error occurred while uploading"
      });
    }
    return false;
  };

  const handleIdDocumentUpload = async (file: File) => {
    if (file.size / 1024 / 1024 > 5) {
      notification.error({ 
        message: "File too large", 
        description: "ID document must be less than 5MB." 
      });
      return false;
    }

    try {
      const result = await uploadFile(file, endpoints.profileDT.uploadIdDocument);
      if (result.success) {
        form.setFieldsValue({ idDocumentUrl: result.url });
        notification.success({ 
          message: "ID document uploaded", 
          description: "ID document uploaded successfully." 
        });
        // Refresh profile to update UI
        if (userId) {
          await getProfile(userId);
        }
      } else {
        notification.error({ 
          message: "Upload failed", 
          description: result.error || "Failed to upload ID document"
        });
      }
    } catch (error) {
      notification.error({ 
        message: "Upload failed", 
        description: "An unexpected error occurred while uploading"
      });
    }
    return false;
  };

  const handleViewDocument = (url: string, type: string) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      notification.warning({
        message: "No Document",
        description: `No ${type} has been uploaded yet.`
      });
    }
  };

  const handleRemoveDocument = (fieldName: string, documentType: string) => {
    form.setFieldsValue({ [fieldName]: '' });
    notification.success({
      message: "Document Removed",
      description: `${documentType} has been removed. Remember to save your changes.`
    });
  };

  if (!userLoaded || loading) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
        <Header title="Profile" />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
        <Header title="Profile" />
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">Error loading profile: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <Header title="Profile" />
      <div className="mt-10 w-[90%] m-auto">
        <div className="font-bold justify-start mb-6">
          <p className="text-lg">Profile</p>
          <hr />
        </div>

        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Personal Information Section */}
            <div className="lg:col-span-1">
              <Card title="Personal Information" className="mb-6">
                
                {/* Read-only fields */}
                <Form.Item label="Email">
                  <Input
                    disabled
                    value={profile?.email || userInfo?.email || ""}
                    className="!font-[gilroy-regular]"
                  />
                </Form.Item>

                <Form.Item label="Annotator Status ">
                  <div className="flex gap-2">
                    <Tag color={profile?.isEmailVerified ? "green" : "red"}>
                      {profile?.isEmailVerified ? "Email Verified" : "Email Not Verified"}
                    </Tag>
                    <Tag color={profile?.annotatorStatus === "verified" ? "green" : "orange"}>
                      {profile?.annotatorStatus || "Pending"}
                    </Tag>
                    <Tag color={profile?.microTaskerStatus === "approved"  ? "green" : "red"}>
                      {profile?.microTaskerStatus  ? "approved" : "pending"}
                    </Tag>
                  </div>
                </Form.Item>

                <Form.Item label="Domains">
                  <div className="flex flex-wrap gap-1">
                    {profile?.domains?.map((domain, index) => (
                      <Tag key={index} color="blue">{domain}</Tag>
                    )) || <span className="text-gray-500">No domains selected</span>}
                  </div>
                </Form.Item>

                {/* Read-only personal fields */}
                <Form.Item label="Full Name" name="fullName">
                  <Input
                    disabled={true}
                    className="!font-[gilroy-regular]"
                    placeholder="System managed"
                  />
                </Form.Item>

                <Form.Item label="Phone Number" name="phoneNumber">
                  <Input
                    disabled={true}
                    className="!font-[gilroy-regular]"
                    placeholder="System managed"
                  />
                </Form.Item>

                {/* Editable personal fields */}
                <Form.Item label="Country" name="country">
                  <Select
                    disabled={!isEditable}
                    className="!font-[gilroy-regular]"
                    placeholder="Select your country"
                    showSearch
                    onChange={handleCountryChange}
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={africanCountries}
                  />
                </Form.Item>

                <Form.Item label="Time Zone" name="timeZone">
                  <Input
                    disabled={!isEditable || hasSelectedCountry}
                    className="!font-[gilroy-regular]"
                    placeholder={hasSelectedCountry ? "Auto-set based on country" : "Enter your time zone"}
                  />
                </Form.Item>

                <Form.Item label="Available Hours per Week" name="availableHoursPerWeek">
                  <Input
                    type="number"
                    disabled={!isEditable}
                    className="!font-[gilroy-regular]"
                    placeholder="Enter available hours"
                  />
                </Form.Item>

                <Form.Item label="Preferred Communication" name="preferredCommunicationChannel">
                  <Select
                    disabled={!isEditable}
                    placeholder="Select communication channel"
                    options={[
                      { value: "email", label: "Email" },
                      { value: "slack", label: "Slack" },
                      { value: "discord", label: "Discord" },
                      { value: "teams", label: "Teams" }
                    ]}
                  />
                </Form.Item>
              </Card>
            </div>

            {/* Payment Information Section */}
            <div className="lg:col-span-1">
              <Card title="Payment Information" className="mb-6">
                <Form.Item label="Payment Currency" name="paymentCurrency">
                  <Select
                    disabled={!isEditable}
                    className="!font-[gilroy-regular]"
                    placeholder="Select payment currency first"
                    onChange={(value) => {
                      // Reset payment fields when currency changes
                      form.setFieldsValue({
                        accountName: '',
                        accountNumber: '',
                        bankName: '',
                        paymentMethod: ''
                      });
                    }}
                    options={[
                      { value: "NGN", label: "NGN - Nigerian Naira" },
                      { value: "USD", label: "USD - US Dollar" },
                      { value: "EUR", label: "EUR - Euro" },
                      { value: "GBP", label: "GBP - British Pound" },
                      { value: "CAD", label: "CAD - Canadian Dollar" },
                      { value: "AUD", label: "AUD - Australian Dollar" },
                      { value: "ZAR", label: "ZAR - South African Rand" },
                      { value: "KES", label: "KES - Kenyan Shilling" },
                      { value: "GHS", label: "GHS - Ghanaian Cedi" },
                      { value: "EGP", label: "EGP - Egyptian Pound" }
                    ]}
                  />
                </Form.Item>

                {/* Currency-specific forms */}
                {paymentCurrency && (
                  <>
                    {/* Nigerian Naira (NGN) Form */}
                    {paymentCurrency === 'NGN' && (
                      <>
                        <Form.Item label="Account Name" name="accountName" rules={[{ required: true, message: 'Account name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter account name as it appears on your bank"
                          />
                        </Form.Item>

                        <Form.Item label="Account Number" name="accountNumber" rules={[
                          { required: true, message: 'Account number is required' },
                          { pattern: /^\d{10}$/, message: 'Account number must be 10 digits' }
                        ]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter 10-digit account number"
                            maxLength={10}
                          />
                        </Form.Item>

                        <Form.Item label="Bank Name" name="bankName" rules={[{ required: true, message: 'Bank name is required' }]}>
                          <Select
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Select your bank"
                            showSearch
                            filterOption={(input, option) =>
                              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={[
                              { value: "Access Bank", label: "Access Bank" },
                              { value: "Fidelity Bank", label: "Fidelity Bank" },
                              { value: "First Bank of Nigeria", label: "First Bank of Nigeria" },
                              { value: "Guaranty Trust Bank", label: "Guaranty Trust Bank (GTBank)" },
                              { value: "United Bank for Africa", label: "United Bank for Africa (UBA)" },
                              { value: "Zenith Bank", label: "Zenith Bank" },
                              { value: "Ecobank Nigeria", label: "Ecobank Nigeria" },
                              { value: "Union Bank of Nigeria", label: "Union Bank of Nigeria" },
                              { value: "Stanbic IBTC Bank", label: "Stanbic IBTC Bank" },
                              { value: "Sterling Bank", label: "Sterling Bank" },
                              { value: "Wema Bank", label: "Wema Bank" },
                              { value: "Polaris Bank", label: "Polaris Bank" },
                              { value: "Kuda Bank", label: "Kuda Bank" },
                              { value: "VFD Microfinance Bank", label: "VFD Microfinance Bank" },
                              { value: "Opay", label: "Opay" },
                              { value: "PalmPay", label: "PalmPay" },
                              { value: "Moniepoint", label: "Moniepoint" }
                            ]}
                          />
                        </Form.Item>

                        <Form.Item label="Payment Method" name="paymentMethod">
                          <Select
                            disabled={!isEditable}
                            placeholder="Select payment method"
                            options={[
                              { value: "bank_transfer", label: "Bank Transfer" },
                              { value: "mobile_money", label: "Mobile Money" }
                            ]}
                          />
                        </Form.Item>
                      </>
                    )}

                    {/* US Dollar (USD) Form */}
                    {paymentCurrency === 'USD' && (
                      <>
                        <Form.Item label="Payment Method" name="paymentMethod" rules={[{ required: true, message: 'Payment method is required' }]}>
                          <Select
                            disabled={!isEditable}
                            placeholder="Select payment method"
                            onChange={(value) => {
                              // Reset fields when method changes
                              form.setFieldsValue({
                                accountName: '',
                                accountNumber: '',
                                bankName: ''
                              });
                            }}
                            options={[
                              { value: "paypal", label: "PayPal" },
                              { value: "wise", label: "Wise (formerly TransferWise)" },
                              { value: "bank_transfer", label: "US Bank Transfer" },
                              { value: "cryptocurrency", label: "Cryptocurrency" }
                            ]}
                          />
                        </Form.Item>

                        {paymentMethod === 'paypal' && (
                          <Form.Item label="PayPal Email" name="accountNumber" rules={[
                            { required: true, message: 'PayPal email is required' },
                            { type: 'email', message: 'Please enter a valid email' }
                          ]}>
                            <Input
                              disabled={!isEditable}
                              className="!font-[gilroy-regular]"
                              placeholder="Enter your PayPal email address"
                              type="email"
                            />
                          </Form.Item>
                        )}

                        {paymentMethod === 'wise' && (
                          <>
                            <Form.Item label="Wise Email" name="accountNumber" rules={[
                              { required: true, message: 'Wise email is required' },
                              { type: 'email', message: 'Please enter a valid email' }
                            ]}>
                              <Input
                                disabled={!isEditable}
                                className="!font-[gilroy-regular]"
                                placeholder="Enter your Wise email address"
                                type="email"
                              />
                            </Form.Item>
                            <Form.Item label="Account Holder Name" name="accountName" rules={[{ required: true, message: 'Account holder name is required' }]}>
                              <Input
                                disabled={!isEditable}
                                className="!font-[gilroy-regular]"
                                placeholder="Enter account holder name"
                              />
                            </Form.Item>
                          </>
                        )}

                        {paymentMethod === 'bank_transfer' && (
                          <>
                            <Form.Item label="Account Holder Name" name="accountName" rules={[{ required: true, message: 'Account holder name is required' }]}>
                              <Input
                                disabled={!isEditable}
                                className="!font-[gilroy-regular]"
                                placeholder="Enter full name on account"
                              />
                            </Form.Item>
                            <Form.Item label="Routing Number" name="accountNumber" rules={[
                              { required: true, message: 'Routing number is required' },
                              { pattern: /^\d{9}$/, message: 'Routing number must be 9 digits' }
                            ]}>
                              <Input
                                disabled={!isEditable}
                                className="!font-[gilroy-regular]"
                                placeholder="Enter 9-digit routing number"
                                maxLength={9}
                              />
                            </Form.Item>
                            <Form.Item label="Bank Name" name="bankName" rules={[{ required: true, message: 'Bank name is required' }]}>
                              <Input
                                disabled={!isEditable}
                                className="!font-[gilroy-regular]"
                                placeholder="Enter bank name"
                              />
                            </Form.Item>
                          </>
                        )}

                        {paymentMethod === 'cryptocurrency' && (
                          <>
                            <Form.Item label="Wallet Address" name="accountNumber" rules={[{ required: true, message: 'Wallet address is required' }]}>
                              <Input
                                disabled={!isEditable}
                                className="!font-[gilroy-regular]"
                                placeholder="Enter your wallet address"
                              />
                            </Form.Item>
                            <Form.Item label="Cryptocurrency Type" name="bankName" rules={[{ required: true, message: 'Cryptocurrency type is required' }]}>
                              <Select
                                disabled={!isEditable}
                                placeholder="Select cryptocurrency"
                                options={[
                                  { value: "Bitcoin (BTC)", label: "Bitcoin (BTC)" },
                                  { value: "Ethereum (ETH)", label: "Ethereum (ETH)" },
                                  { value: "USDT", label: "USDT" },
                                  { value: "USDC", label: "USDC" }
                                ]}
                              />
                            </Form.Item>
                          </>
                        )}
                      </>
                    )}

                    {/* Euro (EUR) Form */}
                    {paymentCurrency === 'EUR' && (
                      <>
                        <Form.Item label="Account Holder Name" name="accountName" rules={[{ required: true, message: 'Account holder name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter full name as on account"
                          />
                        </Form.Item>

                        <Form.Item label="IBAN" name="accountNumber" rules={[
                          { required: true, message: 'IBAN is required' },
                          { pattern: /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, message: 'Please enter a valid IBAN' }
                        ]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter IBAN (e.g., DE89370400440532013000)"
                            style={{ textTransform: 'uppercase' }}
                          />
                        </Form.Item>

                        <Form.Item label="Bank Name" name="bankName" rules={[{ required: true, message: 'Bank name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter bank name"
                          />
                        </Form.Item>

                        <Form.Item label="Payment Method" name="paymentMethod">
                          <Select
                            disabled={!isEditable}
                            placeholder="Select payment method"
                            options={[
                              { value: "sepa_transfer", label: "SEPA Transfer" },
                              { value: "wise", label: "Wise" },
                              { value: "paypal", label: "PayPal" }
                            ]}
                          />
                        </Form.Item>
                      </>
                    )}

                    {/* British Pound (GBP) Form */}
                    {paymentCurrency === 'GBP' && (
                      <>
                        <Form.Item label="Account Holder Name" name="accountName" rules={[{ required: true, message: 'Account holder name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter full name as on account"
                          />
                        </Form.Item>

                        <Form.Item label="Sort Code" name="accountNumber" rules={[
                          { required: true, message: 'Sort code is required' },
                          { pattern: /^\d{2}-\d{2}-\d{2}$/, message: 'Sort code format: XX-XX-XX' }
                        ]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter sort code (e.g., 12-34-56)"
                          />
                        </Form.Item>

                        <Form.Item label="Bank Name" name="bankName" rules={[{ required: true, message: 'Bank name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter bank name"
                          />
                        </Form.Item>

                        <Form.Item label="Payment Method" name="paymentMethod">
                          <Select
                            disabled={!isEditable}
                            placeholder="Select payment method"
                            options={[
                              { value: "bank_transfer", label: "UK Bank Transfer" },
                              { value: "wise", label: "Wise" },
                              { value: "paypal", label: "PayPal" }
                            ]}
                          />
                        </Form.Item>
                      </>
                    )}

                    {/* South African Rand (ZAR) Form */}
                    {paymentCurrency === 'ZAR' && (
                      <>
                        <Form.Item label="Account Holder Name" name="accountName" rules={[{ required: true, message: 'Account holder name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter account holder name"
                          />
                        </Form.Item>

                        <Form.Item label="Account Number" name="accountNumber" rules={[{ required: true, message: 'Account number is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter account number"
                          />
                        </Form.Item>

                        <Form.Item label="Bank Name" name="bankName" rules={[{ required: true, message: 'Bank name is required' }]}>
                          <Select
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Select your bank"
                            showSearch
                            options={[
                              { value: "ABSA Bank", label: "ABSA Bank" },
                              { value: "Standard Bank", label: "Standard Bank" },
                              { value: "First National Bank", label: "First National Bank (FNB)" },
                              { value: "Nedbank", label: "Nedbank" },
                              { value: "Capitec Bank", label: "Capitec Bank" },
                              { value: "Discovery Bank", label: "Discovery Bank" },
                              { value: "African Bank", label: "African Bank" }
                            ]}
                          />
                        </Form.Item>

                        <Form.Item label="Payment Method" name="paymentMethod">
                          <Select
                            disabled={!isEditable}
                            placeholder="Select payment method"
                            options={[
                              { value: "bank_transfer", label: "Bank Transfer" },
                              { value: "wise", label: "Wise" }
                            ]}
                          />
                        </Form.Item>
                      </>
                    )}

                    {/* Kenyan Shilling (KES) Form - MPESA */}
                    {paymentCurrency === 'KES' && (
                      <>
                        <Form.Item label="Full Name" name="accountName" rules={[{ required: true, message: 'Full name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter your full name as registered on MPESA"
                          />
                        </Form.Item>

                        <Form.Item label="MPESA Phone Number" name="accountNumber" rules={[
                          { required: true, message: 'MPESA phone number is required' },
                          { pattern: /^254[0-9]{9}$/, message: 'Please enter a valid Kenyan phone number (254XXXXXXXXX)' }
                        ]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter phone number (e.g., 254712345678)"
                            maxLength={12}
                          />
                        </Form.Item>

                        <Form.Item label="Payment Service" name="bankName">
                          <Select
                            disabled={true}
                            className="!font-[gilroy-regular]"
                            value="MPESA"
                            options={[
                              { value: "MPESA", label: "MPESA" }
                            ]}
                          />
                        </Form.Item>

                        <Form.Item label="Payment Method" name="paymentMethod">
                          <Select
                            disabled={true}
                            value="mobile_money"
                            options={[
                              { value: "mobile_money", label: "Mobile Money" }
                            ]}
                          />
                        </Form.Item>

                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-blue-800">MPESA Payment Information</h3>
                              <div className="mt-2 text-sm text-blue-700">
                                <p>• Ensure your phone number is registered with MPESA</p>
                                <p>• Use the format: 254XXXXXXXXX (country code + phone number)</p>
                                <p>• Payments will be sent directly to your MPESA account</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Generic form for other currencies */}
                    {!['NGN', 'USD', 'EUR', 'GBP', 'ZAR', 'KES'].includes(paymentCurrency) && paymentCurrency && (
                      <>
                        <Form.Item label="Account Holder Name" name="accountName" rules={[{ required: true, message: 'Account holder name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter account holder name"
                          />
                        </Form.Item>

                        <Form.Item label="Account Details" name="accountNumber" rules={[{ required: true, message: 'Account details are required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter account number or relevant details"
                          />
                        </Form.Item>

                        <Form.Item label="Bank/Institution Name" name="bankName" rules={[{ required: true, message: 'Bank name is required' }]}>
                          <Input
                            disabled={!isEditable}
                            className="!font-[gilroy-regular]"
                            placeholder="Enter bank or financial institution name"
                          />
                        </Form.Item>

                        <Form.Item label="Payment Method" name="paymentMethod">
                          <Select
                            disabled={!isEditable}
                            placeholder="Select payment method"
                            options={[
                              { value: "bank_transfer", label: "Bank Transfer" },
                              { value: "wise", label: "Wise" },
                              { value: "paypal", label: "PayPal" },
                              { value: "mobile_money", label: "Mobile Money" }
                            ]}
                          />
                        </Form.Item>
                      </>
                    )}
                  </>
                )}

                <Divider />

                {/* Professional Background */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Professional Background</h4>
                  
                  <Form.Item label="Education Field" name="educationField">
                    <Input
                      disabled={!isEditable}
                      className="!font-[gilroy-regular]"
                      placeholder="Enter your education field"
                    />
                  </Form.Item>

                  <Form.Item label="Years of Experience" name="yearsOfExperience">
                    <Input
                      type="number"
                      disabled={!isEditable}
                      className="!font-[gilroy-regular]"
                      placeholder="Enter years of experience"
                    />
                  </Form.Item>

                  <Form.Item label="Primary Language" name="primaryLanguage">
                    <Select
                      disabled={!isEditable}
                      className="!font-[gilroy-regular]"
                      placeholder="Select your primary language"
                      options={[
                        { value: "english", label: "English" },
                        { value: "french", label: "French" },
                        { value: "spanish", label: "Spanish" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item label="English Fluency Level" name="englishFluencyLevel">
                    <Select
                      disabled={!isEditable}
                      placeholder="Select English fluency level"
                      options={[
                        { value: "native", label: "Native" },
                        { value: "fluent", label: "Fluent" },
                        { value: "advanced", label: "Advanced" },
                        { value: "intermediate", label: "Intermediate" },
                        { value: "basic", label: "Basic" }
                      ]}
                    />
                  </Form.Item>
                </div>
              </Card>
            </div>

            {/* Skills & Experience Section */}
            <div className="lg:col-span-1">
              <Card title="Skills & Experience" className="mb-6">
                
                <Form.Item label="Annotation Skills" name="annotationSkills">
                  <Select
                    mode="multiple"
                    disabled={!isEditable}
                    className="!font-[gilroy-regular]"
                    placeholder="Select annotation skills"
                    options={[
                      { value: "sentiment_analysis", label: "Sentiment Analysis" },
                      { value: "entity_recognition", label: "Entity Recognition" },
                      { value: "classification", label: "Classification" },
                      { value: "object_detection", label: "Object Detection" },
                      { value: "semantic_segmentation", label: "Semantic Segmentation" },
                      { value: "transcription", label: "Transcription" },
                      { value: "translation", label: "Translation" },
                      { value: "content_moderation", label: "Content Moderation" },
                      { value: "data_entry", label: "Data Entry" },
                      { value: "text_annotation", label: "Text Annotation" },
                      { value: "image_annotation", label: "Image Annotation" },
                      { value: "audio_annotation", label: "Audio Annotation" },
                      { value: "video_annotation", label: "Video Annotation" },
                      { value: "3d_annotation", label: "3D Annotation" },
                    ]}
                  />
                </Form.Item>

                <Form.Item label="Tool Experience" name="toolExperience">
                  <Select
                    mode="multiple"
                    disabled={!isEditable}
                    className="!font-[gilroy-regular]"
                    placeholder="Select tools you have experience with"
                    options={[
                      { value: "labelbox", label: "Labelbox" },
                      { value: "scale_ai", label: "Scale AI" },
                      { value: "appen", label: "Appen" },
                      { value: "clickworker", label: "Clickworker" },
                      { value: "mechanical_turk", label: "Amazon Mechanical Turk" },
                      { value: "toloka", label: "Toloka" },
                      { value: "remotasks", label: "Remotasks" },
                      { value: "annotator_tools", label: "Annotator Tools" },
                      { value: "custom_platforms", label: "Custom Platforms" },
                    ]}
                  />
                </Form.Item>

                <Divider />

                <div className="mt-6">
                  <h4 className="font-semibold mb-4">Document Attachments</h4>
                  

                  <Form.Item label="Resume/CV" name="resumeUrl">
                    <div className="flex gap-2">
                      <Input
                        disabled={!isEditable}
                        className="!font-[gilroy-regular] flex-1"
                        placeholder={
                          profile?.attachments?.resumeUrl 
                            ? "Resume uploaded successfully" 
                            : "No resume uploaded"
                        }
                        value={
                          profile?.attachments?.resumeUrl 
                            ? "Resume uploaded" 
                            : ""
                        }
                      />
                      {profile?.attachments?.resumeUrl && (
                        <Space>
                          <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDocument(profile.attachments.resumeUrl, "resume")}
                            title="View Resume"
                          >
                            View
                          </Button>
                          {isEditable && (
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              onClick={() => handleRemoveDocument('resumeUrl', 'Resume')}
                              title="Remove Resume"
                            >
                              Remove
                            </Button>
                          )}
                        </Space>
                      )}
                      {isEditable && (
                        <Upload
                          showUploadList={false}
                          beforeUpload={handleResumeUpload}
                          accept=".pdf,.doc,.docx"
                        >
                          <Button 
                            icon={<UploadOutlined />} 
                            size="small"
                            disabled={!isEditable}
                            loading={uploading}
                            title={profile?.attachments?.resumeUrl ? "Change Resume" : "Upload Resume"}
                          >
                            {profile?.attachments?.resumeUrl ? "Change" : "Upload"}
                          </Button>
                        </Upload>
                      )}
                    </div>
                  </Form.Item>


                  <Form.Item label="ID Document" name="idDocumentUrl">
                    <div className="flex gap-2">
                      <Input
                        disabled={!isEditable}
                        className="!font-[gilroy-regular] flex-1"
                        placeholder={
                          profile?.attachments?.idDocumentUrl 
                            ? "ID document uploaded successfully" 
                            : "No ID document uploaded"
                        }
                        value={
                          profile?.attachments?.idDocumentUrl 
                            ? "ID document uploaded" 
                            : ""
                        }
                      />
                      {profile?.attachments?.idDocumentUrl && (
                        <Space>
                          <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDocument(profile.attachments.idDocumentUrl, "ID document")}
                            title="View ID Document"
                          >
                            View
                          </Button>
                          {isEditable && (
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              onClick={() => handleRemoveDocument('idDocumentUrl', 'ID Document')}
                              title="Remove ID Document"
                            >
                              Remove
                            </Button>
                          )}
                        </Space>
                      )}
                      {isEditable && (
                        <Upload
                          showUploadList={false}
                          beforeUpload={handleIdDocumentUpload}
                          accept=".pdf,.jpg,.jpeg,.png"
                        >
                          <Button 
                            icon={<UploadOutlined />} 
                            size="small"
                            disabled={!isEditable}
                            loading={uploading}
                            title={profile?.attachments?.idDocumentUrl ? "Change ID Document" : "Upload ID Document"}
                          >
                            {profile?.attachments?.idDocumentUrl ? "Change" : "Upload"}
                          </Button>
                        </Upload>
                      )}
                    </div>
                  </Form.Item>
                </div>
              </Card>
            </div>

            {/* Profile Image and Actions */}
            <div className="lg:col-span-1">
              <div className="flex flex-col items-center gap-4">
                {/* Profile Avatar */}
                <div className="flex h-[6rem] w-[6rem] cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <span className="font-[gilroy-medium] font-bold text-2xl">
                    {profile?.personalInfo?.fullName?.split(' ').map(name => name.charAt(0)).join('') ||
                     userInfo?.fullName?.split(' ').map(name => name.charAt(0)).join('') || 
                     'U'}
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="font-semibold text-lg">
                    {profile?.personalInfo?.fullName || userInfo?.fullName || 'User Name'}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {profile?.annotatorStatus || 'Annotator'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  {isEditable ? (
                    <div className="flex gap-2">
                      <Button
                        className="!bg-[#E3E6EA] !text-[#666666] rounded-lg !font-[gilroy-regular] flex-1"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="!bg-[#096A95] !text-[#FFFFFF] rounded-lg !font-[gilroy-regular] flex-1"
                        onClick={handleSave}
                        loading={updateLoading}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="!bg-blue-500 !text-[#FFFFFF] rounded-lg !font-[gilroy-regular] w-full"
                      onClick={handleEditToggle}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>

                {/* System Information (Read-only) */}
                <Card title="System Information" className="w-full mt-4" size="small">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Device:</span>
                      <span>{profile?.systemInfo?.deviceType || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">OS:</span>
                      <span>{profile?.systemInfo?.operatingSystem || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Internet:</span>
                      <span>{profile?.systemInfo?.internetSpeedMbps ? `${profile.systemInfo.internetSpeedMbps} Mbps` : 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Webcam:</span>
                      <Tag color={profile?.systemInfo?.hasWebcam ? "green" : "red"}>
                        {profile?.systemInfo?.hasWebcam ? "Available" : "Not Available"}
                      </Tag>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Microphone:</span>
                      <Tag color={profile?.systemInfo?.hasMicrophone ? "green" : "red"}>
                        {profile?.systemInfo?.hasMicrophone ? "Available" : "Not Available"}
                      </Tag>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Profile;
