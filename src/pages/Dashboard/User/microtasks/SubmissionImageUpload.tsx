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
  List,
  Popover,
} from "antd";

const { Dragger } = Upload;
import {
  EyeOutlined,
  DeleteOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import type { UploadProps, UploadFile, RcFile } from "antd/es/upload/interface";
import moment from "moment";
import { microTaskQueryService, microTaskMutationService } from "../../../../services/micro-task-service";
import { getErrorMessage } from "../../../../service/apiUtils";
import { ImageSchema } from "../../../../validators/task/task-submission-schema";
import { ImageSamples } from "./image-data";
const { Title, Text } = Typography;

interface TaskSlot {
  _id: string;
  angle: string;
  time_period?: string;
  description: string;
  sort_order: number;
  uploaded: boolean;
  image_url?: string;
  image_id?: string;
  metadata: {
    angle?: string;
    time_period?: string;
    lighting?: string;
    background?: string;
    expression?: string;
  };
}

interface SubmissionImageUploadProps {
  submissionId?: string; // Optional for route-based usage
}

const SubmissionImageUpload: React.FC<SubmissionImageUploadProps> = () => {
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});

  const { taskId } = useParams<{ taskId: string}>();

  const { submission } = microTaskQueryService.useGetMicroTaskSubmissionDetails(taskId ?? "");
  const { uploadImageMutation, isUploadImageLoading } = microTaskMutationService.useUploadSubmissionImage();
  const { deleteImageMutation, isDeleteImageLoading} = microTaskMutationService.useDeleteSubmissionImage();
  const { singleTask, isTaskLoading} = microTaskQueryService.useGetSingleTask(taskId ?? "");
  const { singleTaskApplication, taskApplicationRefetch } = microTaskQueryService.useGetSingleTaskApplication(taskId ?? "");

  const handleDeleteImage = async (publicId: string, imageId: string) => {
    if (!taskId) {
      notification.error({
        message: "Delete Failed",
        description: "Task ID not found. Please refresh the page and try again.",
        key: "delete-error"
      });
      return;
    }

    if (!imageId) {
      notification.error({
        message: "Delete Failed",
        description: "Image ID not found. Please refresh the page and try again.",
        key: "delete-error"
      });
      return;
    }


    deleteImageMutation.mutate({
      taskApplicationId: singleTaskApplication?._id ?? "",
      publicId,
      taskId: taskId ?? "",
      imageId: imageId ?? "",
    }, {
      onSuccess: () => {
        notification.success({
          message: "Image Deleted",
          description: "Image removed successfully",
          key: "delete-success"
        });
        taskApplicationRefetch();
      },
      onError: (error) => {
        const errorMsg = getErrorMessage(error);
        notification.error({
          message: "Delete Failed",
          description: errorMsg || "Failed to delete image",
          key: "delete-error"
        });
      }
    });
  };


  const handleFileSelection = (files: File[], angle: string) => {
    setSelectedFiles(prev => {
      const existingFiles = prev[angle] || [];
      const newFiles = [...existingFiles, ...files];

      // Ensure we don't exceed the 5 file limit
      const limitedFiles = newFiles.slice(0, 5);
      
      return {
        ...prev,
        [angle]: limitedFiles
      };
    });
  };

  const handleRemoveFile = (fileIndex: number, angle: string) => {
    // Clean up object URL to prevent memory leaks
    const fileToRemove = selectedFiles[angle]?.[fileIndex];
    if (fileToRemove) {
      // Find and revoke any object URLs created for this file
      const objectURL = URL.createObjectURL(fileToRemove);
      URL.revokeObjectURL(objectURL);
    }
    
    setSelectedFiles(prev => ({
      ...prev,
      [angle]: (prev[angle] || []).filter((_, index) => index !== fileIndex)
    }));
    
  };

  const handleFileUpload = async (angle: string) => {
    const files = selectedFiles[angle];
    if (!files || files.length === 0) {
      notification.warning({
        message: "No Files Selected",
        description: "Please select files before uploading"
      });
      return;
    }

    if(!taskId) {
      notification.error({
        message: "Task ID Missing",
        description: "Cannot upload images without a valid task ID",
        key: "upload-error"
      });
      return; 
    }

    const formData = new FormData();
    formData.append("taskId", taskId ?? "");
    
    // Map angle to the correct field name expected by backend
    const angleToFieldMap: Record<string, string> = {
      'front': 'View 1',
      'left': 'View 2',
      'right': 'View 3',
      'back': 'View 4'
    };
    
    const fieldName = angleToFieldMap[angle] || 'View 1';

    files.forEach((file: File) => {
        formData.append(fieldName, file);
    });
  
    uploadImageMutation.mutate(formData, {
      onSuccess: () => {
        notification.success({
          message: "Upload Successful",
          description: "Images uploaded successfully",
          key: "upload-success"
        });
        taskApplicationRefetch();
         setSelectedFiles(prev => ({
        ...prev,
        [angle]: []
      }));
      },
      onError: (error) => {
        const errorMsg = getErrorMessage(error);
        notification.error({
          message: "Upload Failed",
          description: errorMsg || "Failed to upload image(s)",
          key: "upload-error"
        });
      }
    });
   
  };

  const getUploadPropsForAngle = (angle: string): UploadProps => {
    const currentFileCount = (selectedFiles[angle] || []).length;
    const isMaxReached = currentFileCount >= 5;
    
    // Convert local files to Upload component format for proper state management
    const uploadFileList: UploadFile[] = (selectedFiles[angle] || []).map((file, index) => ({
      uid: `${angle}-${index}`,
      name: file.name,
      status: 'done' as const,
      originFileObj: file as RcFile, // Cast to RcFile for compatibility
      url: URL.createObjectURL(file)
    }));
    
    return {
      fileList: uploadFileList,
      disabled: isMaxReached, 
      beforeUpload: (file: RcFile, fileList: RcFile[]) => {
        // Use actual current file count from state, not from fileList
        const actualCurrentCount = (selectedFiles[angle] || []).length;
        
        // Calculate how many new files are being added in this batch
        const newFilesCount = fileList.length;
        const totalAfterUpload = actualCurrentCount + newFilesCount;
        
        // If already at max, don't process any files
        if (actualCurrentCount >= 5) {
          console.log("Upload disabled - limit reached");
          notification.warning({
            message: "File Limit Reached",
            description: `Maximum of 5 files allowed for ${angle} angle.`
          });
          return Upload.LIST_IGNORE;
        }
        
        // Check if adding these files would exceed the limit
        if (totalAfterUpload > 5) {
          const remainingSlots = 5 - actualCurrentCount;
          notification.warning({
            message: "File Limit Exceeded",
            description: `Cannot add ${newFilesCount} files. Only ${remainingSlots} slot(s) remaining for ${angle} angle.`,
            key: "file-limit-warning"
          });
          return Upload.LIST_IGNORE;
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          notification.error({
            message: "Invalid File Type",
            description: `${file.name} is not an image file`
          });
          return Upload.LIST_IGNORE;
        }
        
        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          notification.error({
            message: "File Too Large",
            description: `${file.name} is larger than 10MB`
          });
          return Upload.LIST_IGNORE;
        }
        
        // For better UX with multiple files, add all files at once when the last file in the batch is processed
        const currentFileIndex = fileList.findIndex(f => f.uid === file.uid);
        const isLastFile = currentFileIndex === fileList.length - 1;
        
        if (isLastFile) {
          // Add all validated files at once
          const validatedFiles = fileList.filter(f => {
            return f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024;
          });
          handleFileSelection(validatedFiles, angle);
        }
        
        return Upload.LIST_IGNORE; // Prevent Upload component from managing the file
      },
      accept: "image/*",
      multiple: true, // Enable multiple file selection
      maxCount: 5,
      showUploadList: false,
      customRequest: ({ onSuccess }) => {
        // This shouldn't be called since we return LIST_IGNORE
        if (onSuccess) {
          onSuccess("ok");
        }
      },
      onChange: ({ fileList }: { fileList: UploadFile[] }) => {
        // Handle file removal from Upload component UI
        if (fileList.length < uploadFileList.length) {
          // A file was removed, sync with local state
          const removedFile = uploadFileList.find(
            uploadFile => !fileList.some(f => f.uid === uploadFile.uid)
          );
          if (removedFile) {
            const removedIndex = uploadFileList.findIndex(f => f.uid === removedFile.uid);
            if (removedIndex !== -1) {
              handleRemoveFile(removedIndex, angle);
            }
          }
        }
      }
    };
  };

  const renderFileList = (angle: string) => {
    const files = selectedFiles[angle] || [];
    if (files.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Selected Files ({files.length}/5)</Text>
          <Space>
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleFileUpload(angle)}
              disabled={files.length === 0 || isUploadImageLoading}
              loading={isUploadImageLoading}
            >
              Upload All ({files.length})
            </Button>
            <Button 
              size="small"
              onClick={() => setSelectedFiles(prev => ({ ...prev, [angle]: [] }))}
              disabled={files.length === 0 || isUploadImageLoading}
            >
              Clear All
            </Button>
          </Space>
        </div>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
          dataSource={files}
          renderItem={(file, index) => {
            const previewUrl = URL.createObjectURL(file);
            
            return (
              <List.Item>
                <Card 
                  size="small"
                  hoverable
                  cover={
                    <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
                      <img 
                        src={previewUrl}
                        alt={file.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                        onError={(e) => {
                          console.error(`Preview failed for ${file.name}:`, e);
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        display: 'flex',
                        gap: 4
                      }}>
                        <Popover
                          content={
                            <div>
                              <p><strong>Size:</strong> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                              <p><strong>Type:</strong> {file.type}</p>
                              <p><strong>Last Modified:</strong> {new Date(file.lastModified).toLocaleString()}</p>
                            </div>
                          }
                          title="File Details"
                        >
                          <Button size="small" shape="circle" icon={<EyeOutlined />} />
                        </Popover>
                        <Button 
                          size="small" 
                          shape="circle"
                          danger 
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            handleRemoveFile(index, angle);
                            URL.revokeObjectURL(previewUrl);
                          }}
                        />
                      </div>
                    </div>
                  }
                >
                  <Card.Meta 
                    title={
                      <div style={{ 
                        fontSize: '12px', 
                        fontWeight: 500, 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {file.name}
                      </div>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </Text>
                    }
                  />
                </Card>
              </List.Item>
            );
          }}
        />
      </div>
    );
  };

  // Helper function to get sample images for a specific angle
  const getSampleImagesForAngle = (angle: string) => {
    const angleMap: Record<string, string> = {
      'front': 'INDOOR OFFICE A',
      'left': 'INDOOR OFFICE B',
      'right': 'INDOOR OFFICE C',
      'back': 'OUTDOOR COURTYARD',
      'left_45': 'INDOOR OFFICE B',
      'right_45': 'INDOOR OFFICE C',
      'left_profile': 'INDOOR OFFICE B',
      'right_profile': 'INDOOR OFFICE C'
    };
    
    const scenarioName = angleMap[angle];
    if (!scenarioName) return [];
    
    // Return all 5 images from the specific scenario
    return ImageSamples.filter(sample => 
      sample.imageText.includes(scenarioName)
    );
  };

  // Helper function to create a single drag and drop component for each tab
  const createDragDropComponent = (angle: string, title: string) => {
    const fileCount = (selectedFiles[angle] || []).length;
    const isMaxReached = fileCount >= 5;
    const sampleImages = getSampleImagesForAngle(angle);
    
    return (
      <div style={{ padding: 16 }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <Title level={4} style={{ marginBottom: 8 }}>{title}</Title>
          <Text type="secondary">Drag and drop up to 5 images at once for this angle</Text>
        </div>
        
        {/* Reference Images Section */}
        {sampleImages.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 12, textAlign: 'center' }}>
              <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                📸 Reference Examples for {title}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Use these as reference for the angle and positioning
              </Text>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 12,
              flexWrap: 'wrap',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e1e5e9'
            }}>
              {sampleImages.map((sample) => (
                <div key={sample.id} style={{ 
                  textAlign: 'center',
                  maxWidth: '150px',
                  flex: '0 0 auto'
                }}>
                  <Image
                    src={sample.imageUrl}
                    alt={sample.imageText}
                    width={120}
                    height={90}
                    style={{ 
                      borderRadius: '6px',
                      objectFit: 'cover',
                      border: '2px solid #d9d9d9'
                    }}
                    preview={{
                      mask: <EyeOutlined style={{ fontSize: 16 }} />
                    }}
                  />
                  <div style={{ 
                    marginTop: '4px',
                    fontSize: '11px',
                    color: '#666',
                    lineHeight: '1.2'
                  }}>
                    {sample.imageText.split(' ').slice(-3).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Dragger
          {...getUploadPropsForAngle(angle)}
          style={{
            border: isMaxReached ? "2px dashed #d9d9d9" : "2px dashed #1890ff",
            borderRadius: 12,
            backgroundColor: isMaxReached ? "#f5f5f5" : "#f0f7ff",
            cursor: isMaxReached ? "not-allowed" : "pointer",
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p className="ant-upload-drag-icon">
              <CameraOutlined style={{ 
                fontSize: 48, 
                color: isMaxReached ? "#bfbfbf" : "#1890ff",
                marginBottom: 16
              }} />
            </p>
            <p className="ant-upload-text" style={{ 
              color: isMaxReached ? "#bfbfbf" : "#1890ff", 
              fontSize: 18, 
              fontWeight: 500,
              marginBottom: 8
            }}>
              {isMaxReached 
                ? `Maximum Files Reached (${fileCount}/5)` 
                : "Drag & Drop Images Here"}
            </p>
            <p className="ant-upload-hint" style={{ 
              color: isMaxReached ? "#bfbfbf" : "#999", 
              fontSize: 14,
              marginBottom: 0
            }}>
              {isMaxReached 
                ? "Remove files below to upload more" 
                : "or click to select files • Max 5 images • 10MB each • JPG, PNG, GIF"}
            </p>
          </div>
        </Dragger>
        
        {renderFileList(angle)}
      </div>
    );
  };

  // Generate tabs dynamically based on available slots or default angles
  const generateTabItems = () => {
    // If we have actual slots from the backend, use them
    if (submission?.slots && submission.slots.length > 0) {
      const groupedSlots = groupSlotsByAngle(submission.slots);
      
      return Object.entries(groupedSlots).map(([angle, slots]) => {
        const normalizedAngle = angle.toLowerCase().replace(/\s+/g, '_').replace(/°/g, '');
        return {
          key: normalizedAngle,
          label: getAngleTabLabel(normalizedAngle),
          children: createDragDropComponent(normalizedAngle, slots[0].description || angle),
          // Store the real slots for this angle so we can access them later
          realSlots: slots
        };
      });
    }
    
    // Create default tabs with View 1, View 2, View 3, and View 4
    const defaultTabs = [
      { key: 'front', label: 'View 1', title: 'View 1' },
      { key: 'left', label: 'View 2', title: 'View 2' },
      { key: 'right', label: 'View 3', title: 'View 3' },
      { key: 'back', label: 'View 4', title: 'View 4' }
    ];
    return defaultTabs.map(tab => ({
      key: tab.key,
      label: tab.label,
      children: createDragDropComponent(tab.key, tab.title)
    }));
  };

  const getAngleTabLabel = (angle: string): string => {
    const angleMap: Record<string, string> = {
      'front': 'View 1',
      'left': 'View 2',
      'right': 'View 3',
      'back': 'View 4',
      'left_45': 'View 2',  
      'right_45': 'View 3',
      'left_profile': 'View 2',
      'right_profile': 'View 3',
      'down_profile': 'View 4'
    };
    return angleMap[angle] || `View ${angle.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
  };

  const groupSlotsByAngle = (slots: TaskSlot[]) => {
    const grouped = slots.reduce((acc, slot) => {
      const angle = slot.angle || 'unknown';
      if (!acc[angle]) {
        acc[angle] = [];
      }
      acc[angle].push(slot);
      return acc;
    }, {} as Record<string, TaskSlot[]>);
    return grouped;
  };

  if (isTaskLoading) {
    return (
      <div style={{ textAlign: "center", padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading task details...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>

      {/* Upload Slots  */}
      <Card title={`Upload Your Images: ${singleTask?.task?.taskTitle ?? ""}`} style={{ marginBottom: 24 }}>
        <Tabs
          defaultActiveKey="front"
          type="card"
          size="large"
          items={generateTabItems()}
        />
      </Card>

      {/* Uploaded Images Display */}
      {singleTaskApplication?.images && singleTaskApplication.images.length > 0 && (
        <Card title="Uploaded Images" style={{ marginBottom: 24 }}>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }}
            dataSource={singleTaskApplication.images}
            renderItem={(image: ImageSchema, index: number) => (
              <List.Item>
                <Card 
                  size="default"
                  hoverable
                  cover={
                    <div className="flex items-center justify-center relative">
                     <div className=" flex flex-col gap-5 items-center justify-center  rounded-md h-[150px] w-full overflow-hidden">
                       <Image
                        src={image.url}
                        alt={`${image.label} image`}
                        className="!w-full object-fill rounded-md"
                        preview={{
                          mask: <EyeOutlined style={{ fontSize: 20 }} />
                        }}
                      />
                     </div>
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        gap: 4
                      }}>
                        <Button 
                          size="small" 
                          shape="circle"
                          danger 
                          disabled={isDeleteImageLoading}
                          icon={ isDeleteImageLoading ? <Spin size="small" /> : <DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(image.publicId, image._id);
                          }}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderColor: '#ff4d4f'
                          }}
                        />
                      </div>
                    </div>
                  }
                >
                  <Card.Meta 
                    title={
                      <div className="text-[12px] font-medium text-center flex items-start">
                        <Tag color="blue">{image.label}</Tag> {index + 1}
                      </div>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '11px', textAlign: 'center' }}>
                        {moment(image.uploadedAt).format('MMM DD, HH:mm')}
                      </Text>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default SubmissionImageUpload;