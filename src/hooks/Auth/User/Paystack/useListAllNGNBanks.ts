import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../service/axiosApi"
import { endpoints } from "../../../../store/api/endpoints"

export interface ListAllNGNBanksResponse {
  success: boolean
  message: string
  data: Data
}

export interface Data {
  banks: Bank[]
  meta: any
  summary: Summary
  filters_applied: FiltersApplied
  pagination: any
}

export interface Bank {
  id: number
  name: string
  slug: string
  code: string
  longcode: string
  gateway?: string
  pay_with_bank: boolean
  active: boolean
  country: string
  currency: string
  type: string
  is_deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Summary {
  total: number
  country: string
  active_banks: number
  inactive_banks: number
  countries_available: string[]
  currencies_available: string[]
}

export interface FiltersApplied {
  country: any
  perPage: number
  pay_with_bank_transfer: any
  pay_with_bank: any
  enabled_for_verification: any
  gateway: any
  type: any
  currency: any
  cursor_pagination: boolean
}


const listAllNGNBanks = async () : Promise<ListAllNGNBanksResponse> => {
    const response = await axiosInstance.get(`${endpoints.payStack.listAllNGNBanks}`)
    return response.data;
}

export const useListAllNGNBanks = () => {
    const response =  useQuery<ListAllNGNBanksResponse>({
        queryKey: ["listAllNGNBanks"],
        queryFn: listAllNGNBanks,
    })
    return {
        allNGNBanks: response.data?.data?.banks || [],
        isLoadingALLNGNBanks: response.isLoading,
        isErrorALLNGNBanks: response.isError,
        ...response,
    };
}