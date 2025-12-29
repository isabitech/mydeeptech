import React, { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Input, Select, Tag, Button, Spin, Empty, Avatar, Typography, Space } from 'antd';
import { SearchOutlined, PlayCircleOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import { VideoReel, VideoNiche } from '../../types/multimedia-assessment.types';
import { useMultimediaAssessment } from '../../hooks/Auth/User/useMultimediaAssessment';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface VideoReelMarketplaceProps {
  onSelectReel: (reel: VideoReel) => void;
  selectedReels?: VideoReel[];
  maxSelections?: number;
  filterByNiche?: string;
  showSelectionCount?: boolean;
  mockData?: VideoReel[]; // For demo purposes
}

// Mock niches - should come from API
const MOCK_NICHES: VideoNiche[] = [
  { name: 'fitness', description: 'Fitness & Health', color: '#45B7D1', iconName: 'trophy', isActive: true },
  { name: 'sports', description: 'Sports & Athletics', color: '#FFA07A', iconName: 'dribbble', isActive: true },
  { name: 'fashion', description: 'Fashion & Style', color: '#C7CEEA', iconName: 'star', isActive: true },
  { name: 'lifestyle', description: 'Lifestyle & Daily Life', color: '#FF6B9D', iconName: 'heart', isActive: true },
  { name: 'tech', description: 'Technology & Gadgets', color: '#4ECDC4', iconName: 'mobile', isActive: true },
  { name: 'food', description: 'Food & Cooking', color: '#98D8C8', iconName: 'coffee', isActive: true },
  { name: 'travel', description: 'Travel & Adventure', color: '#A8E6CF', iconName: 'compass', isActive: true },
  { name: 'education', description: 'Education & Learning', color: '#FFD3A5', iconName: 'book', isActive: true },
];

const VideoReelMarketplace: React.FC<VideoReelMarketplaceProps> = ({
  onSelectReel,
  selectedReels = [],
  maxSelections = 1,
  filterByNiche,
  showSelectionCount = true,
  mockData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string>(filterByNiche || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [videoReels, setVideoReels] = useState<VideoReel[]>(mockData || []);
  const [niches, setNiches] = useState<VideoNiche[]>(MOCK_NICHES);
  
  const { getVideoReels, loading } = useMultimediaAssessment();

  // Load video reels
  useEffect(() => {
    if (mockData) {
      setVideoReels(mockData);
      return;
    }
    loadVideoReels();
  }, [selectedNiche, currentPage, mockData]);

  const loadVideoReels = async () => {
    const nicheFilter = selectedNiche === 'all' ? undefined : selectedNiche;
    const result = await getVideoReels(nicheFilter, currentPage, 20);
    
    if (result.success && result.data) {
      setVideoReels(result.data.reels);
      if (result.data.niches) {
        setNiches(result.data.niches);
      }
    }
  };

  // Filter reels based on search
  const filteredReels = useMemo(() => {
    if (!searchTerm) return videoReels;
    
    return videoReels.filter(reel => 
      reel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.niche.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [videoReels, searchTerm]);

  // Check if reel is selected
  const isSelected = (reel: VideoReel) => {
    return selectedReels.some(selected => selected._id === reel._id);
  };

  // Handle reel selection
  const handleReelSelect = (reel: VideoReel) => {
    if (isSelected(reel)) return; // Already selected
    if (selectedReels.length >= maxSelections) return; // Max selections reached
    
    onSelectReel(reel);
  };

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    hover: {
      y: -8,
      boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className="video-reel-marketplace p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Title level={2} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
          Choose Your Video Reel
        </Title>
        <Text className="text-gray-600 font-[gilroy-regular]">
          Select a video reel to create your multi-turn conversation assessment
        </Text>
        
        {showSelectionCount && (
          <div className="mt-4">
            <Tag 
              color={selectedReels.length >= maxSelections ? 'success' : 'processing'}
              className="px-4 py-2 text-sm font-[gilroy-regular]"
            >
              {selectedReels.length} / {maxSelections} selected
            </Tag>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-md border-0 rounded-xl">
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search reels by title, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
              className="font-[gilroy-regular]"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              value={selectedNiche}
              onChange={setSelectedNiche}
              placeholder="Filter by niche"
              className="w-full font-[gilroy-regular]"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Niches</Option>
              {niches.map(niche => (
                <Option key={niche.name} value={niche.name}>
                  <Space>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: niche.color }}
                    />
                    {niche.description}
                  </Space>
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <div className="flex gap-2 flex-wrap">
              {niches.slice(0, 4).map(niche => (
                <Tag
                  key={niche.name}
                  color={selectedNiche === niche.name ? 'processing' : 'default'}
                  className="cursor-pointer font-[gilroy-regular]"
                  onClick={() => setSelectedNiche(niche.name)}
                  style={{ 
                    borderColor: niche.color,
                    color: selectedNiche === niche.name ? '#fff' : niche.color,
                    backgroundColor: selectedNiche === niche.name ? niche.color : 'transparent'
                  }}
                >
                  {niche.name.charAt(0).toUpperCase() + niche.name.slice(1)}
                </Tag>
              ))}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Video Reels Grid */}
      <Spin spinning={loading}>
        {filteredReels.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row gutter={[24, 24]}>
              {filteredReels.map((reel) => (
                <Col key={reel._id} xs={12} sm={8} md={6} lg={4}>
                  <motion.div
                    variants={cardVariants}
                    whileHover="hover"
                    className={`relative cursor-pointer ${
                      isSelected(reel) ? 'ring-4 ring-[#F6921E] ring-opacity-50' : ''
                    }`}
                    onClick={() => handleReelSelect(reel)}
                  >
                    <Card
                      hoverable
                      className={`
                        border-0 rounded-xl overflow-hidden shadow-lg
                        ${isSelected(reel) ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-white'}
                        ${selectedReels.length >= maxSelections && !isSelected(reel) ? 'opacity-50' : ''}
                      `}
                      cover={
                        <div className="relative aspect-[9/16] bg-gray-200">
                          {/* Video Thumbnail */}
                          <img
                            src={reel.thumbnailUrl}
                            alt={reel.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-video-thumbnail.png';
                            }}
                          />
                          
                          {/* Play Overlay */}
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <PlayCircleOutlined className="text-white text-4xl" />
                          </div>

                          {/* Duration Badge */}
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-[gilroy-regular]">
                            {formatDuration(reel.duration)}
                          </div>

                          {/* Selection Indicator */}
                          {isSelected(reel) && (
                            <div className="absolute top-2 right-2 bg-[#F6921E] text-white rounded-full w-6 h-6 flex items-center justify-center">
                              <span className="text-xs font-bold">✓</span>
                            </div>
                          )}

                          {/* Niche Badge */}
                          <div className="absolute top-2 left-2">
                            <Tag 
                              color={niches.find(n => n.name === reel.niche)?.color || '#666'}
                              className="text-xs font-[gilroy-regular] border-0"
                            >
                              {reel.niche}
                            </Tag>
                          </div>
                        </div>
                      }
                      bodyStyle={{ padding: '12px' }}
                    >
                      <div className="space-y-2">
                        <Text 
                          strong 
                          className="text-sm font-[gilroy-regular] text-[#333333] line-clamp-2"
                          title={reel.title}
                        >
                          {reel.title}
                        </Text>
                        
                        <Text 
                          className="text-xs text-gray-500 font-[gilroy-regular] line-clamp-2"
                          title={reel.description}
                        >
                          {reel.description}
                        </Text>

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <Text className="text-xs text-gray-400 font-[gilroy-regular]">
                              {reel.aspectRatio}
                            </Text>
                          </div>
                          
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            className="text-gray-400 hover:text-[#F6921E] font-[gilroy-regular]"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Preview functionality
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        ) : (
          <Empty
            description={
              <Text className="text-gray-500 font-[gilroy-regular]">
                {searchTerm ? 'No reels found matching your search' : 'No video reels available'}
              </Text>
            }
            className="my-12"
          />
        )}
      </Spin>

      {/* Load More */}
      {!loading && filteredReels.length > 0 && (
        <div className="text-center mt-8">
          <Button
            size="large"
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="font-[gilroy-regular]"
          >
            Load More Reels
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoReelMarketplace;