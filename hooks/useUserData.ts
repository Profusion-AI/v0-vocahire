"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Create a safe wrapper around toast that works in both browser and SSR
// Avoids issues with the toast API during server-side rendering
const safeToast = {
  error: (message: string) => {
    // Only run on client
    if (typeof window !== 'undefined') {
      console.error('Toast error:', message);
      try {
        toast.error(message);
      } catch (e) {
        // Fallback if toast function fails
        console.error('Toast library error:', e);
      }
    }
  }
};

export interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string; // Assuming UserRole enum translates to string
  credits: number | null;
  isPremium: boolean;
  premiumSubscriptionId?: string | null;
  premiumExpiresAt?: string | null; // ISO date string
  // Add other fields from your User model that might be useful client-side
  resumeJobTitle?: string | null;
  resumeFileUrl?: string | null;
  jobSearchStage?: string | null;
  linkedinUrl?: string | null;
}

export interface UseUserDataReturn {
  user: UserData | null;
  credits: number | null;
  isPremium: boolean;
  isLoading: boolean;
  error: string | null;
  refetchUserData: () => Promise<void>;
}

export function useUserData(): UseUserDataReturn {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); // Try to parse error, default to empty obj
        throw new Error(errorData.error || `Failed to fetch user data. Status: ${res.status}`);
      }
      const data = await res.json();
      // Adjust according to your actual /api/user response structure
      const userDataFromApi = data.user || data; 
      if (userDataFromApi) {
        setUser({
            id: userDataFromApi.id,
            email: userDataFromApi.email,
            name: userDataFromApi.name,
            image: userDataFromApi.image,
            role: userDataFromApi.role,
            credits: userDataFromApi.credits !== null && userDataFromApi.credits !== undefined ? Number(userDataFromApi.credits) : null,
            isPremium: !!userDataFromApi.isPremium,
            premiumSubscriptionId: userDataFromApi.premiumSubscriptionId,
            premiumExpiresAt: userDataFromApi.premiumExpiresAt,
            resumeJobTitle: userDataFromApi.resumeJobTitle,
            resumeFileUrl: userDataFromApi.resumeFileUrl,
            jobSearchStage: userDataFromApi.jobSearchStage,
            linkedinUrl: userDataFromApi.linkedinUrl,
        });
      } else {
        throw new Error("User data not found in API response.");
      }
    } catch (e: any) {
      console.error("useUserData fetch error:", e);
      setError(e.message || "An unknown error occurred while fetching user data.");
      // Use safeToast to show errors to the user
      safeToast.error(e.message || "Could not load user details.");
      // Provide a default user object with null values instead of clearing completely
      setUser({
        id: "",
        email: null,
        name: null,
        image: null,
        role: "USER",
        credits: 0,
        isPremium: false,
        premiumSubscriptionId: null,
        premiumExpiresAt: null,
        resumeJobTitle: null,
        resumeFileUrl: null,
        jobSearchStage: null,
        linkedinUrl: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window !== 'undefined') {
      fetchUserData();
    }
  }, [fetchUserData]);

  // Re-fetch on window focus - only on client side with debouncing
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
    let lastFetchTime = 0;
    const REFETCH_COOLDOWN = 5000; // 5 seconds cooldown between refetches
    
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastFetchTime > REFETCH_COOLDOWN) {
        console.log("Window focused, refetching user data via useUserData hook.");
        lastFetchTime = now;
        fetchUserData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUserData]);

  // Debug logging
  console.log('useUserData state:', { 
    hasUser: !!user, 
    credits: user?.credits, 
    isPremium: user?.isPremium, 
    isLoading, 
    error: !!error 
  })

  return {
    user,
    credits: user?.credits ?? null,
    isPremium: user?.isPremium ?? false,
    isLoading,
    error,
    refetchUserData: fetchUserData,
  };
}