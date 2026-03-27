import React from "react";
import { Form, Select, InputNumber, Switch, Row, Col } from "antd";

interface SystemInfoFormProps {
  isEditing: boolean;
}

const SystemInfoForm: React.FC<SystemInfoFormProps> = ({ isEditing }) => {
  return (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Device Type"
            name="deviceType"
            initialValue=""
          >
            <Select
              disabled={!isEditing}
              placeholder="Select your device type"
              options={[
                { value: "desktop", label: "Desktop" },
                { value: "laptop", label: "Laptop" },
                { value: "tablet", label: "Tablet" },
                { value: "mobile", label: "Mobile" },
              ]}
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            label="Operating System"
            name="operatingSystem"
            initialValue=""
          >
            <Select
              disabled={!isEditing}
              placeholder="Select your operating system"
              options={[
                { value: "windows", label: "Windows" },
                { value: "macos", label: "macOS" },
                { value: "linux", label: "Linux" },
                { value: "android", label: "Android" },
                { value: "ios", label: "iOS" },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Internet Speed (Mbps)"
            name="internetSpeedMbps"
            initialValue={0}
          >
            <InputNumber
              disabled={!isEditing}
              placeholder="Enter your internet speed"
              min={0}
              max={10000}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            label="Power Backup"
            name="powerBackup"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              disabled={!isEditing}
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Webcam Available"
            name="hasWebcam"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              disabled={!isEditing}
              checkedChildren="Available"
              unCheckedChildren="Not Available"
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            label="Microphone Available"
            name="hasMicrophone"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              disabled={!isEditing}
              checkedChildren="Available"
              unCheckedChildren="Not Available"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default SystemInfoForm;