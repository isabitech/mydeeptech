import React, { useState } from 'react';
import { Button, Card, Typography, Steps, Space, Tag, Alert } from 'antd';
import { 
  PlayCircleOutlined, 
  VideoCameraOutlined, 
  CheckCircleOutlined,
  ArrowRightOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import VideoReelMarketplace from '../../components/Assessment/VideoReelMarketplace';
import ConversationBuilder from '../../components/Assessment/ConversationBuilder';
import { VideoReel, MultimediaConversation } from '../../types/multimedia-assessment.types';

const { Title, Text } = Typography;
const { Step } = Steps;

// Mock data for demo purposes
const MOCK_VIDEO_REELS: VideoReel[] = [
  {
    _id: '1',
    title: 'Morning Coffee Routine',
    description: 'A peaceful morning coffee brewing process with aesthetic shots',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=600&fit=crop',
    niche: 'lifestyle',
    duration: 45,
    aspectRatio: 'portrait',
    metadata: {
      resolution: '720x1280',
      fileSize: 1024000,
      format: 'mp4'
    },
    uploadedBy: {
      _id: 'admin1',
      fullName: 'Demo Admin',
      email: 'admin@demo.com'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Tech Product Unboxing',
    description: 'Exciting unboxing experience of the latest smartphone with detailed features',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_640x360_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=600&fit=crop',
    niche: 'tech',
    duration: 60,
    aspectRatio: 'portrait',
    metadata: {
      resolution: '720x1280',
      fileSize: 2048000,
      format: 'mp4'
    },
    uploadedBy: {
      _id: 'admin1',
      fullName: 'Demo Admin',
      email: 'admin@demo.com'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '3',
    title: 'Fitness Workout Session',
    description: 'High-energy workout routine for beginners with clear instructions',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
    niche: 'fitness',
    duration: 90,
    aspectRatio: 'portrait',
    metadata: {
      resolution: '720x1280',
      fileSize: 3072000,
      format: 'mp4'
    },
    uploadedBy: {
      _id: 'admin1',
      fullName: 'Demo Admin',
      email: 'admin@demo.com'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '4',
    title: 'Cooking Recipe Tutorial',
    description: 'Step-by-step cooking process for a delicious pasta dish',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=600&fit=crop',
    niche: 'food',
    duration: 120,
    aspectRatio: 'portrait',
    metadata: {
      resolution: '720x1280',
      fileSize: 4096000,
      format: 'mp4'
    },
    uploadedBy: {
      _id: 'admin1',
      fullName: 'Demo Admin',
      email: 'admin@demo.com'
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

type DemoStep = 'intro' | 'reel-selection' | 'conversation-building' | 'complete';

const MultimediaAssessmentDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<DemoStep>('intro');
  const [selectedReel, setSelectedReel] = useState<VideoReel | null>(null);
  const [createdConversation, setCreatedConversation] = useState<MultimediaConversation | null>(null);

  const handleReelSelection = (reel: VideoReel) => {
    setSelectedReel(reel);
    setCurrentStep('conversation-building');
  };

  const handleConversationSave = (conversation: MultimediaConversation) => {
    setCreatedConversation(conversation);
    setCurrentStep('complete');
  };

  const resetDemo = () => {
    setCurrentStep('intro');
    setSelectedReel(null);
    setCreatedConversation(null);
  };

  const getStepNumber = (step: DemoStep): number => {
    const steps = { 'intro': 0, 'reel-selection': 1, 'conversation-building': 2, 'complete': 3 };
    return steps[step];
  };

  const renderIntroStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto text-center space-y-8"
    >
      <div className="space-y-4">
        <Title level={1} className="!text-[#333333] font-[gilroy-regular]">
          🎬 Multimedia Assessment Demo
        </Title>
        <Text className="text-lg text-gray-600 font-[gilroy-regular] block max-w-2xl mx-auto">
          Experience the complete multimedia annotation assessment workflow. Create multi-turn conversations 
          using video segments and see how annotators will interact with the system.
        </Text>
      </div>

      <Alert
        message="Demo Mode Active"
        description="This is a frontend demo with mock data. The actual system will connect to your backend API with real video content and assessment management."
        type="info"
        showIcon
        className="text-left font-[gilroy-regular] max-w-2xl mx-auto"
      />

      <Card className="shadow-xl border-0 rounded-xl max-w-3xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <VideoCameraOutlined className="text-2xl text-[#F6921E]" />
              <Title level={4} className="!mb-0 !text-[#333333] font-[gilroy-regular]">
                Video Reel Selection
              </Title>
            </div>
            <Text className="text-gray-600 font-[gilroy-regular]">
              Browse and select from a marketplace of video reels across different niches like lifestyle, 
              tech, fitness, and food.
            </Text>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <PlayCircleOutlined className="text-2xl text-[#F6921E]" />
              <Title level={4} className="!mb-0 !text-[#333333] font-[gilroy-regular]">
                Conversation Building
              </Title>
            </div>
            <Text className="text-gray-600 font-[gilroy-regular]">
              Create engaging multi-turn conversations by combining user prompts with video segments 
              that represent AI responses.
            </Text>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={() => setCurrentStep('reel-selection')}
            className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
          >
            Start Demo Experience
          </Button>
        </div>
      </Card>

      <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
        {MOCK_VIDEO_REELS.map((reel, index) => (
          <Card key={reel._id} className="text-center border-0 shadow-md">
            <img
              src={reel.thumbnailUrl}
              alt={reel.title}
              className="w-full h-32 object-cover rounded mb-3"
            />
            <Tag color="#F6921E" className="mb-2">
              {reel.niche}
            </Tag>
            <Text strong className="block font-[gilroy-regular] text-sm">
              {reel.title}
            </Text>
          </Card>
        ))}
      </div>
    </motion.div>
  );

  const renderReelSelection = () => (
    <div>
      <div className="mb-6 text-center">
        <Button
          onClick={() => setCurrentStep('intro')}
          className="mb-4 font-[gilroy-regular]"
        >
          ← Back to Intro
        </Button>
        <Title level={2} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
          Select a Video Reel
        </Title>
        <Text className="text-gray-600 font-[gilroy-regular]">
          Choose a video reel to create your multi-turn conversation
        </Text>
      </div>

      <VideoReelMarketplace
        onSelectReel={handleReelSelection}
        selectedReels={selectedReel ? [selectedReel] : []}
        maxSelections={1}
        showSelectionCount={true}
      />
    </div>
  );

  const renderConversationBuilding = () => (
    <div>
      <div className="mb-6 text-center">
        <Button
          onClick={() => setCurrentStep('reel-selection')}
          className="mb-4 font-[gilroy-regular]"
        >
          ← Back to Reel Selection
        </Button>
      </div>

      {selectedReel && (
        <ConversationBuilder
          selectedReel={selectedReel}
          onSaveConversation={handleConversationSave}
        />
      )}
    </div>
  );

  const renderComplete = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto text-center space-y-8"
    >
      <div className="space-y-4">
        <CheckCircleOutlined className="text-6xl text-green-500" />
        <Title level={1} className="!text-[#333333] font-[gilroy-regular]">
          Demo Complete! 🎉
        </Title>
        <Text className="text-lg text-gray-600 font-[gilroy-regular] block">
          You've successfully experienced the multimedia assessment workflow.
        </Text>
      </div>

      {createdConversation && (
        <Card className="shadow-xl border-0 rounded-xl text-left">
          <Title level={3} className="!text-[#333333] font-[gilroy-regular]">
            Conversation Summary
          </Title>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Text strong className="font-[gilroy-regular]">Selected Video:</Text>
                <Text className="block font-[gilroy-regular]">{createdConversation.originalVideo.title}</Text>
              </div>
              <div>
                <Text strong className="font-[gilroy-regular]">Total Turns:</Text>
                <Text className="block font-[gilroy-regular]">{createdConversation.turns.length}</Text>
              </div>
              <div>
                <Text strong className="font-[gilroy-regular]">Starting Point:</Text>
                <Tag color="blue" className="font-[gilroy-regular]">
                  {createdConversation.startingPoint === 'prompt' ? 'User Prompt First' : 'Video First'}
                </Tag>
              </div>
              <div>
                <Text strong className="font-[gilroy-regular]">Total Duration:</Text>
                <Text className="block font-[gilroy-regular]">
                  {Math.floor(createdConversation.totalDuration / 60)}:{(createdConversation.totalDuration % 60).toFixed(0).padStart(2, '0')}
                </Text>
              </div>
            </div>

            <div className="space-y-3">
              <Text strong className="font-[gilroy-regular]">Conversation Turns:</Text>
              {createdConversation.turns.map((turn, index) => (
                <Card key={index} size="small" className="bg-gray-50">
                  <div className="space-y-2">
                    <div>
                      <Tag color="blue" >Turn {turn.turnNumber}</Tag>
                    </div>
                    <div>
                      <Text strong className="text-blue-600 font-[gilroy-regular]">User:</Text>
                      <Text className="block text-sm font-[gilroy-regular]">{turn.userPrompt}</Text>
                    </div>
                    <div>
                      <Text strong className="text-green-600 font-[gilroy-regular]">AI Response:</Text>
                      <Text className="block text-sm font-[gilroy-regular]">{turn.aiResponse.responseText}</Text>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
      )}

      <div className="space-x-4">
        <Button
          size="large"
          onClick={resetDemo}
          className="font-[gilroy-regular]"
        >
          Try Again
        </Button>
        <Button
          type="primary"
          size="large"
          onClick={() => window.location.href = '/dashboard'}
          className="bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
        >
          Back to Dashboard
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Progress Steps */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto p-6">
          <Steps 
            current={getStepNumber(currentStep)} 
            className="font-[gilroy-regular]"
          >
            <Step title="Introduction" />
            <Step title="Select Reel" />
            <Step title="Build Conversation" />
            <Step title="Complete" />
          </Steps>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {currentStep === 'intro' && renderIntroStep()}
        {currentStep === 'reel-selection' && renderReelSelection()}
        {currentStep === 'conversation-building' && renderConversationBuilding()}
        {currentStep === 'complete' && renderComplete()}
      </div>
    </div>
  );
};

export default MultimediaAssessmentDemo;