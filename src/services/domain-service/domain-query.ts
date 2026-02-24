import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { GetDomainCategoriesResponseSchema, GetDomainSubCategoriesResponseSchema, GetDomainsResponseSchema } from "../../validators/domain/domain-validator";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

const useDomainCategories = (paginationParams?: PaginationParams) => {
  const { page = 1, limit = 10, search = '' } = paginationParams || {};
  
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories, { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      
      const response = await axiosInstance.get<GetDomainCategoriesResponseSchema>(
        `${endpoints.domain.getCategories}/find?${params.toString()}`
      );
      return GetDomainCategoriesResponseSchema.parse(response.data);
    },
  });
};

const useDomainSubCategories = (paginationParams?: PaginationParams) => {
  const { page = 1, limit = 10, search = '' } = paginationParams || {};
  
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getDomainSubCategories, { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      
      const response = await axiosInstance.get<GetDomainSubCategoriesResponseSchema>(
        `${endpoints.domain.getSubCategories}/find?${params.toString()}`
      );
      return GetDomainSubCategoriesResponseSchema.parse(response.data);
    },
  });
};

const useDomains = (paginationParams?: PaginationParams) => {
  const { page = 1, limit = 10, search = '' } = paginationParams || {};
  
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getDomains, { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      
      const response = await axiosInstance.get<GetDomainsResponseSchema>(
        `${endpoints.domain.getDomains}/find?${params.toString()}`
      );
      return GetDomainsResponseSchema.parse(response.data);
    },
  });
};


const domainQueryService = {
  useDomainCategories,
  useDomainSubCategories,
  useDomains,
};

export default domainQueryService;