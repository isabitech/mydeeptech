import React from 'react';
import { Card, Typography, Divider, Button } from 'antd';
import { ArrowLeftOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/deeptech.png';

const { Title, Paragraph, Text } = Typography;

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 font-[gilroy-regular]">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 font-[gilroy-regular]">
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
              <FileTextOutlined className="text-3xl text-[#F6921E]" />
            </div>
            <Title level={1} className="text-gray-800 mb-2 !font-[gilroy-bold]">Terms of Service</Title>
            <Text className="text-gray-600 !font-[gilroy-regular]">
              Effective Date: November 23, 2025 | Last Updated: November 23, 2025
            </Text>
          </div>

          <Divider />

          {/* Agreement */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 flex items-center gap-2 font-[gilroy-regular]">
              <CheckCircleOutlined className="text-[#F6921E]" />
              Agreement to Terms
            </Title>
            <Paragraph className="text-gray-700 text-base leading-relaxed font-[gilroy-regular]">
              These Terms of Service ("Terms") govern your use of MyDeep Technologies LTD's ("MyDeepTech," "we," "us," or "our") platform and services. By accessing or using our platform, you agree to be bound by these Terms and our Privacy Policy.
            </Paragraph>
            <Paragraph className="text-gray-700 text-base leading-relaxed font-[gilroy-regular]">
              If you do not agree to these Terms, please do not use our services.
            </Paragraph>
          </section>

          {/* Description of Service */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Description of Service</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              MyDeepTech provides a platform that connects freelancers with opportunities in:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>AI training and data annotation projects</li>
              <li>Text labeling and image classification tasks</li>
              <li>Remote work opportunities in technology</li>
              <li>Skills assessment and verification</li>
              <li>Payment processing and project management</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">User Accounts</Title>
            
            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Registration</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must be at least 18 years old to use our services</li>
              <li>One account per person is permitted</li>
            </ul>

            <Title level={3} className="text-gray-700">Account Responsibilities</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Keep your login credentials confidential</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Update your information to keep it current</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          {/* User Conduct */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">User Conduct</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              You agree not to:
            </Paragraph>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Violate any laws or regulations</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Interfere with the platform's operation or security</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to access our services</li>
              <li>Share your account credentials with others</li>
              <li>Engage in any activity that could damage our reputation</li>
            </ul>
          </section>

          {/* Project Work */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Project Work and Quality Standards</Title>
            
            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Work Requirements</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Complete all assigned tasks with care and accuracy</li>
              <li>Meet project deadlines and quality standards</li>
              <li>Follow project guidelines and instructions</li>
              <li>Submit original work only</li>
              <li>Maintain confidentiality of project information</li>
            </ul>

            <Title level={3} className="text-gray-700">Quality Assurance</Title>
            <Paragraph className="text-gray-700">
              All work is subject to quality review. Work that does not meet our standards may be rejected, and payment may be withheld until corrections are made.
            </Paragraph>
          </section>

          {/* Payments */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Payments and Compensation</Title>
            
            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Payment Terms</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Payments are made according to project completion schedules</li>
              <li>All work must be approved before payment is released</li>
              <li>Payment methods and schedules are specified per project</li>
              <li>We may withhold payment for work that violates these Terms</li>
            </ul>

            <Title level={3} className="text-gray-700">Taxes and Compliance</Title>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>You are responsible for your own tax obligations</li>
              <li>We may be required to report payments to tax authorities</li>
              <li>Provide accurate tax information when requested</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Intellectual Property</Title>
            
            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Platform Content</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              Our platform, including its design, functionality, and content, is protected by intellectual property laws and owned by MyDeepTech or our licensors.
            </Paragraph>

            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Work Product</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              Work completed on our platform may be subject to specific intellectual property arrangements as outlined in individual project agreements.
            </Paragraph>
          </section>

          {/* Privacy and Data */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Privacy and Data Protection</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information. By using our services, you consent to our privacy practices.
            </Paragraph>
          </section>

          {/* Termination */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Account Termination</Title>
            
            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Termination by You</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              You may terminate your account at any time by contacting us. Upon termination, you remain responsible for any outstanding obligations.
            </Paragraph>

            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Termination by Us</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We may terminate or suspend your account if you violate these Terms or for any other reason at our discretion. We will provide reasonable notice when possible.
            </Paragraph>
          </section>

          {/* Disclaimers */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Disclaimers and Limitations</Title>
            
            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Service Availability</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We strive to maintain service availability but do not guarantee uninterrupted access. Our services are provided "as is" without warranties of any kind.
            </Paragraph>

            <Title level={3} className="text-gray-700 font-[gilroy-regular]">Limitation of Liability</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              To the maximum extent permitted by law, MyDeepTech shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
            </Paragraph>
          </section>

          {/* Governing Law */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Governing Law and Disputes</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              These Terms are governed by the laws of Nigeria. Any disputes will be resolved through binding arbitration in accordance with Nigerian law.
            </Paragraph>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800 font-[gilroy-regular]">Changes to Terms</Title>
            <Paragraph className="text-gray-700 font-[gilroy-regular]">
              We may update these Terms from time to time. We will notify you of significant changes and update the "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the new Terms.
            </Paragraph>
          </section>

          {/* Contact Information */}
          <section className="mb-8 font-[gilroy-regular]">
            <Title level={2} className="text-gray-800">Contact Information</Title>
            <Paragraph className="text-gray-700">
              If you have questions about these Terms, please contact us:
            </Paragraph>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-gray-700">
                <div><strong>Email:</strong> legalcompliance@mydeeptech.ng</div>
                <div><strong>Support:</strong> support@mydeeptech.ng</div>
                <div><strong>Address:</strong> MyDeep Technologies LTD</div>
                <div><strong>Website:</strong> www.mydeeptech.ng</div>
              </div>
            </div>
          </section>

          <Divider />

          {/* Footer */}
          <div className="text-center py-4">
            <Text className="text-gray-500 text-sm">
              © 2025 MyDeep Technologies LTD. All rights reserved.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;