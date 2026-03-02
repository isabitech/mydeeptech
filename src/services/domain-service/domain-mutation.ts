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
  UpdateDomainSchema,
  UpdateDomainSubCategorySchema,
  UpdateDomainDomainSchema
} from "../../validators/domain/domain-validator";


const useAddDomainCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.createDomainCategory],
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

    mutationFn: async ({ id, ...payload }: UpdateDomainSchema) => {
      const response = await axiosInstance.patch(
        `${endpoints.domain.updateCategory}/${id}/update`,
        payload
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories],
      });

      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUERY.getDomainsWithCategorization],
      });
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
    mutationKey: [REACT_QUERY_KEYS.MUTATION.createDomainSubCategory],
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
    mutationKey: [REACT_QUERY_KEYS.MUTATION.createDomain],
    mutationFn: async (data: CreateDomainSchema) => {
      const response = await axiosInstance.post<CreateDomainSchemaResponse>(`${endpoints.domain.createDomain}/create`, data);
      return CreateDomainSchemaResponse.parse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainSubCategories] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomains] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainsWithCategorization] });
    },
  });
}

const useUpdateDomainSubCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.updateDomainSubCategory],
    mutationFn: async ({ id, domain_category, name, description }: UpdateDomainSubCategorySchema) => {
      const response = await axiosInstance.patch(
        `${endpoints.domain.updateSubCategory}/${id}/update`,
        { domain_category, name, description }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories],
      });
    },
  });
};

const useUpdateDomainDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.updateDomain],
    mutationFn: async ({ id, category, subCategory, name, description }: UpdateDomainDomainSchema) => {
      const response = await axiosInstance.patch(
        `${endpoints.domain.updateDomain}/${id}/update`,
        { domain_category: category, domain_sub_category: subCategory, name, description }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.QUERY.getDomainsWithCategorization],
      });
    },
  });
};

const useDeleteDomainSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.deleteDomainSubCategory],
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axiosInstance.delete(`${endpoints.domain.deleteSubCategory}/${id}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories] });
    },
  });
};

const useAssignDomainsToUser = () => {
  return useMutation({
    mutationFn: async (domainIds: string[]) => {
      const response = await axiosInstance.post(
        "/new-domain/user/assign",
        { domainIds }
      );
      return response.data;
    },
  });
};

const useRemoveDomainFromUser = () => {
  return useMutation({
    mutationFn: async (assignmentId: string) => {
      const response = await axiosInstance.post(
        `/new-domain/user/remove`,
        { data: { id: assignmentId } }
      );
      return response.data;
    },
  });
};


const useDeleteDomain = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.deleteDomain],
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axiosInstance.delete(`${endpoints.domain.deleteDomain}/${id}/delete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getDomainsWithCategorization] });
    },
  });
};


const domainMutation = {
  useAddDomainCategory,
  useUpdateDomainCategory,
  useDeleteDomainCategory,
  useAddDomainSubCategory,
  useCreateDomain,
  useUpdateDomainSubCategory,
  useUpdateDomainDomain,
  useDeleteDomain,
  useDeleteDomainSubCategory,
  useAssignDomainsToUser,
  useRemoveDomainFromUser
};

export default domainMutation;