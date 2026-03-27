import React from "react";
import { Form, Select, Card } from "antd";

interface SkillsExperienceFormProps {
  isEditing: boolean;
}

const SkillsExperienceForm: React.FC<SkillsExperienceFormProps> = ({
  isEditing,
}) => {
  return (
    <Card title="Skills & Experience" className="mb-6">
      <Form.Item label="Annotation Skills" name="annotationSkills">
        <Select
          mode="multiple"
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Select annotation skills"
          options={[
            {
              value: "sentiment_analysis",
              label: "Sentiment Analysis",
            },
            {
              value: "entity_recognition",
              label: "Entity Recognition",
            },
            { value: "classification", label: "Classification" },
            { value: "object_detection", label: "Object Detection" },
            {
              value: "semantic_segmentation",
              label: "Semantic Segmentation",
            },
            { value: "transcription", label: "Transcription" },
            { value: "translation", label: "Translation" },
            {
              value: "content_moderation",
              label: "Content Moderation",
            },
            { value: "data_entry", label: "Data Entry" },
            { value: "text_annotation", label: "Text Annotation" },
            { value: "image_annotation", label: "Image Annotation" },
            { value: "audio_annotation", label: "Audio Annotation" },
            { value: "video_annotation", label: "Video Annotation" },
            { value: "3d_annotation", label: "3D Annotation" },
          ]}
        />
      </Form.Item>

      <Form.Item label="Tool Experience" name="toolExperience">
        <Select
          mode="multiple"
          disabled={!isEditing}
          className="!font-[gilroy-regular]"
          placeholder="Select tools you have experience with"
          options={[
            { value: "labelbox", label: "Labelbox" },
            { value: "scale_ai", label: "Scale AI" },
            { value: "appen", label: "Appen" },
            { value: "clickworker", label: "Clickworker" },
            {
              value: "mechanical_turk",
              label: "Amazon Mechanical Turk",
            },
            { value: "toloka", label: "Toloka" },
            { value: "remotasks", label: "Remotasks" },
            { value: "annotator_tools", label: "Annotator Tools" },
            { value: "custom_platforms", label: "Custom Platforms" },
          ]}
        />
      </Form.Item>
    </Card>
  );
};

export default SkillsExperienceForm;