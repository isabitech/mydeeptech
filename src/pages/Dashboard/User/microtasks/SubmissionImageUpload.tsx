import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Spin,
  notification,
  Image,
  Upload,
  Tag,
  Tabs,
  Row,
  Col,
  Progress,
  Modal,
} from "antd";
const { Dragger } = Upload;
import {
  EyeOutlined,
  DeleteOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import type { UploadProps, RcFile } from "antd/es/upload/interface";
import moment from "moment";
import { microTaskQueryService, microTaskMutationService } from "../../../../services/micro-task-service";
import { getErrorMessage } from "../../../../service/apiUtils";
import { ImageSchema } from "../../../../validators/task/task-submission-schema";
import { ImageSamples } from "./image-data";

const { Text } = Typography;

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AngleConfig {
  key: string;
  label: string;
  title: string;
  fieldName: string; // This will be the view name (View 1, View 2, etc.)
  sampleScenario: string;
  viewKey: string;
}

interface ViewConfig {
  key: string;
  label: string;
  title: string;
  angles: AngleConfig[];
}

// ─── Scenario Tabs ───────────────────────────────────────────────────

const SCENARIO_TABS = [
  { key: "indoor_a",    label: "Indoor Office A",   scenario: "INDOOR OFFICE A"   },
  { key: "indoor_b",    label: "Indoor Office B",   scenario: "INDOOR OFFICE B"   },
  { key: "indoor_c",    label: "Indoor Office C",   scenario: "INDOOR OFFICE C"   },
  { key: "courtyard",   label: "Outdoor Courtyard", scenario: "OUTDOOR COURTYARD" },
  { key: "fifth",       label: "Outdoor Rooftop",   scenario: "OUTDOOR ROOFTOP"   },
];

// ─── View + Angle Config ────────────────────────────────────────────────────────
// Each view has 5 angles (scenarios), but all share the same fieldName (the view name)

const VIEW_CONFIGS: ViewConfig[] = [
  { 
    key: "view1", 
    label: "View 1", 
    title: "View 1", 
    angles: SCENARIO_TABS.map((s, index) => ({ 
      key: `view1_${s.key}`, 
      label: s.label, 
      title: `View 1 – ${s.label}`, 
      fieldName: "View 1", // Backend expects exactly "View 1"
      sampleScenario: s.scenario,
      viewKey: "view1",
      sequence: index // Track order
    })) 
  },
  { 
    key: "view2", 
    label: "View 2", 
    title: "View 2", 
    angles: SCENARIO_TABS.map((s, index) => ({ 
      key: `view2_${s.key}`, 
      label: s.label, 
      title: `View 2 – ${s.label}`, 
      fieldName: "View 2",
      sampleScenario: s.scenario,
      viewKey: "view2",
      sequence: index
    })) 
  },
  { 
    key: "view3", 
    label: "View 3", 
    title: "View 3", 
    angles: SCENARIO_TABS.map((s, index) => ({ 
      key: `view3_${s.key}`, 
      label: s.label, 
      title: `View 3 – ${s.label}`, 
      fieldName: "View 3",
      sampleScenario: s.scenario,
      viewKey: "view3",
      sequence: index
    })) 
  },
  { 
    key: "view4", 
    label: "View 4", 
    title: "View 4", 
    angles: SCENARIO_TABS.map((s, index) => ({ 
      key: `view4_${s.key}`, 
      label: s.label, 
      title: `View 4 – ${s.label}`, 
      fieldName: "View 4",
      sampleScenario: s.scenario,
      viewKey: "view4",
      sequence: index
    })) 
  },
];

// Flat list of all 20 angle configs
const ALL_ANGLES: AngleConfig[] = VIEW_CONFIGS.flatMap((v) => v.angles);

// ─── Component ─────────────────────────────────────────────────────────────────

const SubmissionImageUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<Record<string, File | null>>({});
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");

  const { taskId } = useParams<{ taskId: string }>();

  const { uploadImageMutation, isUploadImageLoading } = microTaskMutationService.useUploadSubmissionImage();
  const { deleteImageMutation, isDeleteImageLoading } = microTaskMutationService.useDeleteSubmissionImage();
  const { singleTask, isTaskLoading } = microTaskQueryService.useGetSingleTask(taskId ?? "");
  const { singleTaskApplication, taskApplicationRefetch } = microTaskQueryService.useGetSingleTaskApplication(taskId ?? "");
    const images = singleTaskApplication?.images || [] as ImageSchema[];

  // console.log("Single Task Application:", singleTaskApplication);

  // Get images grouped by view and scenario order
 // Get images grouped by view and sorted by sequence
  const getImagesForView = (viewKey: string): ImageSchema[] => {
    const viewImages = images.filter((img) => img.label === viewKey);
  
    
    // Sort by sequence number from metadata if available, otherwise by creation order
    return viewImages.sort((a, b) => {
      const seqA = a.metadata?.imageSequence ?? 0;
      const seqB = b.metadata?.imageSequence ?? 0;
      return seqA - seqB;
    });
  };


  const getSampleImage = (scenario: string) => {
    let sample = ImageSamples.find((s) => s.imageText.includes(scenario));
    if (!sample && scenario === "OUTDOOR ROOFTOP") {
      sample = ImageSamples.find((s) => s.imageText.includes("OUTDOOR COURTYARD"));
    }
    return sample;
  };

  /** Returns the uploaded image for a specific angle based on its sequence in the view */
  const getUploadedImageForAngle = (angle: AngleConfig): ImageSchema | undefined => {
    const viewImages = getImagesForView(angle.fieldName);
    // The sequence determines which image in the array belongs to this angle
    // Since images are uploaded in order, the index should match
    const imageIndex = SCENARIO_TABS.findIndex(s => s.label === angle.label);
    return viewImages[imageIndex];
  };

  // ─── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteImage = (image: ImageSchema, angle: AngleConfig) => {
    if (!taskId || !image._id) {
      notification.error({ message: "Delete Failed", description: "Required IDs not found.", key: "delete-error" });
      return;
    }
    
    Modal.confirm({
      title: 'Delete Image',
      content: `Are you sure you want to delete the image for ${angle.title}?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        deleteImageMutation.mutate(
          { 
            taskApplicationId: singleTaskApplication?._id ?? "", 
            publicId: image.publicId, 
            taskId, 
            imageId: image._id 
          },
          {
            onSuccess: () => {
              notification.success({ message: "Image Deleted", description: "Image removed successfully.", key: "delete-success" });
              taskApplicationRefetch();
            },
            onError: (error) => {
              notification.error({ message: "Delete Failed", description: getErrorMessage(error) || "Failed to delete image.", key: "delete-error" });
            },
          }
        );
      },
    });
  };

  // ─── Upload ────────────────────────────────────────────────────────────────
  // We need to upload multiple images at once for each view
  // But since the UI is tab-based, we'll upload one at a time
  // The backend expects all images for a view to be uploaded with the same field name

  const handleFileUpload = async (angle: AngleConfig) => {
    const file = selectedFile[angle.key];
    if (!file) {
      notification.warning({ message: "No File Selected", description: "Please select an image before uploading." });
      return;
    }
    if (!taskId) {
      notification.error({ message: "Task ID Missing", description: "Cannot upload without a valid task ID.", key: "upload-error" });
      return;
    }

    const formData = new FormData();
    formData.append("taskId", taskId);
    // Use the view name as the field name (View 1, View 2, etc.)
    formData.append(angle.fieldName, file);

    uploadImageMutation.mutate(formData, {
      onSuccess: () => {
        notification.success({ message: "Upload Successful", description: `${angle.title} uploaded.`, key: "upload-success" });
        taskApplicationRefetch();
        setSelectedFile((prev) => ({ ...prev, [angle.key]: null }));
      },
      onError: (error) => {
        notification.error({ message: "Upload Failed", description: getErrorMessage(error) || "Failed to upload image.", key: "upload-error" });
      },
    });
  };

  // ─── Upload Props ──────────────────────────────────────────────────────────

  const getUploadProps = (angleKey: string): UploadProps => ({
    beforeUpload: (file: RcFile) => {
      // Check if this angle already has an image
      const angle = ALL_ANGLES.find(a => a.key === angleKey);
      if (angle && getUploadedImageForAngle(angle)) {
        notification.warning({ 
          message: "Image Already Uploaded", 
          description: `An image already exists for ${angle.title}. Use the Replace button to change it.` 
        });
        return Upload.LIST_IGNORE;
      }
      
      if (!file.type.startsWith("image/")) {
        notification.error({ message: "Invalid File Type", description: `${file.name} is not an image.` });
        return Upload.LIST_IGNORE;
      }
      if (file.size > 10 * 1024 * 1024) {
        notification.error({ message: "File Too Large", description: `${file.name} exceeds 10 MB.` });
        return Upload.LIST_IGNORE;
      }
      setSelectedFile((prev) => ({ ...prev, [angleKey]: file }));
      return Upload.LIST_IGNORE;
    },
    accept: "image/*",
    multiple: false,
    showUploadList: false,
    customRequest: ({ onSuccess }) => onSuccess?.("ok"),
  });

  // ─── Angle Tab Label ───────────────────────────────────────────────────────

  const renderAngleTabLabel = (angle: AngleConfig) => {
    const uploadedImage = getUploadedImageForAngle(angle);
    const isUploaded = !!uploadedImage;
    const hasSelected = !!selectedFile[angle.key];

    return (
      <Space size={6}>
        <span>{angle.label}</span>
        {isUploaded ? (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 12 }} />
        ) : hasSelected ? (
          <CheckCircleOutlined style={{ color: "#faad14", fontSize: 12 }} />
        ) : null}
      </Space>
    );
  };

  // ─── View Tab Label (with mini progress) ──────────────────────────────────

  const renderViewTabLabel = (view: ViewConfig) => {
    const uploadedInView = view.angles.filter((a) => !!getUploadedImageForAngle(a)).length;
    const total = view.angles.length;
    const allDone = uploadedInView === total;

    return (
      <Space size={6}>
        <span>{view.label}</span>
        <Tag
          color={allDone ? "success" : uploadedInView > 0 ? "processing" : "default"}
          style={{ fontSize: 11, padding: "0 5px", lineHeight: "18px" }}
        >
          {uploadedInView}/{total}
        </Tag>
      </Space>
    );
  };

  // ─── Angle Tab Content ─────────────────────────────────────────────────────

  const renderAngleTab = (angle: AngleConfig) => {
    const file = selectedFile[angle.key] ?? null;
    const previewUrl = file ? URL.createObjectURL(file) : null;
    const sampleImage = getSampleImage(angle.sampleScenario);
    const uploadedImage = getUploadedImageForAngle(angle);
    const isUploaded = !!uploadedImage;

    return (
      <div style={{ padding: "20px 4px" }}>
        <Row gutter={32} align="top">

          {/* ── LEFT: Reference sample ── */}
          <Col
            xs={24}
            md={9}
            style={{
              background: "#f8faff",
              borderRadius: 10,
              padding: 16,
              border: "1px solid #e6eeff",
              marginBottom: 16,
            }}
          >
            <Text strong style={{ color: "#1890ff", fontSize: 13, display: "block", marginBottom: 4 }}>
              📸 Reference Sample
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 14 }}>
              Your image should match this angle / perspective
            </Text>

            {sampleImage ? (
              <div style={{ textAlign: "center" }}>
                <Image
                  src={sampleImage.imageUrl}
                  alt={sampleImage.imageText}
                  width="100%"
                  height="auto"
                  style={{ borderRadius: 7, objectFit: "cover", border: "2px solid #d6e4ff", maxHeight: 200, cursor: "pointer" }}
                  preview={false}
                  onClick={() => {
                    setPreviewImageUrl(sampleImage.imageUrl);
                    setPreviewModalVisible(true);
                  }}
                />
                <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>
                  {sampleImage.imageText}
                </div>
              </div>
            ) : (
              <div style={{ color: "#bbb", fontSize: 13, textAlign: "center", paddingTop: 20 }}>
                No sample image available
                <div style={{ fontSize: 11, marginTop: 8 }}>
                  Please refer to the angle description
                </div>
              </div>
            )}
          </Col>

          {/* ── RIGHT: Upload zone ── */}
          <Col xs={24} md={15}>

            {/* Already-uploaded banner */}
            {isUploaded && uploadedImage && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "10px 14px",
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 16 }} />
                <Text style={{ color: "#389e0d", fontWeight: 500, fontSize: 13 }}>
                  Image already uploaded for this angle
                </Text>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setPreviewImageUrl(uploadedImage.url);
                      setPreviewModalVisible(true);
                    }}
                    icon={<EyeOutlined />}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={isDeleteImageLoading ? <Spin size="small" /> : <DeleteOutlined />}
                    disabled={isDeleteImageLoading}
                    onClick={() => handleDeleteImage(uploadedImage, angle)}
                  >
                    Replace
                  </Button>
                </div>
              </div>
            )}

            {/* Dragger — only when no image uploaded yet */}
            {!isUploaded && (
              <Dragger
                {...getUploadProps(angle.key)}
                style={{
                  border: `2px dashed ${file ? "#52c41a" : "#1890ff"}`,
                  borderRadius: 10,
                  backgroundColor: file ? "#f6ffed" : "#f0f7ff",
                  cursor: "pointer",
                  marginBottom: file ? 16 : 0,
                }}
              >
                <div style={{ padding: "24px 16px", textAlign: "center" }}>
                  <CameraOutlined
                    style={{ fontSize: 40, color: file ? "#52c41a" : "#1890ff", marginBottom: 10 }}
                  />
                  <p style={{ color: file ? "#52c41a" : "#1890ff", fontWeight: 500, fontSize: 15, margin: "4px 0" }}>
                    {file ? "Image Selected — Ready to Upload" : "Drag & Drop or Click to Select"}
                  </p>
                  <p style={{ color: "#aaa", fontSize: 12, margin: 0 }}>
                    {file ? file.name : "1 image only • Max 10 MB • JPG, PNG, GIF"}
                  </p>
                </div>
              </Dragger>
            )}

            {/* Preview of pending file */}
            {file && previewUrl && !isUploaded && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: 14,
                  background: "#fff",
                  border: "1px solid #e0e0e0",
                  borderRadius: 10,
                  marginBottom: 14,
                }}
              >
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={previewUrl}
                    alt="preview"
                    style={{ width: 100, height: 76, objectFit: "cover", borderRadius: 7, border: "1px solid #e0e0e0", cursor: "pointer" }}
                    onClick={() => {
                      setPreviewImageUrl(previewUrl);
                      setPreviewModalVisible(true);
                    }}
                  />
                  <Button
                    size="small"
                    shape="circle"
                    danger
                    icon={<DeleteOutlined />}
                    style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, minWidth: 22, fontSize: 10 }}
                    onClick={() => setSelectedFile((prev) => ({ ...prev, [angle.key]: null }))}
                  />
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <Text strong style={{ fontSize: 13, display: "block", wordBreak: "break-all" }}>
                    {file.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                  </Text>
                </div>
              </div>
            )}

            {/* Uploaded image preview */}
            {isUploaded && uploadedImage && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: 14,
                  background: "#fff",
                  border: "1px solid #b7eb8f",
                  borderRadius: 10,
                }}
              >
                <img
                  src={uploadedImage.url}
                  alt={uploadedImage.label}
                  style={{ width: 100, height: 76, objectFit: "cover", borderRadius: 7, border: "1px solid #e0e0e0", cursor: "pointer" }}
                  onClick={() => {
                    setPreviewImageUrl(uploadedImage.url);
                    setPreviewModalVisible(true);
                  }}
                />
                <div>
                  <Tag color="green" style={{ marginBottom: 6 }}>
                    {angle.label}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
                    Uploaded {moment(uploadedImage.updatedAt || uploadedImage.createdAt).format("MMM DD, YYYY HH:mm")}
                  </Text>
                </div>
              </div>
            )}

            {/* Upload button */}
            {file && !isUploaded && (
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={() => handleFileUpload(angle)}
                loading={isUploadImageLoading}
                disabled={isUploadImageLoading}
                block
                size="large"
                style={{ marginTop: 4, borderRadius: 8 }}
              >
                Upload {angle.title}
              </Button>
            )}
          </Col>
        </Row>
      </div>
    );
  };

  // ─── Loading ───────────────────────────────────────────────────────────────

  if (isTaskLoading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading task details...</div>
      </div>
    );
  }

  // ─── Overall progress ──────────────────────────────────────────────────────

  const totalUploaded = ALL_ANGLES.filter((a) => !!getUploadedImageForAngle(a)).length;
  const totalAngles = ALL_ANGLES.length;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      <Modal
        open={previewModalVisible}
        footer={null}
        onCancel={() => setPreviewModalVisible(false)}
        width="auto"
        centered
      >
        <img alt="preview" src={previewImageUrl} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain" }} />
      </Modal>

      <Card
        title={
          <Space>
            <CameraOutlined style={{ color: "#1890ff" }} />
            <span>Upload Images: {singleTask?.task?.taskTitle ?? ""}</span>
          </Space>
        }
        extra={
          <Space align="center">
            <Text type="secondary" style={{ fontSize: 13 }}>
              Overall Progress:
            </Text>
            <Tag
              color={totalUploaded === totalAngles ? "green" : "orange"}
              style={{ fontWeight: 700, fontSize: 13 }}
            >
              {totalUploaded} / {totalAngles}
            </Tag>
          </Space>
        }
        style={{ marginBottom: 16, borderRadius: 12 }}
        bodyStyle={{ paddingTop: 8, paddingBottom: 8 }}
      >
        <Progress
          percent={Math.round((totalUploaded / totalAngles) * 100)}
          strokeColor={totalUploaded === totalAngles ? "#52c41a" : "#1890ff"}
          style={{ marginBottom: 0 }}
        />
      </Card>

      <Card style={{ borderRadius: 12 }} bodyStyle={{ paddingTop: 0 }}>
        <Tabs
          size="middle"
          items={VIEW_CONFIGS.map((view) => ({
            key: view.key,
            label: renderViewTabLabel(view),
            children: (
              <Tabs
                type="line"
                size="small"
                style={{ marginTop: 8 }}
                items={view.angles.map((angle) => ({
                  key: angle.key,
                  label: renderAngleTabLabel(angle),
                  children: renderAngleTab(angle),
                }))}
              />
            ),
          }))}
        />
      </Card>
    </div>
  );
};

export default SubmissionImageUpload;