import axios from "axios";
import { endpoints } from "../../../../store/api/endpoints";
import { useQuery } from "@tanstack/react-query";


const verifyAccountNumber = async (accountNumber: string, bankCode: string) => {
  try {
    const response = await axios.get(`${endpoints.payStack.verifyAccountDetails}?account_number=${accountNumber}&bank_code=${bankCode}`, {
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error verifying account number:", error);
    throw error;
  }
};


export const useVerifyAccountNumber = (accountNumber: string, bankCode: string) => {
  return useQuery({
    queryKey: ["verifyAccountNumber", accountNumber, bankCode],
    queryFn: () => verifyAccountNumber(accountNumber, bankCode),
    enabled: !!(accountNumber && bankCode && accountNumber.length === 10), // Auto-trigger when both params are available and account number is 10 digits
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};
