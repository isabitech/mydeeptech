import React from 'react';
import ReactPlayer from 'react-player';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const VideoTest: React.FC = () => {
  const testVideoUrl = 'https://www.youtube.com/embed/hnAOu6PMhnY';

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <Title level={3} className="text-center mb-4">
            YouTube Embed Test
          </Title>
          
          <Text className="block mb-4 text-gray-600">
            Testing: "How to grow your arms #gym #motivation"
          </Text>

          {/* ReactPlayer Test */}
          <div className="mb-6">
            <Text strong className="block mb-2">ReactPlayer Component:</Text>
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
              <ReactPlayer
                url={testVideoUrl}
                width="100%"
                height="100%"
                controls={true}
                playing={false}
                config={{
                  youtube: {
                    playerVars: {
                      showinfo: 1,
                      modestbranding: 1,
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Native iframe Test */}
          <div>
            <Text strong className="block mb-2">Native iframe:</Text>
            <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                src={testVideoUrl}
                title="How to grow your arms #gym #motivation" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded">
            <Text className="text-sm text-blue-800">
              <strong>URL:</strong> {testVideoUrl}
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VideoTest;