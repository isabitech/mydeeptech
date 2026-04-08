import axios, { AxiosError } from "axios";

interface ApiResponseData {
  message?: string;
  data?: {
    message?: string;
  };
}

interface ResolvableError {
  response?: {
    data?: ApiResponseData;
  };
  message?: string;
}

const resolveMessage = (err: ResolvableError | string): string => {
  if (!err) {
    return "An unknown error occurred.";
  }

  const message =
    typeof err === "string"
      ? err
      : err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        err?.message;

  return message || "An unknown error occurred.";
};

const errorMessage = (error: unknown): string => {
  if (error === null || error === undefined) {
    return "An unknown error occurred.";
  }

  if (axios.isAxiosError<ApiResponseData>(error)) {
    return resolveMessage(error as AxiosError<ApiResponseData> & ResolvableError);
  }

  if (error instanceof Error) {
    return resolveMessage(error);
  }

  if (typeof error === "string") {
    return error || "An unknown error occurred.";
  }

  if (typeof error === "object") {
    return resolveMessage(error as ResolvableError);
  }

  return "An unknown error occurred.";
};

export default errorMessage;