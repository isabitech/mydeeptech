import { endpoints } from "../../../../store/api/endpoints";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../../service/axiosApi";

export interface VerifyAccountNumberResponse {
  success: boolean
  message: string
  data: Data
}

export interface Data {
  accountNumber: string
  accountName: string
  bankCode: string
  verified: boolean
  verificationDate: string
}


const verifyAccountNumber = async (accountNumber: string, bankCode: string): Promise<VerifyAccountNumberResponse> => {
  try {
    const response = await axiosInstance.get(`${endpoints.payStack.verifyAccountDetails}?accountNumber=${accountNumber}&bankCode=${bankCode}`, {
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying account number:", error);
    throw error;
  }
};


export const useVerifyAccountNumber = (accountNumber: string, bankCode: string) => {
  return useQuery<VerifyAccountNumberResponse>({
    queryKey: ["verifyAccountNumber", accountNumber, bankCode],
    queryFn: () => verifyAccountNumber(accountNumber, bankCode),
    enabled: !!(accountNumber && bankCode && accountNumber.length === 10), // Auto-trigger when both params are available and account number is 10 digits
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache results
    retry: 2,
  });
};
