// Payment configuration for Stripe and credit packages

// Item identifiers map to Stripe products and their prices
export const ITEM_PRICE_MAP: Record<string, string> = {
  // Credit top-up products
  CREDIT_PACK_3: "prod_SJPpjWE9zhJnEh", // Three Vocahire Top-Up Credits
  CREDIT_PACK_5: "prod_SJQ8EwiLxPh62L", // Five Vocahire Top-Up Credits
  
  // Subscription products
  PREMIUM_MONTHLY_SUB: "prod_SLHl7Tl1LX1NMH", // Vocahire Coach - Monthly
  PREMIUM_QUARTERLY_SUB: "prod_SLHvbICsIUy3oZ", // Vocahire Coach - Quarterly
  PREMIUM_ANNUAL_SUB: "prod_SJPmP9GnMNDso0", // Vocahire Coach - Annual
};

// Subscription items
export const SUBSCRIPTION_ITEMS = new Set([
  "PREMIUM_MONTHLY_SUB",
  "PREMIUM_QUARTERLY_SUB",
  "PREMIUM_ANNUAL_SUB",
]);

// Credit package definitions
export interface CreditPackage {
  itemId: string;
  name: string;
  credits: number;
  price: number; // Price in USD
  description: string;
  stripePriceId: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    itemId: "CREDIT_PACK_3",
    name: "Three Credits",
    credits: 3,
    price: 15,
    description: "3 Vocahire Credits intended to top-up a premium subscription.",
    stripePriceId: ITEM_PRICE_MAP.CREDIT_PACK_3,
  },
  {
    itemId: "CREDIT_PACK_5",
    name: "Five Credits",
    credits: 5,
    price: 20,
    description: "5 Vocahire Credits bundled, premium subscription required.",
    stripePriceId: ITEM_PRICE_MAP.CREDIT_PACK_5,
  },
];

// Premium subscription definitions
export interface Subscription {
  itemId: string;
  name: string;
  price: number; // Price in USD
  frequency: string;
  description: string;
  stripePriceId: string;
  features: string[];
}

export const PREMIUM_SUBSCRIPTIONS: Subscription[] = [
  {
    itemId: "PREMIUM_MONTHLY_SUB",
    name: "Monthly Coach",
    price: 19.99,
    frequency: "/month",
    description: "Vocahire Premium Coaching, Enhanced Analytics Reports, and monthly credit reloads. Renews every month.",
    stripePriceId: ITEM_PRICE_MAP.PREMIUM_MONTHLY_SUB,
    features: [
      "Unlimited AI interviews",
      "Advanced voice & tone analysis",
      "Detailed feedback for all answers",
      "Real-time coaching during interviews",
      "Tailored questions from resume & job description",
      "AI-suggested improved answers",
      "Monthly credit reloads",
    ],
  },
  {
    itemId: "PREMIUM_QUARTERLY_SUB",
    name: "Quarterly Coach",
    price: 49.99,
    frequency: "/quarter",
    description: "Vocahire Premium Coaching, Enhanced Analytics Support, and monthly credit reloads. Renews every 3 months.",
    stripePriceId: ITEM_PRICE_MAP.PREMIUM_QUARTERLY_SUB,
    features: [
      "All Monthly Coach features",
      "16% discount compared to monthly",
      "Quarterly analytics reports",
      "Email support",
    ],
  },
  {
    itemId: "PREMIUM_ANNUAL_SUB",
    name: "Annual Coach",
    price: 149.99,
    frequency: "/year",
    description: "Vocahire Premium Coaching, Enhanced Analytics Reports, and monthly credit reloads. 25% off annual subscription.",
    stripePriceId: ITEM_PRICE_MAP.PREMIUM_ANNUAL_SUB,
    features: [
      "All Quarterly Coach features",
      "25% discount compared to monthly",
      "Priority support",
      "Annual interview skills assessment",
    ],
  },
];

// Default credits for new users
export const DEFAULT_CREDITS = 3;

// Helper function to get package details by itemId
export function getPackageDetails(itemId: string): CreditPackage | Subscription | null {
  const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.itemId === itemId);
  if (creditPackage) return creditPackage;
  
  const subscription = PREMIUM_SUBSCRIPTIONS.find(sub => sub.itemId === itemId);
  if (subscription) return subscription;
  
  return null;
}