import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  CodeSandboxOutlined,
  WalletOutlined,
  BookOutlined,
  HistoryOutlined,
  CustomerServiceOutlined,
  PlayCircleOutlined,
  UnorderedListOutlined as AssessmentListOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { MenuItem } from "./types";

export const BASE_MENU_ITEMS: MenuItem[] = [
  { key: "overview", label: "Overview", icon: <HomeOutlined />, path: "/dashboard/overview" },
  { key: "assessment", label: "Assessment", icon: <BookOutlined />, path: "/dashboard/assessment" },
  { key: "assessment-history", label: "Assessment History", icon: <HistoryOutlined />, path: "/dashboard/assessment-history" },
  { key: "projects", label: "Projects", icon: <CodeSandboxOutlined />, path: "/dashboard/projects" },
  { key: "notifications", label: "Notifications", icon: <BellOutlined />, path: "/dashboard/notifications" },
  { key: "payment", label: "Payment", icon: <WalletOutlined />, path: "/dashboard/payment" },
  { key: "support", label: "Support Center", icon: <CustomerServiceOutlined />, path: "/dashboard/support" },
  { key: "profile", label: "Profile", icon: <UserOutlined />, path: "/dashboard/profile" },
  { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/dashboard/settings" },
];

export const QA_REVIEW_MENU_ITEM: MenuItem = {
  key: "qa-review",
  label: "QA Review",
  icon: <PlayCircleOutlined />,
  path: "/dashboard/qa-review"
};

export const ASSESSMENT_LIST_MENU_ITEM: MenuItem = {
  key: "assessments-list",
  label: "Assessments",
  icon: <AssessmentListOutlined />,
  path: "/dashboard/assessments"
};