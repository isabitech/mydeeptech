import React, { useState } from 'react';
import { Card, Tabs, Typography, Button, Space, message, Badge, Avatar, Alert } from 'antd';
import { 
  PlayCircleOutlined, 
  BuildOutlined, 
  EyeOutlined,
  SettingOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import VideoReelMarketplace from './VideoReelMarketplace';
import ConversationBuilder from './ConversationBuilder';
import { AssessmentSession } from './AssessmentSession';
import { QAReviewDashboard } from './QAReviewDashboard';
import { AdminAssessmentManager } from './AdminAssessmentManager';
import { VideoReel, MultimediaConversation } from '../../types/multimedia-assessment.types';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Demo user roles
type UserRole = 'annotator' | 'qa_reviewer' | 'admin';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: 'annotator1',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    role: 'annotator',
  },
  {
    id: 'qa1',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'qa_reviewer',
  },
  {
    id: 'admin1',
    name: 'Jessica Rodriguez',
    email: 'jessica.rodriguez@example.com',
    role: 'admin',
  },
];

// Mock assessment ID for demo
const DEMO_ASSESSMENT_ID = 'demo-assessment-123';

// YouTube Shorts demo data with VPlayer integration
const MOCK_REELS: VideoReel[] = [
  // Fitness Category
  {
    _id: 'fitness_1',
    title: 'Ultimate Core Workout',
    description: 'Quick and effective core strengthening exercises for all fitness levels',
    videoUrl: 'https://www.youtube.com/shorts/hnAOu6PMhnY',
    thumbnailUrl: 'https://img.youtube.com/vi/hnAOu6PMhnY/maxresdefault.jpg',
    duration: 60,
    creatorInfo: {
      username: '@FitnessBlender',
      displayName: 'Fitness Blender',
      avatarUrl: 'https://via.placeholder.com/40/45B7D1/FFFFFF?text=FB',
      followerCount: 1200000,
      isVerified: true
    },
    niche: 'fitness',
    tags: ['core', 'workout', 'abs', 'fitness', 'exercise'],
    metrics: {
      viewCount: 125000,
      likeCount: 8900,
      commentCount: 234,
      shareCount: 567
    },
    uploadedAt: '2024-01-15T08:30:00Z',
    isAvailable: true,
    qualityScore: 4.8
  },
  {
    _id: 'fitness_2',
    title: 'Morning Stretch Routine',
    description: 'Perfect morning stretches to wake up your body and improve flexibility',
    videoUrl: 'https://www.youtube.com/shorts/n-c0aFZhnF8',
    thumbnailUrl: 'https://img.youtube.com/vi/n-c0aFZhnF8/maxresdefault.jpg',
    duration: 45,
    creatorInfo: {
      username: '@YogaWithAdriene',
      displayName: 'Yoga With Adriene',
      avatarUrl: 'https://via.placeholder.com/40/98D8C8/FFFFFF?text=YA',
      followerCount: 890000,
      isVerified: true
    },
    niche: 'fitness',
    tags: ['yoga', 'stretching', 'morning', 'flexibility', 'wellness'],
    metrics: {
      viewCount: 89000,
      likeCount: 6700,
      commentCount: 156,
      shareCount: 345
    },
    uploadedAt: '2024-01-14T06:15:00Z',
    isAvailable: true,
    qualityScore: 4.6
  },
  {
    _id: 'fitness_3',
    title: 'HIIT Cardio Blast',
    description: 'High-intensity interval training for maximum calorie burn in minimal time',
    videoUrl: 'https://www.youtube.com/shorts/EWhMxVsIfPY',
    thumbnailUrl: 'https://img.youtube.com/vi/EWhMxVsIfPY/maxresdefault.jpg',
    duration: 55,
    creatorInfo: {
      username: '@AthleanX',
      displayName: 'ATHLEAN-X',
      avatarUrl: 'https://via.placeholder.com/40/FF6B9D/FFFFFF?text=AX',
      followerCount: 1500000,
      isVerified: true
    },
    niche: 'fitness',
    tags: ['hiit', 'cardio', 'fat-burn', 'interval', 'training'],
    metrics: {
      viewCount: 203000,
      likeCount: 12400,
      commentCount: 445,
      shareCount: 789
    },
    uploadedAt: '2024-01-13T16:20:00Z',
    isAvailable: true,
    qualityScore: 4.9
  },
  {
    _id: 'fitness_4',
    title: 'Leg Day Essentials',
    description: 'Must-do leg exercises for building strength and muscle definition',
    videoUrl: 'https://www.youtube.com/shorts/W4Ezk6M-RjU',
    thumbnailUrl: 'https://img.youtube.com/vi/W4Ezk6M-RjU/maxresdefault.jpg',
    duration: 50,
    creatorInfo: {
      username: '@JeffNippard',
      displayName: 'Jeff Nippard',
      avatarUrl: 'https://via.placeholder.com/40/4ECDC4/FFFFFF?text=JN',
      followerCount: 670000,
      isVerified: true
    },
    niche: 'fitness',
    tags: ['legs', 'strength', 'muscle', 'squats', 'training'],
    metrics: {
      viewCount: 156000,
      likeCount: 9800,
      commentCount: 287,
      shareCount: 432
    },
    uploadedAt: '2024-01-12T14:45:00Z',
    isAvailable: true,
    qualityScore: 4.7
  },
  // Sports Category
  {
    _id: 'sport_1',
    title: 'Basketball Skills Training',
    description: 'Essential basketball drills to improve your game and ball handling',
    videoUrl: 'https://www.youtube.com/shorts/sA_FtB4Etlg',
    thumbnailUrl: 'https://img.youtube.com/vi/sA_FtB4Etlg/maxresdefault.jpg',
    duration: 58,
    creatorInfo: {
      username: '@ILoveBasketballTV',
      displayName: 'ILoveBasketballTV',
      avatarUrl: 'https://via.placeholder.com/40/FFA07A/FFFFFF?text=IB',
      followerCount: 450000,
      isVerified: true
    },
    niche: 'sports',
    tags: ['basketball', 'skills', 'training', 'drills', 'sports'],
    metrics: {
      viewCount: 78000,
      likeCount: 5600,
      commentCount: 134,
      shareCount: 267
    },
    uploadedAt: '2024-01-11T19:30:00Z',
    isAvailable: true,
    qualityScore: 4.5
  },
  {
    _id: 'sport_2',
    title: 'Soccer Footwork Drills',
    description: 'Improve your soccer skills with these essential footwork exercises',
    videoUrl: 'https://www.youtube.com/shorts/zCCSXzc5iq0',
    thumbnailUrl: 'https://img.youtube.com/vi/zCCSXzc5iq0/maxresdefault.jpg',
    duration: 42,
    creatorInfo: {
      username: '@SkillTwins',
      displayName: 'SkillTwins Football',
      avatarUrl: 'https://via.placeholder.com/40/A8E6CF/FFFFFF?text=ST',
      followerCount: 320000,
      isVerified: false
    },
    niche: 'sports',
    tags: ['soccer', 'football', 'footwork', 'skills', 'training'],
    metrics: {
      viewCount: 92000,
      likeCount: 7200,
      commentCount: 189,
      shareCount: 345
    },
    uploadedAt: '2024-01-10T15:20:00Z',
    isAvailable: true,
    qualityScore: 4.4
  },
  {
    _id: 'sport_3',
    title: 'Tennis Technique Tips',
    description: 'Master your tennis technique with professional coaching tips',
    videoUrl: 'https://www.youtube.com/shorts/_rr4iYgpd4k',
    thumbnailUrl: 'https://img.youtube.com/vi/_rr4iYgpd4k/maxresdefault.jpg',
    duration: 48,
    creatorInfo: {
      username: '@TennisTech',
      displayName: 'Tennis Technique',
      avatarUrl: 'https://via.placeholder.com/40/FFD3A5/FFFFFF?text=TT',
      followerCount: 180000,
      isVerified: false
    },
    niche: 'sports',
    tags: ['tennis', 'technique', 'coaching', 'sports', 'tips'],
    metrics: {
      viewCount: 64000,
      likeCount: 4300,
      commentCount: 98,
      shareCount: 178
    },
    uploadedAt: '2024-01-09T11:45:00Z',
    isAvailable: true,
    qualityScore: 4.3
  },
  // Fashion Category
  {
    _id: 'fashion_1',
    title: 'Styling Tips & Trends',
    description: 'Latest fashion trends and styling tips for a modern wardrobe',
    videoUrl: 'https://www.youtube.com/shorts/DjPSLobtRVw',
    thumbnailUrl: 'https://img.youtube.com/vi/DjPSLobtRVw/maxresdefault.jpg',
    duration: 52,
    creatorInfo: {
      username: '@StyleInfluencer',
      displayName: 'Style Influencer',
      avatarUrl: 'https://via.placeholder.com/40/C7CEEA/FFFFFF?text=SI',
      followerCount: 750000,
      isVerified: true
    },
    niche: 'fashion',
    tags: ['fashion', 'style', 'trends', 'outfit', 'clothing'],
    metrics: {
      viewCount: 134000,
      likeCount: 11200,
      commentCount: 456,
      shareCount: 678
    },
    uploadedAt: '2024-01-08T13:15:00Z',
    isAvailable: true,
    qualityScore: 4.6
  }
];

