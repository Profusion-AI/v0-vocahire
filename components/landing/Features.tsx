import React from 'react'
import { Mic, FileText, LineChart, Shield } from 'lucide-react'

const Features = () => {
  const featuresList = [
    {
      icon: <Mic className="h-6 w-6 text-white" />,
      title: 'Realistic Voice Interviews',
      description: "Engage in real-time, voice-driven mock interviews with our AI interviewer using OpenAI's latest speech models.",
    },
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      title: 'Personalized Context',
      description: 'Upload your resume and job description to get tailored questions specific to your experience and target role.',
    },
    {
      icon: <LineChart className="h-6 w-6 text-white" />,
      title: 'Instant Feedback',
      description: 'Receive immediate, actionable post-interview analytics on your speaking style, answer quality, and timing.',
    },
    {
      icon: <Shield className="h-6 w-6 text-white" />,
      title: 'Privacy by Design',
      description: 'Your data is never sold or misused. We use strict privacy measures to protect your information.',
    },
  ]

  return (
    <div className="py-12 bg-white"> {/* This was part of the #home section in original HTML */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Features
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            A better way to prepare for interviews
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our AI-powered platform offers everything you need to ace your next interview.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {featuresList.map((feature) => (
              <div key={feature.title} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    {feature.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {feature.title}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

export default Features
