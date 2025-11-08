// src/hooks/useSignUpApi.ts
import { useState } from "react";
import { endpoints } from "../../store/api/endpoints";

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
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoints.authDT.createDTUser}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      return { data };
    } catch (err: any) {
      setError(err.message);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  }

  return { signUp, loading, error };
  
}
