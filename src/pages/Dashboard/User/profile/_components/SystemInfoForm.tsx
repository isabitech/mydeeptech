import React, { useEffect } from "react";
import { Form, Select, InputNumber, Switch, Row, Col } from "antd";
import { useDeviceDetection } from "./hooks/useDeviceDetection";
import DetectionStatusAlert from "./DetectionStatusAlert";
import DetectedFieldLabel from "./DetectedFieldLabel";

interface SystemInfoFormProps {
  isEditing: boolean;
}

const SystemInfoForm: React.FC<SystemInfoFormProps> = ({ isEditing }) => {
  const {
    detecting,
    detectionStatus,
    performDetection,
    toggleManualInput,
    getDetectionMessage
  } = useDeviceDetection();

  useEffect(() => {
    performDetection();
  }, []);

  const detectionMessage = getDetectionMessage();

  return (
    <>
      <DetectionStatusAlert
        detecting={detecting}
        detectionMessage={detectionMessage}
        onRedetect={performDetection}
        isEditing={isEditing}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Form.Item
            label={
              <DetectedFieldLabel
                label="Device Type"
                detectionField={detectionStatus.deviceType}
                onToggleManual={() => toggleManualInput('deviceType')}
                isEditing={isEditing}
              />
            }
            name="deviceType"
            initialValue=""
          >
            <Select
              disabled={!isEditing || (detectionStatus.deviceType.detected && !detectionStatus.deviceType.manual)}
              placeholder={detectionStatus.deviceType.detected ? "Auto-detected" : "Select your device type"}
              options={[
                { value: "desktop", label: "Desktop" },
                { value: "laptop", label: "Laptop" },
                { value: "tablet", label: "Tablet" },
                { value: "mobile", label: "Mobile" },
              ]}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} lg={12}>
          <Form.Item
            label={
              <DetectedFieldLabel
                label="Operating System"
                detectionField={detectionStatus.operatingSystem}
                onToggleManual={() => toggleManualInput('operatingSystem')}
                isEditing={isEditing}
              />
            }
            name="operatingSystem"
            initialValue=""
          >
            <Select
              disabled={!isEditing || (detectionStatus.operatingSystem.detected && !detectionStatus.operatingSystem.manual)}
              placeholder={detectionStatus.operatingSystem.detected ? "Auto-detected" : "Select your operating system"}
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
        <Col xs={24} lg={12}>
          <Form.Item
            label={
              <DetectedFieldLabel
                label="Internet Speed (Mbps)"
                detectionField={detectionStatus.internetSpeed}
                onToggleManual={() => toggleManualInput('internetSpeed')}
                isEditing={isEditing}
              />
            }
            name="internetSpeedMbps"
            initialValue={0}
          >
            <InputNumber
              disabled={!isEditing || (detectionStatus.internetSpeed.detected && !detectionStatus.internetSpeed.manual)}
              placeholder={detectionStatus.internetSpeed.detected ? "Auto-detected" : "Enter your internet speed"}
              min={0}
              max={10000}
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} lg={12}>
          <Form.Item
            label={
              <DetectedFieldLabel
                label="Power Backup"
                detectionField={detectionStatus.powerBackup}
                onToggleManual={() => toggleManualInput('powerBackup')}
                isEditing={isEditing}
              />
            }
            name="powerBackup"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              disabled={!isEditing || (detectionStatus.powerBackup.detected && !detectionStatus.powerBackup.manual)}
              checkedChildren="Yes"
              unCheckedChildren="No"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Form.Item
            label={
              <DetectedFieldLabel
                label="Webcam Available"
                detectionField={detectionStatus.hasWebcam}
                onToggleManual={() => toggleManualInput('hasWebcam')}
                isEditing={isEditing}
              />
            }
            name="hasWebcam"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              disabled={!isEditing || (detectionStatus.hasWebcam.detected && !detectionStatus.hasWebcam.manual)}
              checkedChildren="Available"
              unCheckedChildren="Not Available"
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} lg={12}>
          <Form.Item
            label={
              <DetectedFieldLabel
                label="Microphone Available"
                detectionField={detectionStatus.hasMicrophone}
                onToggleManual={() => toggleManualInput('hasMicrophone')}
                isEditing={isEditing}
              />
            }
            name="hasMicrophone"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch 
              disabled={!isEditing || (detectionStatus.hasMicrophone.detected && !detectionStatus.hasMicrophone.manual)}
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
