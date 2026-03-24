"use client";

import { ACCESS_TOKEN_KEYWORD, USER_INFORMATION } from "./constants";
import { Encryption } from "./encryption";

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
export const storeUserInfoToStorage = async (user: any) => {
  try {
    const encrypted = await Encryption.encrypt(JSON.stringify(user));
    // Save as string
    sessionStorage.setItem(USER_INFORMATION, JSON.stringify(encrypted));
  } catch (error: any) {
    console.error("Error storing user info:", error);
  }
};

// --- RETRIEVE USER INFO ---
export const retrieveUserInfoFromStorage = async () => {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(USER_INFORMATION);
  if (!stored) return null;

  try {
    const { data, iv } = JSON.parse(stored);
    const decrypted = await Encryption.decrypt(data, iv);
    return JSON.parse(decrypted);
  } catch (error: any) {
    console.error("Error retrieving user info:", error);
    
    // If decryption fails, clear the invalid stored data
    if (error.message?.includes('Decryption failed')) {
      console.warn("Clearing corrupted encrypted data");
      sessionStorage.removeItem(USER_INFORMATION);
      sessionStorage.removeItem(ACCESS_TOKEN_KEYWORD);
    }
    
    return null;
  }
};

// --- STORE TOKEN ---
export const storeTokenToStorage = async (token: string) => {
  try {
    const encrypted = await Encryption.encrypt(token);
    sessionStorage.setItem(ACCESS_TOKEN_KEYWORD, JSON.stringify(encrypted));
  } catch (error: any) {
    console.error("Error storing token:", error);
  }
};

// --- RETRIEVE TOKEN ---
export const retrieveTokenFromStorage = async () => {
  if (typeof window === "undefined") return null;

  const stored = sessionStorage.getItem(ACCESS_TOKEN_KEYWORD);
  if (!stored) return null;

  try {
    const { data, iv } = JSON.parse(stored);
    return await Encryption.decrypt(data, iv);
  } catch (error: any) {
    console.error("Error retrieving token:", error);
    
    // If decryption fails, clear the invalid stored data
    if (error.message?.includes('Decryption failed')) {
      console.warn("Clearing corrupted token data");
      sessionStorage.removeItem(ACCESS_TOKEN_KEYWORD);
    }
    
    return null;
  }
};