const MultimediaAssessmentDemo: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedReel, setSelectedReel] = useState<VideoReel | null>(null);
  const [savedConversations, setSavedConversations] = useState<MultimediaConversation[]>([]);
  const [currentUser, setCurrentUser] = useState<DemoUser>(DEMO_USERS[0]);
  const [assessmentSession, setAssessmentSession] = useState<string | null>(null);

  // Handler functions
  const handleReelSelect = (reel: VideoReel) => {
    setSelectedReel(reel);
    setActiveTab('builder');
    message.success(`Selected: ${reel.title}`);
  };

  const handleSaveConversation = (conversation: MultimediaConversation) => {
    setSavedConversations(prev => [...prev, conversation]);
    message.success('Conversation saved successfully!');
    setActiveTab('preview');
  };

  const handleStartAssessment = () => {
    setAssessmentSession(DEMO_ASSESSMENT_ID);
    message.success('Assessment session started!');
  };

  const handleAssessmentComplete = (submissionId: string, finalScore: number) => {
    message.success(`Assessment completed! Final score: ${finalScore}/10`);
    setAssessmentSession(null);
  };

  const handleExitAssessment = () => {
    setAssessmentSession(null);
    message.info('Assessment session ended');
  };

  const handleReviewComplete = (submissionId: string, decision: string) => {
    message.success(`Review completed: ${decision}`);
  };

  const handleUserSwitch = (user: DemoUser) => {
    setCurrentUser(user);
    setActiveTab('marketplace');
    setAssessmentSession(null);
    message.info(`Switched to ${user.role}: ${user.name}`);
  };

  // Render role-based content
  const renderRoleContent = () => {
    // If in assessment session, show assessment component
    if (assessmentSession && currentUser.role === 'annotator') {
      return (
        <AssessmentSession
          assessmentId={DEMO_ASSESSMENT_ID}
          onComplete={handleAssessmentComplete}
          onExit={handleExitAssessment}
        />
      );
    }

    // Role-based main content
    switch (currentUser.role) {
      case 'annotator':
        return (
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            className="mt-6"
            items={[
              {
                key: 'marketplace',
                label: (
                  <span>
                    <PlayCircleOutlined />
                    Video Marketplace
                  </span>
                ),
                children: (
                  <Card className="shadow-lg border-0 rounded-xl">
                    <div className="mb-4">
                      <Title level={3} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
                        Select YouTube Shorts for Assessment
                      </Title>
                      <Text className="text-gray-600 font-[gilroy-regular]">
                        Browse available video content for conversation creation
                      </Text>
                    </div>
                    <VideoReelMarketplace
                      onSelectReel={handleReelSelect}
                      selectedReels={selectedReel ? [selectedReel] : []}
                      maxSelections={1}
                      showSelectionCount={true}
                      mockData={MOCK_REELS}
                    />
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <Button
                        type="primary"
                        size="large"
                        icon={<CheckCircleOutlined />}
                        onClick={handleStartAssessment}
                        className="w-full"
                      >
                        Start Full Assessment Session
                      </Button>
                      <Text className="block text-sm text-gray-600 mt-2 text-center">
                        Start a timed assessment with multiple tasks
                      </Text>
                    </div>
                  </Card>
                ),
              },
              {
                key: 'builder',
                label: (
                  <span>
                    <BuildOutlined />
                    Conversation Builder
                  </span>
                ),
                disabled: !selectedReel,
                children: selectedReel ? (
                  <Card className="shadow-lg border-0 rounded-xl">
                    <div className="mb-4">
                      <Title level={3} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
                        Build Conversation: {selectedReel.title}
                      </Title>
                      <Text className="text-gray-600 font-[gilroy-regular]">
                        Create segments and build multi-turn conversations
                      </Text>
                    </div>
                    <ConversationBuilder
                      selectedReel={selectedReel}
                      onSaveConversation={handleSaveConversation}
                    />
                  </Card>
                ) : null,
              },
              {
                key: 'preview',
                label: (
                  <span>
                    <EyeOutlined />
                    Results Preview
                    <Badge count={savedConversations.length} className="ml-1" />
                  </span>
                ),
                children: (
                  <Card className="shadow-lg border-0 rounded-xl">
                    <div className="mb-4">
                      <Title level={3} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
                        Saved Conversations ({savedConversations.length})
                      </Title>
                      <Text className="text-gray-600 font-[gilroy-regular]">
                        Review your completed multi-turn conversations
                      </Text>
                    </div>
                    {savedConversations.length > 0 ? (
                      <div className="space-y-4">
                        {savedConversations.map((conversation, index) => (
                          <Card key={index} className="bg-gray-50">
                            <div className="space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <Text strong className="font-[gilroy-regular]">
                                    Conversation {index + 1}
                                  </Text>
                                  <br />
                                  <Text className="text-sm text-gray-600 font-[gilroy-regular]">
                                    {conversation.turns.length} turns • Created: {new Date(conversation.createdAt).toLocaleString()}
                                  </Text>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Alert
                        message="No Conversations Yet"
                        description="Create some conversations using the Video Marketplace and Conversation Builder to see them here."
                        type="info"
                        showIcon
                      />
                    )}
                  </Card>
                ),
              },
            ]}
          />
        );

      case 'qa_reviewer':
        return <QAReviewDashboard onReviewComplete={handleReviewComplete} />;

      case 'admin':
        return <AdminAssessmentManager onAssessmentCreated={(assessment) => {
          message.success(`Assessment created: ${assessment.title}`);
        }} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <Title level={1} className="!text-[#333333] !mb-4 font-[gilroy-regular] bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Multimedia Assessment System
          </Title>
          <Paragraph className="text-gray-600 max-w-3xl mx-auto text-lg font-[gilroy-regular]">
            Comprehensive platform for creating, managing, and reviewing video-based assessments 
            for annotator qualification and training.
          </Paragraph>
        </div>

        {/* User Role Switcher */}
        <Card className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Avatar icon={<UserOutlined />} size="large" />
              <div>
                <Title level={5} className="!mb-1">
                  {currentUser.name}
                </Title>
                <Text type="secondary">{currentUser.email}</Text>
              </div>
              <Badge 
                count={currentUser.role.replace('_', ' ').toUpperCase()} 
                style={{ backgroundColor: getRoleColor(currentUser.role) }}
              />
            </div>
            
            <Space>
              <Text strong>Switch Role:</Text>
              {DEMO_USERS.map(user => (
                <Button
                  key={user.id}
                  type={user.id === currentUser.id ? "primary" : "default"}
                  onClick={() => handleUserSwitch(user)}
                  icon={getRoleIcon(user.role)}
                >
                  {user.role.replace('_', ' ')}
                </Button>
              ))}
            </Space>
          </div>
        </Card>

        {/* Role-based Content */}
        {renderRoleContent()}

        {/* Instructions Card */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm">
          <Title level={4} className="!text-blue-800 !mb-4 font-[gilroy-regular]">
            System Overview
          </Title>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Title level={5} className="!text-blue-700 flex items-center gap-2">
                <UserOutlined /> Annotator Features
              </Title>
              <ul className="text-blue-600 space-y-1 text-sm">
                <li>• Browse YouTube Shorts marketplace</li>
                <li>• Create multi-turn conversations</li>
                <li>• Take timed assessments</li>
                <li>• Auto-save progress</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Title level={5} className="!text-purple-700 flex items-center gap-2">
                <EyeOutlined /> QA Reviewer Features
              </Title>
              <ul className="text-purple-600 space-y-1 text-sm">
                <li>• Review pending submissions</li>
                <li>• Score individual tasks</li>
                <li>• Provide detailed feedback</li>
                <li>• Approve/reject assessments</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Title level={5} className="!text-green-700 flex items-center gap-2">
                <SettingOutlined /> Admin Features
              </Title>
              <ul className="text-green-600 space-y-1 text-sm">
                <li>• Create assessment configurations</li>
                <li>• Manage video reel library</li>
                <li>• Bulk upload YouTube content</li>
                <li>• View analytics & reports</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Helper functions
const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'annotator': return '#1890ff';
    case 'qa_reviewer': return '#722ed1';
    case 'admin': return '#52c41a';
    default: return '#1890ff';
  }
};

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case 'annotator': return <UserOutlined />;
    case 'qa_reviewer': return <EyeOutlined />;
    case 'admin': return <SettingOutlined />;
    default: return <UserOutlined />;
  }
};

export default MultimediaAssessmentDemo;