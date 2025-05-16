"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner'; // Assuming sonner is used for toasts

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
            credits: typeof userDataFromApi.credits === 'number' ? userDataFromApi.credits : null,
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
      toast.error(e.message || "Could not load user details.");
      setUser(null); // Clear user data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Re-fetch on window focus
  useEffect(() => {
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