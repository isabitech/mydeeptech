import React from "react";
import {
    Form,
    Input,
    Button,
    message,
    Select,
} from "antd";
import { SyncOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

import { useDomainActions } from "../../store/useDomainStore";
import domainService from "../../services/domain-service/domain-mutation";
import { CreateSubDomainCategorySchema } from "../../validators/domain/domain-validator";
import domainQueryService from "../../services/domain-service/domain-query";
import ErrorMessage from "../../lib/error-message";

const CreateSubDomainCategoryForm: React.FC = () => {
    const [subDomainForm] = Form.useForm();
    const { onCancel, setActiveTab } = useDomainActions();

    const addSubDomainCategory = domainService.useAddDomainSubCategory();
    const fetchDomainCategories = domainQueryService.useDomainCategories();

    const isDomainMutationLoading = addSubDomainCategory.isPending;
    const { data, refetch: refetchDomainCategories, isFetching: isFetchingDomainCategories } = fetchDomainCategories || {};
    const domainCategories = Array.isArray(data?.data.categories) ? data.data.categories : [];

    console.log("Domain Categories:", domainCategories);

    const handleSubCategorySubmit = async (formValues: CreateSubDomainCategorySchema) => {
        addSubDomainCategory.mutate(formValues, {
            onSuccess: () => {
                message.success("Sub-Domain Category created successfully!");
                subDomainForm.resetFields();
            },
             onError: (error) => {
                message.error(ErrorMessage(error));
            }
        })
    };

    const handleCancel = () => {
        subDomainForm.resetFields();
        setActiveTab("1");
        onCancel();
    };

    return (
        <>
         <div className="w-full flex items-center justify-end">
        <Button size="small" onClick={() => refetchDomainCategories()} disabled={isDomainMutationLoading || isFetchingDomainCategories}>
            <SyncOutlined spin={isFetchingDomainCategories} /> Refresh
        </Button>
       </div>
        <Form
            form={subDomainForm}
            layout="vertical"
            onFinish={handleSubCategorySubmit}
        >
            <Form.Item
                name="name"
                label="Sub-Category Name"
                rules={[{ required: true, message: "Please enter sub-category name" }]}
            >
                <Input placeholder="Enter sub-category name" />
            </Form.Item>

            <Form.Item
              name="domain_category"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select placeholder="Select category">
                {domainCategories.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ message: "Please enter sub-category description" }]}
            >
                <TextArea rows={4} placeholder="Enter sub-category description" />
            </Form.Item>
            <Form.Item>
                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel} disabled={isDomainMutationLoading}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isDomainMutationLoading}>
                        Create Sub-Category
                    </Button>
                </div>
            </Form.Item>
        </Form>
        </>

    )
}
export default CreateSubDomainCategoryForm