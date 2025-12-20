import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
import { Card, Button, Slider, Input, Tag, Space, Typography, Divider, Modal, message } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ScissorOutlined,
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { 
  VideoReel, 
  VideoSegment, 
  ConversationTurn, 
  MultimediaConversation 
} from '../../types/multimedia-assessment.types';

// Lazy load VPlayer component for better performance
const VPlayer = lazy(() => import('../VideoPlayer/VPlayer'));

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ConversationBuilderProps {
  selectedReel: VideoReel;
  onSaveConversation: (conversation: MultimediaConversation) => void;
  initialConversation?: MultimediaConversation;
  isReadOnly?: boolean;
}

const ConversationBuilder: React.FC<ConversationBuilderProps> = ({
  selectedReel,
  onSaveConversation,
  initialConversation,
  isReadOnly = false
}) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);
  
  // Conversation state
  const [turns, setTurns] = useState<ConversationTurn[]>(initialConversation?.turns || []);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [startingPoint, setStartingPoint] = useState<'video' | 'prompt'>(
    initialConversation?.startingPoint || 'prompt'
  );
  
  // Current turn editing state
  const [userPrompt, setUserPrompt] = useState('');
  const [aiResponseText, setAiResponseText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<{startTime: number, endTime: number} | null>(null);
  const [isSegmentModalVisible, setIsSegmentModalVisible] = useState(false);
  
  // Segment creation state
  const [segmentStartTime, setSegmentStartTime] = useState(0);
  const [segmentEndTime, setSegmentEndTime] = useState(0);
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);

  // Initialize conversation from props
  useEffect(() => {
    if (initialConversation) {
      setTurns(initialConversation.turns);
      setStartingPoint(initialConversation.startingPoint);
    }
  }, [initialConversation]);

  // Video event handlers for VPlayer/ReactPlayer
  const handleVideoReady = () => {
    if (playerRef.current) {
      setVideoDuration(playerRef.current.getDuration());
      setVideoLoaded(true);
      console.log('🎬 VPlayer ready, duration:', playerRef.current.getDuration());
    }
  };

  const handleProgress = (state: any) => {
    setCurrentTime(state.playedSeconds);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const seekTo = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, 'seconds');
      setCurrentTime(time);
    }
  };

  // Segment creation functions
  const startSegmentCreation = () => {
    setSegmentStartTime(currentTime);
    setIsCreatingSegment(true);
    message.info('Click "End Segment" when you reach the desired end point');
  };

  const endSegmentCreation = () => {
    if (segmentStartTime >= currentTime) {
      message.error('End time must be after start time');
      return;
    }
    
    setSegmentEndTime(currentTime);
    setSelectedSegment({
      startTime: segmentStartTime,
      endTime: currentTime
    });
    setIsCreatingSegment(false);
    setIsSegmentModalVisible(true);
  };

  // Turn management
  const addTurn = () => {
    if (!userPrompt.trim()) {
      message.error('Please enter a user prompt');
      return;
    }

    if (!selectedSegment) {
      message.error('Please create a video segment for the AI response');
      return;
    }

    const newTurn: ConversationTurn = {
      turnNumber: currentTurn,
      userPrompt: userPrompt.trim(),
      aiResponse: {
        videoSegment: {
          startTime: selectedSegment.startTime,
          endTime: selectedSegment.endTime,
          role: 'ai_response',
          content: aiResponseText.trim()
        },
        responseText: aiResponseText.trim()
      },
      timestamp: new Date().toISOString()
    };

    setTurns(prev => [...prev, newTurn]);
    
    // Reset for next turn
    setCurrentTurn(prev => prev + 1);
    setUserPrompt('');
    setAiResponseText('');
    setSelectedSegment(null);
    
    message.success(`Turn ${currentTurn} added successfully!`);
  };

  const removeTurn = (turnNumber: number) => {
    setTurns(prev => prev.filter(turn => turn.turnNumber !== turnNumber));
    message.success(`Turn ${turnNumber} removed`);
  };

  // Save conversation
  const handleSaveConversation = () => {
    if (turns.length === 0) {
      message.error('Please add at least one conversation turn');
      return;
    }

    const conversation: MultimediaConversation = {
      originalVideoId: selectedReel._id,
      originalVideo: selectedReel,
      turns: turns,
      totalDuration: turns.reduce((acc, turn) => 
        acc + (turn.aiResponse.videoSegment.endTime - turn.aiResponse.videoSegment.startTime), 0
      ),
      startingPoint,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveConversation(conversation);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Preview segment
  const previewSegment = (segment: VideoSegment) => {
    seekTo(segment.startTime);
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
    }, (segment.endTime - segment.startTime) * 1000);
  };

  return (
    <div className="conversation-builder p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="!text-[#333333] !mb-2 font-[gilroy-regular]">
            Create Multi-Turn Conversation
          </Title>
          <Text className="text-gray-600 font-[gilroy-regular]">
            Build an engaging conversation using segments from "{selectedReel.title}"
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Player Section */}
          <Card className="shadow-lg border-0 rounded-xl">
            <div className="space-y-4">
              {/* Video Player */}
              <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <Text className="text-white font-[gilroy-regular]">Loading video...</Text>
                    </div>
                  </div>
                }>
                  <VPlayer
                    playerRef={playerRef}
                    url={selectedReel.videoUrl}
                    width="100%"
                    height="100%"
                    playing={isPlaying}
                    controls={false}
                    onReady={handleVideoReady}
                    onProgress={handleProgress}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={(error: any) => {
                      console.error('Video loading error:', error);
                      message.error('Failed to load video. Please try another video.');
                    }}
                    style={{ borderRadius: '8px' }}
                  />
                </Suspense>

                {/* Play/Pause Overlay */}
                {videoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={togglePlay}>
                    {isPlaying ? (
                      <PauseCircleOutlined className="text-white text-6xl" />
                    ) : (
                      <PlayCircleOutlined className="text-white text-6xl" />
                    )}
                  </div>
                )}

                {/* Time Display */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded">
                  {formatTime(currentTime)} / {formatTime(videoDuration)}
                </div>

                {/* Segment Creation Indicator */}
                {isCreatingSegment && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded animate-pulse">
                    Recording Segment: {formatTime(segmentStartTime)} - {formatTime(currentTime)}
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="space-y-4">
                {/* Timeline Slider */}
                {videoLoaded && (
                  <Slider
                    min={0}
                    max={videoDuration}
                    step={0.1}
                    value={currentTime}
                    onChange={seekTo}
                    tooltip={{
                      formatter: (value) => formatTime(value || 0)
                    }}
                  />
                )}

                {/* Control Buttons */}
                <div className="flex justify-center space-x-4">
                  <Button
                    type="primary"
                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={togglePlay}
                    disabled={!videoLoaded}
                    className="font-[gilroy-regular]"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>

                  {!isReadOnly && (
                    <>
                      {!isCreatingSegment ? (
                        <Button
                          icon={<ScissorOutlined />}
                          onClick={startSegmentCreation}
                          disabled={!videoLoaded}
                          className="font-[gilroy-regular]"
                        >
                          Start Segment
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          danger
                          icon={<ScissorOutlined />}
                          onClick={endSegmentCreation}
                          className="font-[gilroy-regular]"
                        >
                          End Segment
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Conversation Building Section */}
          <Card className="shadow-lg border-0 rounded-xl">
            <div className="space-y-6">
              {/* Starting Point Selection */}
              {!isReadOnly && turns.length === 0 && (
                <div>
                  <Title level={4} className="!text-[#333333] font-[gilroy-regular]">
                    Choose Starting Point
                  </Title>
                  <Space>
                    <Button
                      type={startingPoint === 'prompt' ? 'primary' : 'default'}
                      onClick={() => setStartingPoint('prompt')}
                      className="font-[gilroy-regular]"
                    >
                      User Prompt First
                    </Button>
                    <Button
                      type={startingPoint === 'video' ? 'primary' : 'default'}
                      onClick={() => setStartingPoint('video')}
                      className="font-[gilroy-regular]"
                    >
                      Video First
                    </Button>
                  </Space>
                </div>
              )}

              {/* Current Turn Editor */}
              {!isReadOnly && (
                <div className="space-y-4">
                  <Title level={4} className="!text-[#333333] font-[gilroy-regular]">
                    Turn {currentTurn}
                  </Title>

                  {/* User Prompt */}
                  <div>
                    <Text strong className="font-[gilroy-regular]">User Prompt:</Text>
                    <TextArea
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder="Enter what the user would ask the AI..."
                      rows={3}
                      maxLength={500}
                      showCount
                      className="mt-2 font-[gilroy-regular]"
                    />
                  </div>

                  {/* AI Response Text */}
                  <div>
                    <Text strong className="font-[gilroy-regular]">AI Response Text:</Text>
                    <TextArea
                      value={aiResponseText}
                      onChange={(e) => setAiResponseText(e.target.value)}
                      placeholder="Describe what the AI is showing in this video segment..."
                      rows={3}
                      maxLength={500}
                      showCount
                      className="mt-2 font-[gilroy-regular]"
                    />
                  </div>

                  {/* Selected Segment Display */}
                  {selectedSegment && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <Text strong className="text-green-700 font-[gilroy-regular]">
                        Selected Segment: {formatTime(selectedSegment.startTime)} - {formatTime(selectedSegment.endTime)}
                      </Text>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => previewSegment({
                          startTime: selectedSegment.startTime,
                          endTime: selectedSegment.endTime,
                          role: 'ai_response',
                          content: aiResponseText
                        })}
                        className="ml-2 font-[gilroy-regular]"
                      >
                        Preview
                      </Button>
                    </div>
                  )}

                  {/* Add Turn Button */}
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={addTurn}
                    disabled={!userPrompt.trim() || !selectedSegment}
                    className="w-full bg-[#F6921E] border-[#F6921E] hover:bg-[#e5831c] font-[gilroy-regular]"
                  >
                    Add Turn {currentTurn}
                  </Button>
                </div>
              )}

              {/* Existing Turns Display */}
              {turns.length > 0 && (
                <div className="space-y-4">
                  <Divider />
                  <Title level={4} className="!text-[#333333] font-[gilroy-regular]">
                    Conversation Turns ({turns.length})
                  </Title>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {turns.map((turn) => (
                      <motion.div
                        key={turn.turnNumber}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <Tag color="blue" className="font-[gilroy-regular]">
                            Turn {turn.turnNumber}
                          </Tag>
                          {!isReadOnly && (
                            <Button
                              type="text"
                              danger
                              size="small"
                              icon={<DeleteOutlined />}
                              onClick={() => removeTurn(turn.turnNumber)}
                            />
                          )}
                        </div>

                        <div className="space-y-2">
                          <div>
                            <Text strong className="text-blue-600 font-[gilroy-regular]">User:</Text>
                            <Text className="block text-sm font-[gilroy-regular] mt-1">
                              {turn.userPrompt}
                            </Text>
                          </div>

                          <div>
                            <Text strong className="text-green-600 font-[gilroy-regular]">AI Response:</Text>
                            <Text className="block text-sm font-[gilroy-regular] mt-1">
                              {turn.aiResponse.responseText}
                            </Text>
                            <div className="flex items-center justify-between mt-2">
                              <Text className="text-xs text-gray-500 font-[gilroy-regular]">
                                Segment: {formatTime(turn.aiResponse.videoSegment.startTime)} - {formatTime(turn.aiResponse.videoSegment.endTime)}
                              </Text>
                              <Button
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => previewSegment(turn.aiResponse.videoSegment)}
                                className="font-[gilroy-regular]"
                              >
                                Preview
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              {!isReadOnly && turns.length > 0 && (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSaveConversation}
                  size="large"
                  className="w-full bg-green-600 border-green-600 hover:bg-green-700 font-[gilroy-regular]"
                >
                  Save Conversation
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Segment Creation Modal */}
        <Modal
          title="Confirm Video Segment"
          open={isSegmentModalVisible}
          onOk={() => {
            setIsSegmentModalVisible(false);
            message.success('Video segment selected for AI response');
          }}
          onCancel={() => {
            setSelectedSegment(null);
            setIsSegmentModalVisible(false);
          }}
          okText="Use This Segment"
          cancelText="Cancel"
          className="font-[gilroy-regular]"
        >
          {selectedSegment && (
            <div className="space-y-4">
              <Text className="font-[gilroy-regular]">
                Selected segment: <strong>{formatTime(selectedSegment.startTime)}</strong> to <strong>{formatTime(selectedSegment.endTime)}</strong>
              </Text>
              <Text className="block text-sm text-gray-600 font-[gilroy-regular]">
                Duration: {formatTime(selectedSegment.endTime - selectedSegment.startTime)}
              </Text>
              <Text className="block text-sm text-gray-500 font-[gilroy-regular]">
                This video segment will represent the AI's response to the user's prompt.
              </Text>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ConversationBuilder;