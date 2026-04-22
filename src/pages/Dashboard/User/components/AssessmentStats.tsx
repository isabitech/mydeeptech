import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { AssessmentStatistics } from '../../../../types/assessment.types';

interface AssessmentStatsProps {
  statistics?: AssessmentStatistics[];
}

const AssessmentStats: React.FC<AssessmentStatsProps> = ({ statistics = [] }) => {
  if (!statistics.length) return null;

  const stats = statistics[0]; // Assuming one assessment type for now
  const passRate = stats.totalAttempts > 0 
    ? ((stats.passedAttempts / stats.totalAttempts) * 100).toFixed(1) 
    : '0';

  return (
    <Row gutter={16} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card className="text-center shadow-md border-0 rounded-xl">
          <Statistic
            title="Total Attempts"
            value={stats.totalAttempts}
            valueStyle={{ color: '#F6921E', fontFamily: 'gilroy-regular' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="text-center shadow-md border-0 rounded-xl">
          <Statistic
            title="Pass Rate"
            value={passRate}
            suffix="%"
            valueStyle={{ color: '#52c41a', fontFamily: 'gilroy-regular' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="text-center shadow-md border-0 rounded-xl">
          <Statistic
            title="Best Score"
            value={stats.bestScore}
            suffix="%"
            prefix={<TrophyOutlined />}
            valueStyle={{ color: '#1890ff', fontFamily: 'gilroy-regular' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card className="text-center shadow-md border-0 rounded-xl">
          <Statistic
            title="Average Score"
            value={stats.averageScore.toFixed(1)}
            suffix="%"
            valueStyle={{ color: '#722ed1', fontFamily: 'gilroy-regular' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AssessmentStats;
export { AssessmentStats };
