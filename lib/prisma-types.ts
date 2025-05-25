/**
 * Helper module for consistent handling of Prisma Decimal values
 * across regular database operations and fallback paths
 */

import { Prisma } from '../prisma/generated/client';

/**
 * Get a consistent credit value for API responses
 * 
 * @param value Number or Decimal value to format
 * @returns Number value that will be serialized consistently
 */
export function getConsistentCreditValue(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  
  // If it's a Prisma Decimal, convert to number
  if (typeof value === 'object' && 'toNumber' in value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  
  // If it's already a number, return it
  if (typeof value === 'number') {
    return value;
  }
  
  // Handle string values that might come from parsing
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Fallback
  return 0;
}

/**
 * Creates a Prisma Decimal for database operations
 * 
 * @param value Number to convert to Decimal
 * @returns Prisma.Decimal instance
 */
export function createPrismaDecimal(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}