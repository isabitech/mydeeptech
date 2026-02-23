import axios from "axios";


const resolveMessage = (err: any): string => {
  return (
    err?.response?.data?.data?.message ||
    err?.response?.data?.message ||
    err?.message || "An unknown error occurred."
  );
};

const ErrorMessage = (error: any): string => {

  if (axios.isAxiosError(error)) {
    return resolveMessage(error);
  }

  if (error instanceof Error) {
    return resolveMessage(error);
  }

  return(resolveMessage(error));
};

export default ErrorMessage;