import { CommentOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";

const CustomerService: React.FC = () => {
  return (
    <FloatButton
      icon={<CommentOutlined />}
      tooltip={<span className="!font-[gilory-regular]">Contact Support</span>}
      href="mailto:support@mydeeptech.ng"
    />
  );
};

export default CustomerService;
