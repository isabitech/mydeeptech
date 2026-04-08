import React from 'react'
import { Form } from 'antd';

type FormItemProps = React.ComponentProps<typeof Form.Item>;

const FormField: React.FC<FormItemProps> = ({ children, ...formItemProps }) => {
  return (
    <Form.Item {...formItemProps}>
      {children}
    </Form.Item>
  );
};

export default FormField;