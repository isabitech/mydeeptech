import { ACCESS_TOKEN_KEYWORD, ADMIN_ACCESS_TOKEN_KEYWORD, USER_INFORMATION, ADMIN_USER_INFORMATION } from "./constants";
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
export const storeUserInfoToStorage = async (user: UserInfoData, roleType?: string) => {
  try {
    const encrypted = await Encryption.encrypt(JSON.stringify(user));
    // Determine storage key based on role
    const isAdminRole = roleType === 'admin';
    const storageKey = isAdminRole ? ADMIN_USER_INFORMATION : USER_INFORMATION;
    localStorage.setItem(storageKey, JSON.stringify(encrypted));
  } catch (error: unknown) {
    const errMsg = errorMessage(error);
    console.error(errMsg);
  }
};

// --- RETRIEVE USER INFO ---
export const retrieveUserInfoFromStorage = async (roleType?: string) => {
  if (typeof window === "undefined") return null;

  // Determine storage key based on role
  const isAdminRole = roleType === 'admin';
  const storageKey = isAdminRole ? ADMIN_USER_INFORMATION : USER_INFORMATION;
  
  const stored = localStorage.getItem(storageKey);
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
      localStorage.removeItem(storageKey);
      localStorage.removeItem(ACCESS_TOKEN_KEYWORD);
    }
    
    return null;
  }
};

// --- STORE TOKEN ---
export const storeTokenToStorage = async (token: string, roleType?: string) => {
  try {
    const encrypted = await Encryption.encrypt(token);
    // Determine storage key based on role
    const isAdminRole = roleType === 'admin';
    const storageKey = isAdminRole ? ADMIN_ACCESS_TOKEN_KEYWORD : ACCESS_TOKEN_KEYWORD;
    
    localStorage.setItem(storageKey, JSON.stringify(encrypted));
  } catch (error: Error | unknown) {
    const errMsg = errorMessage(error);
    console.error(`❌ Token Storage Error for ${roleType}:`, errMsg);
  }
};

// --- RETRIEVE TOKEN ---
export const retrieveTokenFromStorage = async (roleType?: string) => {
  if (typeof window === "undefined") return null;

  // If roleType is undefined, detect from current context
  let detectedRoleType = roleType;
  if (!detectedRoleType) {
    // Check current URL to determine context
    const currentPath = window.location.pathname;
    const isAdminContext = currentPath.includes('/admin');
    detectedRoleType = isAdminContext ? 'admin' : 'user';
  }

  // Determine storage key based on role
  const isAdminRole = detectedRoleType === 'admin';
  const storageKey = isAdminRole ? ADMIN_ACCESS_TOKEN_KEYWORD : ACCESS_TOKEN_KEYWORD;
  
  const stored = localStorage.getItem(storageKey);
  if (!stored) return null;

  try {
    const { data, iv } = JSON.parse(stored);
    const decryptedToken = await Encryption.decrypt(data, iv);
    return decryptedToken;
  } catch (error: Error | unknown) {
    const errMsg = errorMessage(error);
    console.error(`❌ Token Retrieval Error for ${detectedRoleType}:`, errMsg);
    
    // If decryption fails, clear the invalid stored data
    if (error instanceof Error && error.message.includes('Decryption failed')) {
      console.warn("Clearing corrupted token data");
      localStorage.removeItem(storageKey);
    }
    
    return null;
  }
};
