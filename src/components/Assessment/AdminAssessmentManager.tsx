
import { useState } from 'react';
import { Card, Tabs, Table, Button, Typography, Form, Modal } from 'antd';
import { PlusOutlined, YoutubeOutlined, UploadOutlined } from '@ant-design/icons';

import { assessmentColumns } from '../Assessment/adminassessmentmanager/columns/AssessmentColumn';
import { reelColumns } from '../Assessment/adminassessmentmanager/columns/ReelColumn';
import { useReelAssessmentData } from '../Assessment/adminassessmentmanager/hooks/UseReelAssessmentData';

import { AssessmentModal } from '../Assessment/adminassessmentmanager/modals/AssessmentModal';
import { ReelModal } from '../Assessment/adminassessmentmanager/modals/ReelModal';
import { BulkUploadModal } from '../Assessment/adminassessmentmanager/modals/BulkUploadModal';
import { ButtonModal } from '../Assessment/adminassessmentmanager/modals/ButtonModal';


import { multimediaAssessmentApi } from '../../service/axiosApi';
import { toast } from 'sonner';
import { AssessmentConfig, VideoReel } from '../Assessment/adminassessmentmanager/types';
import { Space } from 'lucide-react';
import AssesmentDomain from './AssesmentDomain';
const { Title } = Typography; 

interface AdminReelAssessmentManagerProps {
  onAssessmentCreated?: (assessment: AssessmentConfig) => void;
}




export const AdminReelAssessmentManager = ({onAssessmentCreated,} : AdminReelAssessmentManagerProps) => {
  const { assessments, videoReels, loading, reloadAssessments, reloadReels } =
    useReelAssessmentData();

  const [activeTab, setActiveTab] = useState('assessments');

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showReelModal, setShowReelModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showCaModal, setShowCaModal] = useState(false);

  const [editingAssessment, setEditingAssessment] = useState<AssessmentConfig | null>(null);
  const [editingReel, setEditingReel] = useState<VideoReel | null>(null);

  const [assessmentForm] = Form.useForm();
  const [reelForm] = Form.useForm();
  const [bulkUploadForm] = Form.useForm();

  // ================== Assessment handlers ==================
  const handleCreateAssessment = async (values: any) => {
    const res = await multimediaAssessmentApi.createAssessmentConfig(values);
    if (res.data?.success) {
      toast.success('Assessment created');
      onAssessmentCreated?.(res.data.data);
      reloadAssessments();
      setShowAssessmentModal(false);
      assessmentForm.resetFields();
    }
  };

  const handleUpdateAssessment = async (values: any) => {
    if (!editingAssessment) return;
    const res = await multimediaAssessmentApi.updateAssessmentConfig(
      editingAssessment.id,
      values
    );
    if (res.data?.success) {
      toast.success('Assessment updated');
      reloadAssessments();
      setEditingAssessment(null);
      setShowAssessmentModal(false);
    }
  };

  // ================== Reel handlers ==================
  const handleAddReel = async (values: any) => {
    const res = await multimediaAssessmentApi.addVideoReel(values);
    if (res.data?.success) {
      toast.success('Reel added');
      reloadReels();
      setShowReelModal(false);
      reelForm.resetFields();
    }
  };

  const handleUpdateReel = async (values: any) => {
    if (!editingReel) return;
    const res = await multimediaAssessmentApi.updateVideoReel(editingReel._id, values);
    if (res.success) {
      toast.success('Reel updated');
      reloadReels();
      setEditingReel(null);
      setShowReelModal(false);
    }
  };

  const handleBulkUpload = async (values: any) => {
    const urls = values.urls.split('\n').map((u: string) => u.trim()).filter(Boolean);
    const res = await multimediaAssessmentApi.bulkAddVideoReels({
      youtubeUrls: urls,
      defaultNiche: values.defaultNiche,
      defaultTags: values.defaultTags?.split(',') || [],
    });

    if (res.success) {
      toast.success('Bulk upload completed');
      reloadReels();
      setShowBulkUploadModal(false);
      bulkUploadForm.resetFields();
    }
  };

  
  return (
    <div className="w-full mx-auto p-6">
      <Title level={2}>Assessment Management</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Assessment Configurations" key="assessments">
          <Card
            extra={
              
                  <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => setShowActionsModal(true)}
    >
      New
    </Button>
            }
          >
            <Table
              rowKey="id"
              loading={loading}
              dataSource={assessments}
              columns={assessmentColumns(
                (record) => {
                  setEditingAssessment(record);
                  assessmentForm.setFieldsValue(record);
                  setShowAssessmentModal(true);
                },
                () => {}
              )}
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Video Reels" key="reels">
          <Card
            extra={
              <div className='flex gap-5'>
                <Button
                  icon={<UploadOutlined />}
                  onClick={() => setShowBulkUploadModal(true)}
                >
                  Bulk Upload
                </Button>
                <Button
                  type="primary"
                  icon={<YoutubeOutlined />}
                  onClick={() => {
                    setEditingReel(null);
                    reelForm.resetFields();
                    setShowReelModal(true);
                  }}
                >
                  Add Reel
                </Button>
              </div>
            }
          >
            <Table
              rowKey="_id"
              loading={loading}
              dataSource={videoReels}
              columns={reelColumns(
                (reel) => {
                  setEditingReel(reel);
                  reelForm.setFieldsValue({
                    ...reel,
                    tags: reel.tags?.join(', '),
                  });
                  setShowReelModal(true);
                },
                () => {}
              )}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>

      {/* ===== Modals ===== */}
      <AssessmentModal
        open={showAssessmentModal}
        editingAssessment={editingAssessment}
        form={assessmentForm}
        onCancel={() => {
          setShowAssessmentModal(false);
          setEditingAssessment(null);
        }}
        onSubmit={editingAssessment ? handleUpdateAssessment : handleCreateAssessment}
      />

      <ReelModal
        open={showReelModal}
        editingReel={editingReel}
        form={reelForm}
        onCancel={() => {
          setShowReelModal(false);
          setEditingReel(null);
        }}
        onSubmit={editingReel ? handleUpdateReel : handleAddReel}
      />

      <BulkUploadModal
        open={showBulkUploadModal}
        form={bulkUploadForm}
        onCancel={() => setShowBulkUploadModal(false)}
        onSubmit={handleBulkUpload}
      />

        <ButtonModal
        open={showActionsModal}
        onCancel={() => setShowActionsModal(false)}
        onCreateAssessmentClick={() => setShowAssessmentModal(true)}
        onCategoryFormClick={() => setShowCaModal(true)}
        />

        <Modal
          title="Pick your Domain"
          open={showCaModal}
          onCancel={() => setShowCaModal(false)}
          footer={null}
          width={800}
          destroyOnClose
          >
            <AssesmentDomain/>
          </Modal>

    </div>
  );
};
