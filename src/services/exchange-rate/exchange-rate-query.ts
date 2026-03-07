import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

const useGetExchangeRateByCountry = (country: string, paginationParams?: PaginationParams, enabled: boolean = true) => {
  const { page = 1, limit = 50, search = '' } = paginationParams || {};
  
  const queryResponse =  useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getExchangeRateByCountry, { country, page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (country) params.append('country', country);
      const response = await axiosInstance.get(`${endpoints.exchangeRate.getByCountry}exchange-rate-by-country?${params.toString()}`);
      return response.data;
    },
    enabled: !!country && enabled, // Only run the query if country is provided AND enabled is true
  });

  return {
    exchangeRateData: queryResponse.data?.data || null,
    isExchangeRateLoading: queryResponse.isLoading,
    isExchangeRateError: queryResponse.isError,
    exchangeRateError: queryResponse.error,
    ...queryResponse,
  }
};


const exchangeRateQueryService = {
  useGetExchangeRateByCountry,
};

export default exchangeRateQueryService;