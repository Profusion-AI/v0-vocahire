import React from 'react'
import { HelpCircle, CreditCard, FileText, Clock } from 'lucide-react'

const faqData = [
  {
    question: "How do VocaHire Credits work?",
    answer: "VocaHire Credits are used to access our AI interview coaching features. New users receive 3 free credits to get started. Each full interview session consumes 1 credit, while enhanced feedback reports consume 0.5 credits.",
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    question: "What's included in a full interview session?",
    answer: "Each interview session (1 credit) includes: real-time AI conversation, adaptive questioning based on your role, instant transcript generation, and basic performance feedback. You can practice for as long as you need within a single session.",
    icon: <Clock className="h-5 w-5" />
  },
  {
    question: "What are enhanced feedback reports?",
    answer: "Enhanced feedback reports (0.5 credits) provide deeper insights including: detailed answer analysis, specific improvement suggestions, industry-specific recommendations, and personalized coaching tips. These are optional add-ons after your interview.",
    icon: <FileText className="h-5 w-5" />
  },
  {
    question: "What happens when I run out of credits?",
    answer: "When your credits are depleted, you can purchase additional credit packs (3 or 5 credits) or upgrade to our Premium subscription for unlimited interviews. Premium members also receive monthly credit bonuses for enhanced reports.",
    icon: <HelpCircle className="h-5 w-5" />
  }
]

export default function FAQ() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            How VocaHire Credits Work
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Everything you need to know about our credit system and pricing
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {faqData.map((faq) => (
              <div key={faq.question} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    {faq.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {faq.question}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {faq.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-12 text-center">
          <p className="text-base text-gray-500">
            Have more questions? Contact us at{' '}
            <a href="mailto:support@vocahire.com" className="text-indigo-600 hover:text-indigo-500">
              support@vocahire.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}