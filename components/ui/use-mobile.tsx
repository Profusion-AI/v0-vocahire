// This file is deprecated. Use '@/hooks/use-mobile' instead.
// File retained only to prevent build breaks. Will be removed in future release.

import { useIsMobile as originalUseIsMobile } from "@/hooks/use-mobile"

export function useIsMobile() {
  return originalUseIsMobile()
}
