// Payment configuration for Stripe and credit packages

// Item identifiers map to Stripe Price IDs
export const ITEM_PRICE_MAP: Record<string, string> = {
  CREDIT_PACK_1: "price_1ROmztKk6VyljA3pVmGKszKi",
  CREDIT_PACK_3: "price_1ROnHpKk6VyljA3pMbcYg4rw",
  PREMIUM_MONTHLY_SUB: "price_1ROmvcKk6VyljA3pjJ5emu6R",
  PREMIUM_ANNUAL_SUB: "price_1ROmxEKk6VyljA3pQzqtZgWo",
};

// Subscription items
export const SUBSCRIPTION_ITEMS = new Set([
  "PREMIUM_MONTHLY_SUB",
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
    itemId: "CREDIT_PACK_1",
    name: "Starter Pack",
    credits: 1,
    price: 5,
    description: "Get 1 interview credit.",
    stripePriceId: "price_1ROmztKk6VyljA3pVmGKszKi",
  },
  {
    itemId: "CREDIT_PACK_3",
    name: "Pro Pack",
    credits: 3,
    price: 14,
    description: "Get 3 interview credits.",
    stripePriceId: "price_1ROnHpKk6VyljA3pMbcYg4rw",
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
    name: "Premium Monthly",
    price: 20,
    frequency: "/month",
    description: "Vocahire Premium Coaching, Enhanced Analytics Support, and monthly credit reloads.",
    stripePriceId: "price_1ROmvcKk6VyljA3pjJ5emu6R",
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
    itemId: "PREMIUM_ANNUAL_SUB",
    name: "Premium Annual",
    price: 100,
    frequency: "/year",
    description: "Vocahire Premium Coaching, Enhanced Analytics Support, and monthly credit reloads. 20% off annual subscription.",
    stripePriceId: "price_1ROmxEKk6VyljA3pQzqtZgWo",
    features: [
      "All Premium Monthly features",
      "20% discount compared to monthly",
      "Priority support",
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