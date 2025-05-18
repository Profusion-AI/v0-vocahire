"use client"

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const pricingTiers = [
  {
    name: 'Free',
    description: 'Perfect for trying out and occasional practice.',
    price: '$0',
    frequency: '/forever',
    buttonText: 'Start Free',
    buttonHref: '/register',
    buttonVariant: 'secondary',
    itemId: null,
    features: [
      '5 AI interviews per month',
      'Basic voice analysis',
      'Limited answer feedback',
      'Standard interview questions',
    ],
  },
  {
    name: 'Premium Monthly',
    description: 'Vocahire Premium Coaching, Enhanced Analytics Support, and monthly credit reloads.',
    price: '$20.00',
    frequency: '/month',
    buttonText: 'Go Premium Monthly',
    buttonHref: '#', 
    buttonVariant: 'primary',
    itemId: 'PREMIUM_MONTHLY_SUB',
    features: [
      'Unlimited AI interviews',
      'Advanced voice & tone analysis',
      'Detailed feedback for all answers',
      'Real-time coaching during interviews',
      'Tailored questions from resume & job description',
      'AI-suggested improved answers',
      'Monthly credit reloads',
    ],
  },
  {
    name: 'Premium Annual',
    description: 'Vocahire Premium Coaching, Enhanced Analytics Support, and monthly credit reloads. 20% off annual subscription.',
    price: '$100.00',
    frequency: '/year',
    buttonText: 'Go Premium Annual',
    buttonHref: '#',
    buttonVariant: 'secondary',
    itemId: 'PREMIUM_ANNUAL_SUB',
    features: [
      'All Premium Monthly features',
      '20% discount compared to monthly',
      'Priority support',
    ],
  },
  {
    name: 'One Interview Credit',
    description: '1 (one) Vocahire Interview Credit. Please see the FAQ for how Interview Credits are consumed.',
    price: '$5.00',
    frequency: '/credit',
    buttonText: 'Buy One Credit',
    buttonHref: '#',
    buttonVariant: 'secondary',
    itemId: 'CREDIT_PACK_1',
    features: [
      'One full interview (up to 10 questions)',
      'Advanced voice & tone analysis',
      'Detailed feedback for all answers',
      'Tailored questions from resume & job description',
      'Session recording for later review',
    ],
  },
  {
    name: 'Three Interview Credits',
    description: '3 (three) Vocahire Interview Credit. Please see the FAQ for how Interview Credits are consumed.',
    price: '$14.00',
    frequency: '/3 credits',
    buttonText: 'Buy Three Credits',
    buttonHref: '#',
    buttonVariant: 'secondary',
    itemId: 'CREDIT_PACK_3',
    features: [
      'Three full interviews (up to 10 questions each)',
      'Advanced voice & tone analysis',
      'Detailed feedback for all answers',
      'Tailored questions from resume & job description',
      'Session recordings for later review',
    ],
  },
]

const Pricing = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async (itemId: string) => {
    if (!itemId) return;
    
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity: 1 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session.");
      }

      const { url } = await response.json();
      
      if (url) {
        router.push(url); // Redirect to Stripe Checkout
      } else {
        toast.error("Could not initiate purchase. Please try again.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to initiate checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="pricing" className="section pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Pricing</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Simple, transparent pricing
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Start for free, upgrade when you need more.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`border rounded-lg shadow-sm divide-y divide-gray-200 ${
                tier.buttonVariant === 'primary' ? 'border-indigo-500' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h3>
                <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">{tier.price}</span>
                  <span className="text-base font-medium text-gray-500">{tier.frequency}</span>
                </p>
                {tier.itemId ? (
                  <button
                    onClick={() => handleCheckout(tier.itemId)}
                    disabled={isProcessing}
                    className={`mt-8 block w-full border rounded-md py-2 text-sm font-semibold text-center ${
                      tier.buttonVariant === 'primary'
                        ? 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                        : 'bg-gray-800 border-gray-800 text-white hover:bg-gray-900'
                    } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isProcessing ? 'Processing...' : tier.buttonText}
                  </button>
                ) : (
                  <a
                    href={tier.buttonHref}
                    className={`mt-8 block w-full border rounded-md py-2 text-sm font-semibold text-center ${
                      tier.buttonVariant === 'primary'
                        ? 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                        : 'bg-gray-800 border-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {tier.buttonText}
                  </a>
                )}
              </div>
              <div className="pt-6 pb-8 px-6">
                <h4 className="text-sm font-medium text-gray-900">
                  {tier.name === 'Premium' ? 'All Free features, plus:' : "What's included"}
                </h4>
                <ul className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
