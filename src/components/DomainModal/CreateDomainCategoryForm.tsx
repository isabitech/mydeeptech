import {
    Form,
    Input,
    Button,
    message,
} from "antd";

const { TextArea } = Input;

import { useDomainActions } from "../../store/useDomainStore";
import domainMutation from "../../services/domain-service/domain-mutation";
import { CreateDomainSchema } from "../../validators/domain/domain-validator";
import ErrorMessage from "../../lib/error-message";

const CreateDomainCategoryForm = () => {
    const [categoryForm] = Form.useForm();
    const [subDomainForm] = Form.useForm();
    const [domainForm] = Form.useForm();

    const { onCancel, setActiveTab } = useDomainActions();
    const addDomainCategory = domainMutation.useAddDomainCategory();
    const isDomainMutationLoading = addDomainCategory.isPending;

    const handleCategorySubmit = async (formValues: CreateDomainSchema) => {
        addDomainCategory.mutate(formValues, {
            onSuccess: () => {
                message.success("Domain Category created successfully!");
                categoryForm.resetFields();
            },
            onError: (error) => {
                message.error(ErrorMessage(error));
            }
        })
    };

    const handleCancel = () => {
        categoryForm.resetFields();
        subDomainForm.resetFields();
        domainForm.resetFields();
        setActiveTab("1");
        onCancel();
    };

    return (
        <Form
            form={categoryForm}
            layout="vertical"
            onFinish={handleCategorySubmit}
        >
            <Form.Item
                name="name"
                label="Category Name"
                rules={[{ required: true, message: "Please enter category name" }]}
            >
                <Input placeholder="Enter category name" />
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ message: "Please enter category description" }]}
            >
                <TextArea rows={4} placeholder="Enter category description" />
            </Form.Item>
            <Form.Item>
              <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel} disabled={isDomainMutationLoading}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isDomainMutationLoading}>
                        Create Category
                    </Button>
              </div>
            </Form.Item>
        </Form>
    )
}
export default CreateDomainCategoryForm