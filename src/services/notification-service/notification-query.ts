import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationFiltersSchema, NotificationsResponseSchema } from "../../validators/notification/notification-schema";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { buildQueryParams } from "./notification-helpers";


const useUserNotificationQuery = (params: NotificationFiltersSchema) => {
    const queryParams = buildQueryParams(params);

    const query = useQuery({
        queryKey: ["userNotifications", queryParams], 
        queryFn: async (): Promise<NotificationsResponseSchema> => {
           const response = await axiosInstance.get<NotificationsResponseSchema>(`${endpoints.notifications.getUserNotifications}?${queryParams}`);
           const result = NotificationsResponseSchema.safeParse(response.data);
           if (!result.success) {
                const errorMessages = result.error.issues[0]?.message || "Invalid response format";
                console.error(errorMessages);
                throw new Error(errorMessages);
           }
           return result.data;
        },
       select: (data) => ({
            notifications: data.data.notifications,
            pagination: data.data.pagination,
            summary: data.data.summary,
        }),
        staleTime: 30_000,
    });

    return {
        data: query,
        isNotificationsLoading: query.isLoading,
        isNotificationsError: query.isError,
        notificationsError: query.error,
        notifications: query.data?.notifications,
        pagination: query.data?.pagination,
        summary: query.data?.summary,
        refreshNotifications: () => query.refetch(),
    }
}


const notificationQueryService = {
    useUserNotificationQuery,
}

export default notificationQueryService;