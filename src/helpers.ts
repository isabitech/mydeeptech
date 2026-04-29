import { ACCESS_TOKEN_KEYWORD, USER_INFORMATION } from "./constants";
import { Encryption } from "./encryption";
import errorMessage from "./lib/error-message";
import { UserInfoData } from "./store/useAuthStore";

export const RESPONSE_CODE = {
  successful: 200,
  badRequest: 400,
  noData: 204,
  internalServerError: 500,
  dataDuplication: 409,
  unauthorized: 401,
  invalidToken: 403,
  requestUnavailable: 503,
  tokenExpired: 410,
  CREATED: 201,
};

// --- STORE USER INFO ---
export const storeUserInfoToStorage = async (user: UserInfoData) => {
  try {
    const encrypted = await Encryption.encrypt(JSON.stringify(user));
    // Save as string
    localStorage.setItem(USER_INFORMATION, JSON.stringify(encrypted));
  } catch (error: unknown) {
    const errMsg = errorMessage(error);
    console.error(errMsg);
  }
};

// --- RETRIEVE USER INFO ---
export const retrieveUserInfoFromStorage = async () => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(USER_INFORMATION);
  if (!stored) return null;

  try {
    const { data, iv } = JSON.parse(stored);
    const decrypted = await Encryption.decrypt(data, iv);
    return JSON.parse(decrypted);
  } catch (error: Error | unknown) {
    const errMsg = errorMessage(error);
    console.error(errMsg);
    
    // If decryption fails, clear the invalid stored data
    if (error instanceof Error && error.message.includes('Decryption failed')) {
      console.warn("Clearing corrupted encrypted data");
      localStorage.removeItem(USER_INFORMATION);
      localStorage.removeItem(ACCESS_TOKEN_KEYWORD);
    }
    
    return null;
  }
};

// --- STORE TOKEN ---
export const storeTokenToStorage = async (token: string) => {
  try {
    const encrypted = await Encryption.encrypt(token);
    localStorage.setItem(ACCESS_TOKEN_KEYWORD, JSON.stringify(encrypted));
  } catch (error: Error | unknown) {
    const errMsg = errorMessage(error);
    console.error(errMsg);
  }
};

// --- RETRIEVE TOKEN ---
export const retrieveTokenFromStorage = async () => {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(ACCESS_TOKEN_KEYWORD);
  if (!stored) return null;

  try {
    const { data, iv } = JSON.parse(stored);
    return await Encryption.decrypt(data, iv);
  } catch (error: Error | unknown) {
    const errMsg = errorMessage(error);
    console.error(errMsg);
    
    // If decryption fails, clear the invalid stored data
    if (error instanceof Error && error.message.includes('Decryption failed')) {
      console.warn("Clearing corrupted token data");
      localStorage.removeItem(ACCESS_TOKEN_KEYWORD);
    }
    
    return null;
  }
};
