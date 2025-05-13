import React from 'react'
import { Star, StarHalf } from 'lucide-react'

const testimonialsData = [
  {
    stars: 5,
    quote: "I used VocaHire Coach to prepare for my Google interview, and one of the practice questions came up in the real interview! I felt so confident answering it.",
    author: 'Sarah L.',
    role: 'Software Engineer at Google',
  },
  {
    stars: 5,
    quote: "The feedback on my filler words and speaking pace was eye-opening. After just a week of practice, I eliminated my 'ums' and 'likes' completely.",
    author: 'Mark T.',
    role: 'Marketing Manager',
  },
  {
    stars: 4.5,
    quote: "As someone with interview anxiety, practicing with an AI removed the pressure. By my real interview, I felt prepared and ended up getting the job!",
    author: 'Jamie K.',
    role: 'Project Manager',
  },
]

const TestimonialStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating)
  const halfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

  return (
    <div className="text-indigo-500 mb-2 flex">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5" fill="currentColor" />
      ))}
      {halfStar && <StarHalf key="half" className="h-5 w-5" fill="currentColor" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5" /> // Outline for empty
      ))}
    </div>
  )
}

const Testimonials = () => {
  return (
    <div className="bg-white py-16 sm:py-24"> {/* This was part of the #home section in original HTML */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Testimonials
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Success stories from our users
          </p>
        </div>
        <div className="mt-10 space-y-8 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-8">
          {testimonialsData.map((testimonial) => (
            <div key={testimonial.author} className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <TestimonialStars rating={testimonial.stars} />
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              <div className="mt-4">
                <h4 className="font-medium text-gray-900">{testimonial.author}</h4>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Testimonials
