import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock utility functions for development
export const getToken = () => {
  return {
    access_tk: import.meta.env.VITE_LUMI_API_KEY,
    refresh_tk: "mock-refresh-token-for-development"
  };
};

// You can add other mock utilities here if needed
export const formatDate = (date: Date) => date.toISOString();
export const generateId = () => Math.random().toString(36).substr(2, 9);


export const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};


export const formatVideoUrl = (url?: string): string => {
  if (!url) {
    return '';
  }

  // Match short URL format: youtu.be/VIDEO_ID
  const shortUrlMatch = url.match(/youtu\.be\/([\w-]+)/);
  if (shortUrlMatch) {
    return `https://www.youtube.com/watch?v=${shortUrlMatch[1]}`;
  }

  // Match long URL format and normalize if necessary
  const longUrlMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (longUrlMatch) {
    return `https://www.youtube.com/watch?v=${longUrlMatch[1]}`;
  }

  //vimeo and other urls here...

  return url;
};

