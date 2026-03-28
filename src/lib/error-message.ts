import axios from "axios";


const resolveMessage = (err: any): string => {
  // Handle null/undefined
  if (!err) {
    return "An unknown error occurred.";
  }

  // Extract message from various error structures
  const message = 
    err?.response?.data?.data?.message ||
    err?.response?.data?.message ||
    err?.message ||
    (typeof err === "string" ? err : null);

  return message || "An unknown error occurred.";
};

const errorMessage = (error: unknown): string => {
  console.log("Error received in errorMessage function:", error);

  // Handle null or undefined errors
  if (error === null || error === undefined) {
    return "An unknown error occurred.";
  }

  if (axios.isAxiosError(error)) {
    return resolveMessage(error);
  }

  if (error instanceof Error) {
    return resolveMessage(error);
  }

  // Handle string errors
  if (typeof error === "string") {
    return error || "An unknown error occurred.";
  }

  return resolveMessage(error);
};

export default errorMessage;