import { useState } from "react";
import { endpoints } from "../store/api/endpoints";
import { retrieveTokenFromStorage } from "../helpers";
import { Profile, ProfileResponse } from "../utils/types";

interface GetProfileResult {
  success: boolean;
  data?: Profile;
  error?: string;
}





export const useGetProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const getProfile = async (userId: string): Promise<GetProfileResult> => {
    setLoading(true);
    setError(null);

    try {
      // Get authentication token
      const token = await retrieveTokenFromStorage();
      if (!token) {
        const errorMessage = "No authentication token found. Please login again.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoints.profileDT.getProfile}/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data: ProfileResponse = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        return { success: true, data: data.profile  };
      } else {
        const errorMessage = data.message || "Failed to fetch user profile";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred while fetching profile. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setProfile(null);
  };

  return {
    getProfile,
    loading,
    error,
    profile,
    resetState,
  };
};