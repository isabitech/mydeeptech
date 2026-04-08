import { Input } from 'antd';
import React from 'react'

type FormItemInputProps = React.ComponentProps<typeof Input.Password>;

const FormInput: React.FC<FormItemInputProps> = (props) => {
  return <Input.Password {...props} />
}

export default FormInput;