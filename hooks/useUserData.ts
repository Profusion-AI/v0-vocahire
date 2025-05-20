"use client";

import { useState, useEffect, useCallback } from 'react';

// Import toast conditionally to prevent server-side issues
let toast: { error: (message: string) => void } = {
  error: (message: string) => {
    // No-op for server-side
    if (typeof window !== 'undefined') {
      console.error(message);
    }
  }
};

// Only import sonner on the client side
if (typeof window !== 'undefined') {
  // Dynamic import to avoid SSR issues
  import('sonner').then((sonner) => {
    toast = sonner;
  }).catch(() => {
    console.error('Failed to load sonner toast library');
  });
}

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
      // Only show toast error on client side
      if (typeof window !== 'undefined') {
        toast.error(e.message || "Could not load user details.");
      }
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

  // Re-fetch on window focus - only on client side
  useEffect(() => {
    // Skip during server-side rendering
    if (typeof window === 'undefined') {
      return;
    }
    
    const handleFocus = () => {
      console.log("Window focused, refetching user data via useUserData hook.");
      fetchUserData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchUserData]);

  return {
    user,
    credits: user?.credits ?? null,
    isPremium: user?.isPremium ?? false,
    isLoading,
    error,
    refetchUserData: fetchUserData,
  };
}