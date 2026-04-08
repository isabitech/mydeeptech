import React from 'react';
import { Button, Card, Switch, Space, Typography, Divider } from 'antd';
import { PlayCircleOutlined, StopOutlined, ReloadOutlined, ToolOutlined } from '@ant-design/icons';
import { MAINTENANCE_CONFIG } from '../config/maintenance';
import { useMaintenance } from '../hooks/useMaintenance';

const { Title, Text, Paragraph } = Typography;

const MaintenanceControl: React.FC = () => {
  const { isMaintenanceMode, refreshMaintenanceStatus } = useMaintenance();

  const toggleMaintenance = () => {
    // In a real app, this would make an API call to toggle maintenance
    // For demo purposes, we'll show how to toggle the config
    MAINTENANCE_CONFIG.enabled = !MAINTENANCE_CONFIG.enabled;
    refreshMaintenanceStatus();
  };

  const testMaintenance = () => {
    // Temporarily enable maintenance mode for testing
    const originalState = MAINTENANCE_CONFIG.enabled;
    MAINTENANCE_CONFIG.enabled = true;
    
    // Refresh to show maintenance page
    window.location.reload();
    
    // Restore original state after 5 seconds
    setTimeout(() => {
      MAINTENANCE_CONFIG.enabled = originalState;
    }, 5000);
  };

  const setMaintenanceWithTimer = () => {
    // Set maintenance mode with a 2-minute timer for testing
    MAINTENANCE_CONFIG.enabled = true;
    MAINTENANCE_CONFIG.estimatedCompletion = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    refreshMaintenanceStatus();
  };

  return (
    <Card 
      title={
        <Space>
          <ToolOutlined />
          Maintenance Mode Control
        </Space>
      }
      style={{ maxWidth: 600, margin: '20px auto' }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Current Status */}
        <div>
          <Title level={5}>Current Status</Title>
          <div style={{ 
            padding: '12px', 
            backgroundColor: isMaintenanceMode ? '#fff2f0' : '#f6ffed',
            border: `1px solid ${isMaintenanceMode ? '#ffccc7' : '#d9f7be'}`,
            borderRadius: '6px'
          }}>
            <Text strong style={{ 
              color: isMaintenanceMode ? '#cf1322' : '#389e0d' 
            }}>
              {isMaintenanceMode ? '⚠️ MAINTENANCE MODE ACTIVE' : '✅ Application Running Normally'}
            </Text>
          </div>
        </div>

        <Divider />

        {/* Controls */}
        <div>
          <Title level={5}>Quick Controls</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Enable Maintenance Mode:</Text>
              <Switch 
                checked={isMaintenanceMode}
                onChange={toggleMaintenance}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>
            
            <Button 
              icon={<PlayCircleOutlined />}
              onClick={testMaintenance}
              type="default"
              block
            >
              Test Maintenance Page (5s demo)
            </Button>
            
            <Button 
              icon={<PlayCircleOutlined />}
              onClick={setMaintenanceWithTimer}
              type="default"
              block
            >
              Enable with 2-minute Timer
            </Button>

            <Button 
              icon={<ReloadOutlined />}
              onClick={refreshMaintenanceStatus}
              type="default"
              block
            >
              Refresh Status
            </Button>
          </Space>
        </div>

        <Divider />

        {/* Configuration Info */}
        <div>
          <Title level={5}>Current Configuration</Title>
          <div style={{ backgroundColor: '#fafafa', padding: '12px', borderRadius: '6px' }}>
            <Paragraph style={{ margin: 0, fontSize: '12px', fontFamily: 'monospace' }}>
              <strong>Title:</strong> {MAINTENANCE_CONFIG.title}<br />
              <strong>Bypass Roles:</strong> {MAINTENANCE_CONFIG.bypassRoles.join(', ') || 'None'}<br />
              <strong>Restricted Routes:</strong> {MAINTENANCE_CONFIG.restrictedRoutes.length === 0 ? 'All routes' : MAINTENANCE_CONFIG.restrictedRoutes.join(', ')}<br />
              <strong>Estimated Completion:</strong> {MAINTENANCE_CONFIG.estimatedCompletion || 'Not set'}
            </Paragraph>
          </div>
        </div>

        <Divider />

        {/* Instructions */}
        <div>
          <Title level={5}>How to Use</Title>
          <ul style={{ fontSize: '14px' }}>
            <li>Toggle the switch above to enable/disable maintenance mode</li>
            <li>Use "Test Maintenance Page" to preview the maintenance page</li>
            <li>Edit <code>src/config/maintenance.ts</code> to customize messages</li>
            <li>Admin users can bypass maintenance mode (configurable)</li>
            <li>In production, use environment variables for configuration</li>
          </ul>
        </div>
      </Space>
    </Card>
  );
};

export default MaintenanceControl;