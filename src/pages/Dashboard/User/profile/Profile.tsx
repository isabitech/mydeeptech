import { Button, Form, Input, Select, Tag, Divider, Card, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Header from "../Header";
import { useState, useEffect } from "react";
import { useGetProfile } from "../../../../hooks/useGetProfile";
import { useUpdateProfile } from "../../../../hooks/useUpdateProfile";
import { useUserContext } from "../../../../UserContext";
import { retrieveUserInfoFromStorage } from "../../../../helpers";
import { notification } from "antd";
import { africanCountries } from "../../../../utils/africanCountries";
import { getTimezoneByCountry, getTimezoneDisplayName } from "../../../../utils/countryTimezoneMapping";

const Profile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [hasSelectedCountry, setHasSelectedCountry] = useState(false);
  const [form] = Form.useForm();

  const { userInfo, setUserInfo } = useUserContext();
  const { getProfile, loading, error, profile } = useGetProfile();
  const { updateProfile, loading: updateLoading, error: updateError } = useUpdateProfile();

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
        
        // Optionally refresh the profile data
        const refreshResult = await getProfile(userId);
        if (refreshResult.success) {
          console.log("✅ Profile refreshed after update");
        }
      } else {
        notification.error({
          message: "Update Failed",
          description: result.error || "Failed to update profile. Please try again.",
        });
      }
    } catch (error: any) {

      console.error("❌ Validation or update error:", error);
      notification.error({
        message: `Validation Error ${updateError ? "- Update Failed" : ""}`,
        description: "Please check all required fields and try again.",
      });
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
                <Form.Item label="Account Name" name="accountName">
                  <Input
                    disabled={!isEditable}
                    className="!font-[gilroy-regular]"
                    placeholder="Enter account name"
                  />
                </Form.Item>

                <Form.Item label="Account Number" name="accountNumber">
                  <Input
                    disabled={!isEditable}
                    className="!font-[gilroy-regular]"
                    placeholder="Enter account number"
                  />
                </Form.Item>

                <Form.Item label="Bank Name" name="bankName">
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
                      { value: "bank_transfer", label: "Bank Transfer" },
                      { value: "paypal", label: "PayPal" },
                      { value: "wise", label: "Wise" },
                      { value: "cryptocurrency", label: "Cryptocurrency" }
                    ]}
                  />
                </Form.Item>

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
                    <Input
                      disabled={!isEditable}
                      className="!font-[gilroy-regular]"
                      placeholder="Enter resume/CV URL or upload link"
                      addonAfter={
                        isEditable && (
                          <Upload
                            showUploadList={false}
                            beforeUpload={() => false} // Prevent auto upload
                            onChange={(info) => {
                              // Handle file selection - you can implement upload logic here
                              console.log('Resume file selected:', info.file.name);
                            }}
                          >
                            <Button 
                              icon={<UploadOutlined />} 
                              size="small"
                              disabled={!isEditable}
                            >
                              Upload
                            </Button>
                          </Upload>
                        )
                      }
                    />
                  </Form.Item>

                  <Form.Item label="ID Document" name="idDocumentUrl">
                    <Input
                      disabled={!isEditable}
                      className="!font-[gilroy-regular]"
                      placeholder="Enter ID document URL or upload link"
                      addonAfter={
                        isEditable && (
                          <Upload
                            showUploadList={false}
                            beforeUpload={() => false} // Prevent auto upload
                            onChange={(info) => {
                              // Handle file selection - you can implement upload logic here
                              console.log('ID document file selected:', info.file.name);
                            }}
                          >
                            <Button 
                              icon={<UploadOutlined />} 
                              size="small"
                              disabled={!isEditable}
                            >
                              Upload
                            </Button>
                          </Upload>
                        )
                      }
                    />
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
