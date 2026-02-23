import { useMutation, useQueryClient } from "@tanstack/react-query";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { 
  CreateDomainCategoryResponseSchema, 
  CreateDomainCategorySchema, 
  CreateDomainSchema, 
  CreateDomainSchemaResponse, 
  CreateDomainSubCategoryResponseSchema, 
  CreateSubDomainCategorySchema, 
  DeleteDomainSchema, 
  UpdateDomainSchema 
} from "../../validators/domain/domain-validator";


const useAddDomainCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDomainCategorySchema) => {
      const response = await axiosInstance.post<CreateDomainCategoryResponseSchema>(`${endpoints.domain.addCategory}/create`, data);
      return CreateDomainCategoryResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories] });
    },
  });
};

const useUpdateDomainCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.updateDomainCategory],
        mutationFn: async (data: UpdateDomainSchema) => {
            const response = await axiosInstance.patch(`${endpoints.domain.updateCategory}/${data.id}/update`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories] });
        },
    });
};

const useDeleteDomainCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: [REACT_QUERY_KEYS.MUTATION.deleteDomainCategory],  
        mutationFn: async (data: DeleteDomainSchema) => {
        const response = await axiosInstance.delete(`${endpoints.domain.deleteCategory}/${data.id}/delete`);
        return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories] });
        },
    });
};

const useAddDomainSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSubDomainCategorySchema) => {
      const response = await axiosInstance.post<CreateDomainSubCategoryResponseSchema>(`${endpoints.domain.addSubCategory}/create`, data);
      return CreateDomainSubCategoryResponseSchema.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories] });
    },
  });
};

const useCreateDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateDomainSchema) => {
      const response = await axiosInstance.post<CreateDomainSchemaResponse>(`${endpoints.domain.createDomain}/create`, data);
       return CreateDomainSchemaResponse.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories]});
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainSubCategories]});
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomains]});
    },
  });
}


const domainMutation = {
  useAddDomainCategory,
  useUpdateDomainCategory,
  useDeleteDomainCategory,
  useAddDomainSubCategory,
  useCreateDomain,
};

export default domainMutation;