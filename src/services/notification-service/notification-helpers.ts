import { NotificationFiltersSchema } from "../../validators/notification/notification-schema";

const buildQueryParams = (params: NotificationFiltersSchema) => {
    return new URLSearchParams({
        ...(params.page ? { page: params.page.toString() } : {}),
        ...(params.limit ? { limit: params.limit.toString() } : {}),
        ...(params.unreadOnly ? { unreadOnly: params.unreadOnly.toString() } : {}),
        ...(params.type ? { type: params.type } : {}),
        ...(params.priority ? { priority: params.priority } : {}),
    }).toString();
};

export { buildQueryParams };