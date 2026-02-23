import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { GetDomainCategoriesResponseSchema, GetDomainSubCategoriesResponseSchema } from "../../validators/domain/domain-validator";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

const useDomainCategories = () => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getDomainCategories],
    queryFn: async () => {
      const response = await axiosInstance.get<GetDomainCategoriesResponseSchema>(`${endpoints.domain.getCategories}/find`);
      return GetDomainCategoriesResponseSchema.parse(response.data);
    },
  });
};

const useDomainSubCategories = () => {
  return useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getDomainSubCategories],
    queryFn: async () => {
      const response = await axiosInstance.get<GetDomainSubCategoriesResponseSchema>(`${endpoints.domain.getSubCategories}/find`);
      return GetDomainSubCategoriesResponseSchema.parse(response.data);
    },
  });
};


const domainQueryService = {
  useDomainCategories,
  useDomainSubCategories,
};

export default domainQueryService;