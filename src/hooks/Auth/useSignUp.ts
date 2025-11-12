// src/hooks/useSignUpApi.ts
import { useState } from "react";
import { endpoints } from "../../store/api/endpoints";
import { apiPost, getErrorMessage } from "../../service/apiUtils";

type SignUpPayload = {
  fullName: string;
  phone: string;
  email: string;
  domains: string[];
  socialsFollowed: string[];
  consent: string;
};

type ApiResponse<T> = {
  data?: T;
  error?: string;
};

export function useSignUpApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signUp(payload: SignUpPayload): Promise<ApiResponse<any>> {
    setLoading(true);
    setError(null);

    try {
      const data = await apiPost(endpoints.authDT.createDTUser, payload);
      return { data };
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }

  return { signUp, loading, error };
  
}
