import React, { useState } from "react";
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
import { CreateDomainSchema } from "../../validators/domain/domain-validator";
import domainQueryService from "../../services/domain-service/domain-query";
import ErrorMessage from "../../lib/error-message";

const CreateDomainForm: React.FC = () => {
    const [domainForm] = Form.useForm();
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
    const { onCancel, setActiveTab } = useDomainActions();
    const addDomain = domainService.useCreateDomain();
    const isDomainMutationLoading = addDomain.isPending;

    const fetchDomainCategories = domainQueryService.useDomainCategories();
    const fetchDomainSubCategories = domainQueryService.useDomainSubCategories();
    const { data, refetch: refetchDomainCategories, isFetching: isFetchingDomainCategories } = fetchDomainCategories || {};
    const { data: subCategoryData } = fetchDomainSubCategories || {};
    const domainCategories = Array.isArray(data?.data.categories) ? data.data.categories : [];
    const domainSubCategories = Array.isArray(subCategoryData?.data.domainSubCategories) ? subCategoryData.data.domainSubCategories : [];

    // Filter sub-categories based on selected category
    const filteredSubCategories = selectedCategoryId 
        ? domainSubCategories.filter(subCategory => subCategory.domain_category._id === selectedCategoryId)
        : [];

    const handleCategoryChange = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        // Clear domain_sub_category field when category changes
        domainForm.setFieldValue('domain_sub_category', undefined);
    };

    const handleCategorySubmit = async (formValues: CreateDomainSchema) => {
        addDomain.mutate(formValues, {
            onSuccess: () => {
                message.success("Domain created successfully!");
                domainForm.resetFields();
            },
             onError: (error) => {
                message.error(ErrorMessage(error));
            }
        })
    };

    const handleCancel = () => {
        domainForm.resetFields();
        setActiveTab("1");
        onCancel();
    };

    return (
       <>
       <div className="w-full flex items-center justify-end">
        <Button size="small" 
        onClick={() => refetchDomainCategories()} 
        disabled={isDomainMutationLoading || isFetchingDomainCategories}>
            <SyncOutlined spin={isFetchingDomainCategories} /> Refresh
        </Button>
       </div>
        <Form
            form={domainForm}
            layout="vertical"
            onFinish={handleCategorySubmit}
        >
            <Form.Item
                name="name"
                label="Domain Name"
                rules={[{ required: true, message: "Please enter domain name" }]}
            >
                <Input placeholder="Enter domain name" />
            </Form.Item>

            <Form.Item
              name="domain_category"
              label="Category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select 
                placeholder="Select category"
                onChange={handleCategoryChange}
              >
                {domainCategories.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="domain_sub_category"
              label="Sub-Category"
              rules={[
                { 
                  required: filteredSubCategories.length > 0, 
                  message: "Please select a sub-category" 
                }
              ]}
            >
              <Select 
                placeholder="Select sub-category"
                disabled={!selectedCategoryId || filteredSubCategories.length === 0}
              >
                {filteredSubCategories.map((option) => (
                  <Option key={option._id} value={option._id}>
                    {option.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
                name="description"
                label="Description"
                rules={[{ message: "Please enter domain description" }]}
            >
                <TextArea rows={4} placeholder="Enter domain description" />
            </Form.Item>
            <Form.Item>
                <div className="flex justify-end gap-2">
                    <Button onClick={handleCancel} disabled={isDomainMutationLoading}>Cancel</Button>
                    <Button type="primary" htmlType="submit" loading={isDomainMutationLoading}>
                        Create Domain
                    </Button>
                </div>
            </Form.Item>
        </Form>
       </>
    )
}
export default CreateDomainForm