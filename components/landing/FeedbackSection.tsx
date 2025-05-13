import React from 'react'
import { Star, Timer, MessageCircle, Lock } from 'lucide-react'

// Placeholder data, in a real app this would come from props or state
const feedbackData = {
  overallScore: 85,
  averageAnswerTime: "1:45",
  confidenceScore: 7.8,
  speakingPace: {
    wpm: 175,
    idealMin: 150,
    idealMax: 170,
    percentage: 70, // For the progress bar
    feedbackText: "Your speaking pace is slightly faster than ideal (150-170 WPM). Try to slow down slightly for maximum clarity.",
  },
  fillerWords: {
    detected: [
      { word: "Um", count: 12 },
      { word: "Like", count: 8 },
      { word: "You know", count: 4 },
    ],
    tips: "Try pausing instead of using filler words. Practice replacing \"um\" with a brief moment of silence.",
  },
  questionAnalysis: [
    {
      question: "Q1: Tell me about a time when you had to solve a challenging problem at work.",
      strengths: ["Used STAR method effectively", "Provided specific metrics of success", "Demonstrated technical expertise"],
      areasToImprove: ["Answer was slightly too long (2:30)", "Could highlight teamwork more", "Consider mentioning what you learned"],
      isPremium: false,
    },
    {
      question: "Q2: How do you handle tight deadlines?",
      isPremium: true,
    },
  ],
  premiumUpsell: {
    suggestedAnswers: true,
  }
}

const FeedbackSection = () => {
  return (
    <section id="feedback" className="section pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Feedback</h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Detailed Performance Analysis
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            See how you performed and get actionable insights to improve.
          </p>
        </div>

        <div className="mt-10 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Interview Performance Summary</h3>
                <p className="text-sm text-gray-500">Software Engineer Interview - {feedbackData.questionAnalysis.length} questions</p>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* Overall Score Card */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <Star className="h-6 w-6 text-white" fill="currentColor"/>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Overall Score</dt>
                          <dd><div className="text-lg font-medium text-gray-900">{feedbackData.overallScore}/100</div></dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Average Answer Time Card */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <Timer className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Average Answer Time</dt>
                          <dd><div className="text-lg font-medium text-gray-900">{feedbackData.averageAnswerTime}</div></dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence Score Card (Premium) */}
                <div className="bg-gray-50 overflow-hidden shadow rounded-lg relative">
                  <Lock className="lock-icon h-5 w-5" />
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                        <MessageCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            Confidence Score <span className="text-xs text-indigo-600">Premium</span>
                          </dt>
                          <dd><div className="text-lg font-medium text-gray-900">{feedbackData.confidenceScore}/10</div></dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Speaking Style Analysis */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900">Speaking Style Analysis</h4>
                <div className="mt-4 bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Speaking Pace</h5>
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${feedbackData.speakingPace.percentage}%` }}></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{feedbackData.speakingPace.wpm} WPM</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{feedbackData.speakingPace.feedbackText}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-500">Filler Words</h5>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Detected:</p>
                          <ul className="mt-1 text-sm text-gray-700">
                            {feedbackData.fillerWords.detected.map(fw => (
                              <li key={fw.word}>"{fw.word}" - {fw.count} times</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Tips:</p>
                          <p className="mt-1 text-sm text-gray-700">{feedbackData.fillerWords.tips}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Analysis */}
              <div className="mt-8">
                <h4 className="text-lg font-medium text-gray-900">Question Analysis</h4>
                <div className="mt-4 overflow-hidden">
                  {feedbackData.questionAnalysis.map((qa, index) => (
                    <div key={index} className={`bg-gray-50 p-4 rounded-lg shadow-sm mb-4 ${qa.isPremium ? 'relative' : ''}`}>
                      {qa.isPremium && <Lock className="lock-icon h-5 w-5" />}
                      <h5 className="font-medium text-gray-900">
                        {qa.question}
                        {qa.isPremium && <span className="text-xs text-indigo-600 ml-1">Premium</span>}
                      </h5>
                      {qa.isPremium ? (
                        <div className="mt-2 blur-sm">
                          <p className="text-sm text-gray-700">Upgrade to Premium to see feedback for all questions.</p>
                        </div>
                      ) : (
                        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <h6 className="text-sm font-medium text-gray-500">Strengths</h6>
                            <ul className="mt-1 text-sm text-gray-700 list-disc pl-5">
                              {qa.strengths?.map(s => <li key={s}>{s}</li>)}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-gray-500">Areas to Improve</h6>
                            <ul className="mt-1 text-sm text-gray-700 list-disc pl-5">
                              {qa.areasToImprove?.map(a => <li key={a}>{a}</li>)}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {feedbackData.premiumUpsell.suggestedAnswers && (
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm relative">
                      <Lock className="lock-icon h-5 w-5" />
                      <h5 className="font-medium text-gray-900">
                        Suggested Improved Answers <span className="text-xs text-indigo-600">Premium</span>
                      </h5>
                      <div className="mt-2 blur-sm">
                        <p className="text-sm text-gray-700">Upgrade to see AI-generated improved versions of your answers.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-center">
                <button 
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Upgrade to Premium for Full Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeedbackSection
