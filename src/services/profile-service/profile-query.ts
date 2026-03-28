import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { ProfileResponseSchema, type Profile } from "../../validators/profile/profile-schema";
import errorMessage from "../../lib/error-message";

const useGetProfile = (userId?: string) => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getUserProfile, userId],
    queryFn: async (): Promise<Profile> => {
      if (!userId) {
        throw new Error("User ID is required");
      }
      const response = await axiosInstance.get(`${endpoints.profileDT.getProfile}/${userId}`);
      
      try {
        // Validate response with zod schema
        const validatedData = ProfileResponseSchema.parse(response.data);
        
        if (!validatedData.success) {
          throw new Error(errorMessage(validatedData.message) || "Failed to fetch user profile");
        }
        return validatedData.profile;
      } catch (zodError: any) {
        console.warn("Zod validation error (using fallback):", zodError.message || zodError);
        
        // Fallback: return raw profile data if zod validation fails
        if (response.data?.success && response.data?.profile) {
          return response.data.profile;
        } else if (response.data?.profile) {
          return response.data.profile;
        }
        
        // If no profile data at all, throw error
        throw new Error(`Profile validation failed and no fallback data available: ${zodError.message || zodError}`);
      }
    },
    enabled: !!userId, // Only run query if userId is provided
  });

  return {
    profile: query.data,
    isProfileLoading: query.isLoading,
    isProfileError: query.isError,
    profileError: query.error,
    isProfileFetching: query.isFetching,
    profileRefetch: () => query.refetch(),
  };
};

const profileService = {
  useGetProfile,
};

export default profileService;