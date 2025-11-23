import React from 'react';
import { Card, Typography, Divider, Button } from 'antd';
import { ArrowLeftOutlined, SafetyOutlined, LockOutlined, EyeOutlined, HomeOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/deeptech.png';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 !font-[gilroy-regular]">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:text-[#F6921E] border-none shadow-none"
          >
            Back
          </Button>
          
          <div className="flex items-center gap-3">
            <img src={Logo} alt="MyDeepTech" className="h-8 w-auto" />
            <span className="text-xl font-bold text-[#F6921E]">MyDeepTech</span>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#F6921E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafetyOutlined className="text-3xl text-[#F6921E]" />
            </div>
            <Title level={1} className="text-gray-800 mb-2 !font-[gilroy-bold]">Privacy Policy</Title>
            <Text className="text-gray-600 !font-[gilroy-regular]">
              Effective Date: September 26, 2025
            </Text>
          </div>

          <Divider />

          {/* Introduction */}
          <section className="mb-8 font-[gilroy-regular]">
            <Paragraph className="text-gray-700 text-base leading-relaxed font-[gilroy-regular]">
              MyDeep Technologies ("we," "our," "us") is committed to safeguarding your privacy and ensuring compliance with the Nigeria Data Protection Act, 2023 (NDPA) directives issued by the Nigeria Data Protection Commission (NDPC) and global best practices. This Privacy Policy explains how we collect, use, share, store, and protect personal data.
            </Paragraph>
          </section>

          {/* Identity & Contact Information */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 flex items-center gap-2 font-[gilroy-regular]">
              <HomeOutlined className="text-[#F6921E]" />
              Identity & Contact Information
            </Title>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 font-[gilroy-regular]">
              <div className="space-y-2 text-gray-700">
                <div><strong>Organization Name:</strong> MyDeep Technologies</div>
                <div className="flex items-center gap-2">
                  <HomeOutlined className="text-[#F6921E]" />
                  <span><strong>Address:</strong> Lagos, Nigeria</span>
                </div>
                <div><strong>Website:</strong> <a href="https://mydeeptech.ng" className="text-[#F6921E] hover:underline">https://mydeeptech.ng</a></div>
                <div className="flex items-center gap-2">
                  <MailOutlined className="text-[#F6921E]" />
                  <span><strong>Contact Email:</strong> <a href="mailto:privacy@mydeeptech.ng" className="text-[#F6921E] hover:underline">privacy@mydeeptech.ng</a></span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneOutlined className="text-[#F6921E]" />
                  <span><strong>Phone:</strong> +234 702 609 3593</span>
                </div>
              </div>
            </div>
          </section>

          {/* Scope */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Scope</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              This policy applies to all processing of personal data relating to:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Freelancers</li>
              <li>Users of our online platforms</li>
            </ul>
            <Paragraph className="text-gray-700">
              It applies to both online and offline data collection. We do not knowingly process data of individuals excluded by law, except with appropriate legal base and safeguards.
            </Paragraph>
          </section>

          {/* Personal Data Collected */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Personal Data Collected</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We may collect the following categories of personal data:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Name, address, phone number, email</li>
              <li>Automated data (cookies, usage logs, analytics)</li>
              <li>Sensitive personal data will only be processed with explicit consent or other lawful bases permitted by the NDPC</li>
            </ul>
          </section>

          {/* Legal Basis for Processing */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 flex items-center gap-2 font-[gilroy-regular]">
              <LockOutlined className="text-[#F6921E]" />
              Legal Basis for Processing
            </Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We process personal data under the following lawful bases:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Consent</li>
              <li>Contract performance</li>
              <li>Legal obligation</li>
              <li>Legitimate interest</li>
              <li>Vital interest</li>
              <li>Public interest / exercise of official authority</li>
            </ul>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <Text className="text-yellow-800">
                <strong>Note:</strong> Consent is obtained through affirmative action and recorded electronically. It can be withdrawn at any time by contacting{' '}
                <a href="mailto:privacy@mydeeptech.ng" className="text-[#F6921E] hover:underline">
                  privacy@mydeeptech.ng
                </a>
              </Text>
            </div>
          </section>

          {/* Purpose of Processing */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Purpose of Processing</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We process personal data for the following purposes:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Job offerings and recruitment services</li>
              <li>Marketing and promotional activities (with consent)</li>
              <li>Compliance with legal and regulatory obligations</li>
              <li>Secondary uses (e.g., analytics, profiling for marketing) are conducted only with specific, informed, and unambiguous consent</li>
            </ul>
          </section>

          {/* Data Sharing & Transfers */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Data Sharing & Transfers</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We may share data with:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Vendors, service providers, and affiliates (subject to binding agreements)</li>
              <li>Regulators and authorities, where required by law</li>
            </ul>

            <Title level={3} className="text-gray-700">International Transfer</Title>
            <Paragraph className="text-gray-700">
              We transfer data to service providers such as Google and LinkedIn located outside Nigeria. Transfers are conducted only to jurisdictions approved by the NDPC or subject to adequate safeguards, including Standard Contractual Clauses (SCCs) and other Cross-Border Transfer Instruments (CBTI).
            </Paragraph>
          </section>

          {/* Data Subject Rights */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 flex items-center gap-2 font-[gilroy-regular]">
              <EyeOutlined className="text-[#F6921E]" />
              Data Subject Rights
            </Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              You have the following rights under the NDPA:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Right to confirmation and access</li>
              <li>Right to rectification</li>
              <li>Right to erasure ('right to be forgotten')</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent at any time</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <Text className="text-blue-800">
                Requests must be submitted to{' '}
                <a href="mailto:privacy@mydeeptech.ng" className="text-[#F6921E] hover:underline">
                  privacy@mydeeptech.ng
                </a>
                . We will respond within 30 days. Where extension is necessary, we will notify you in writing.
              </Text>
            </div>
          </section>

          {/* Data Retention & Security */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Data Retention & Security</Title>
            
            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Retention Periods:</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Contact details:</strong> Reviewed annually (opt-out form sent)</li>
              <li><strong>Account data:</strong> 18 months of inactivity</li>
              <li><strong>Test/assessment results:</strong> 1 year</li>
              <li><strong>Communications:</strong> 1 year after resolution</li>
            </ul>
            <Paragraph className="text-gray-700">
              <strong>Criteria:</strong> Retention is based on minimum necessity for service provision, legal/regulatory obligations, NDPC guidance and other relevant laws.
            </Paragraph>

            <Title level={3} className="text-gray-700">Security Measures:</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Encryption and secure storage</li>
              <li>Staff training on data protection</li>
              <li>Access controls</li>
              <li>Periodic audits</li>
            </ul>

            <Title level={3} className="text-gray-700">Breach Response:</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Contain and investigate immediately</li>
              <li>Notify DPO immediately</li>
              <li>Risk assess and notify affected data subjects and NDPC within 72 hours of confirmation</li>
              <li>Implement corrective actions</li>
            </ul>
          </section>

          {/* Children & Vulnerable Persons */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Children & Vulnerable Persons</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>We only process data of individuals under 18 with verifiable parental/guardian consent</li>
              <li>Age verification is required during registration</li>
              <li>Safeguards include limited data collection, encryption, restricted access, and plain-language explanations</li>
            </ul>
          </section>

          {/* Cookies & Automated Decision-Making */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Cookies & Automated Decision-Making</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>We use cookies for analytics, performance, and user experience. Users are informed and may adjust preferences</li>
              <li><strong>Automated decision-making:</strong> Recruitment processes may include automated advancement based on test scores. Manual review is always available on request</li>
            </ul>
          </section>

          {/* Complaint Procedure */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Complaint Procedure</Title>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Text className="text-gray-700">
                  <strong>Internal Process:</strong>
                </Text>
                <ol className="list-decimal pl-6 mt-2 text-gray-700">
                  <li>Acknowledge within 7 working days</li>
                  <li>Investigate and respond within 30 days</li>
                </ol>
              </div>
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <Text className="text-red-800">
                  <strong>External Redress:</strong> File a complaint with the Nigeria Data Protection Commission (NDPC)
                </Text>
              </div>
            </div>
          </section>

          {/* Changes to Privacy Notice */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Changes to This Privacy Notice</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We may update this Privacy Notice periodically. Any changes will be communicated through updates to this page. Users are encouraged to review this Privacy Notice regularly to stay informed of our data handling practices.
            </Paragraph>
          </section>

          {/* Acknowledgment and Consent */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Acknowledgment and Consent</Title>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 font-[gilroy-regular]">
              <Paragraph className="text-green-800 mb-0 font-[gilroy-regular]">
                By using our services, you acknowledge that you have read and understood this Privacy Notice and agree to its terms.
              </Paragraph>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Contact Us</Title>
            <div className="bg-gray-50 p-4 rounded-lg font-[gilroy-regular]">
              <Text className="text-gray-700 font-[gilroy-regular]">
                For complaints or inquiries, contact:{' '}
                <a href="mailto:privacy@mydeeptech.ng" className="text-[#F6921E] hover:underline font-semibold font-[gilroy-regular]">
                  privacy@mydeeptech.ng
                </a>
              </Text>
            </div>
          </section>

          <Divider />

          {/* Footer */}
          <div className="text-center py-4">
            <Text className="text-gray-500 text-sm">
              © 2025 MyDeep Technologies. All rights reserved.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;