'use client' // This component uses client-side interactivity (useState, useEffect)

import React, { useState, useEffect, useRef } from 'react'
import { UploadCloud, Bot, User, Mic, MicOff, Square, Lock } from 'lucide-react'
import Waveform from './Waveform'

const questions = [
  "Tell me about a time when you had to solve a challenging problem at work. What was your approach and what was the outcome?",
  "How do you handle tight deadlines and pressure?",
  "Describe a situation where you had to work with a difficult team member. How did you handle it?",
  "What is your greatest professional achievement and why?",
  "How do you stay updated with the latest technologies in your field?",
  "Tell me about a time when you failed. What did you learn from it?",
  "How do you approach learning new technical skills?",
  "Describe a project where you demonstrated leadership.",
  "How do you handle constructive criticism?",
  "Where do you see yourself in 5 years?"
];

const Simulation = () => {
  const [activeTab, setActiveTab] = useState<'setup' | 'interview'>('setup')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Form state (simplified for now)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [interviewType, setInterviewType] = useState('behavioral')

  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handleStartInterview = () => {
    // TODO: Process form data (jobTitle, company, resumeFile, etc.)
    console.log('Starting interview with settings:', { jobTitle, company, resumeFile, jobDescription, interviewType });
    setActiveTab('interview')
    setIsRecording(true) // Auto-start recording
    setRecordingSeconds(0)
    setCurrentQuestionIndex(0)
  }

  const handleEndInterview = () => {
    if (isRecording) {
      setIsRecording(false)
    }
    // TODO: Navigate to feedback section or page
    const feedbackSection = document.getElementById('feedback');
    if (feedbackSection) {
        feedbackSection.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveTab('setup'); // Or a new 'results' tab
  }

  const handleToggleMic = () => {
    setIsRecording((prev) => !prev)
    if (!isRecording) { // If we are about to start recording
        setRecordingSeconds(0);
    }
  }

  const handleNextQuestion = () => {
    if (isRecording) {
      setIsRecording(false) // Stop recording for current question
    }
    // TODO: Save current answer/transcript segment
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Last question, perhaps end interview
      handleEndInterview()
    }
    // Optionally, auto-start mic for next question after a delay or user action
  }
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setResumeFile(event.target.files[0]);
      // TODO: Display file name or preview
    }
  };

  return (
    <section id="simulation" className="section pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Interview Simulation
          </h2>
          <p className="mt-1 text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight">
            Practice makes perfect
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Engage in a realistic mock interview with our AI coach.
          </p>
        </div>

        <div className="mt-10 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            {/* Interview Setup */}
            <div id="setup" className={`tab-content ${activeTab === 'setup' ? 'active' : ''}`}>
              <div className="max-w-xl mx-auto">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Set up your interview</h3>
                <div className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="job-title" className="block text-sm font-medium text-gray-700">
                      Job Title
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="job-title"
                        id="job-title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="company"
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="e.g. Google"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="resume" className="block text-sm font-medium text-gray-700">
                      Upload Resume
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" strokeWidth={1} />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        {resumeFile && <p className="text-xs text-gray-500 mt-1">{resumeFile.name}</p>}
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
                      Job Description (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="job-description"
                        name="job-description"
                        rows={4}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Paste the job description here..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="interview-type" className="block text-sm font-medium text-gray-700">
                      Interview Type
                    </label>
                    <select
                      id="interview-type"
                      name="interview-type"
                      value={interviewType}
                      onChange={(e) => setInterviewType(e.target.value)}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="behavioral">Behavioral Interview</option>
                      <option value="technical">Technical Interview</option>
                      <option value="leadership">Leadership Interview</option>
                      <option value="case">Case Interview</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      onClick={handleStartInterview}
                      type="button"
                      className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Start Interview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview in Progress */}
            <div id="interview" className={`tab-content ${activeTab === 'interview' ? 'active' : ''}`}>
              <div className="max-w-3xl mx-auto">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">AI Interviewer</h3>
                        <p className="text-sm text-gray-500" id="questionNumber">
                          Question {currentQuestionIndex + 1} of {questions.length}
                        </p>
                      </div>
                    </div>
                    <div>
                      {isRecording && (
                        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <Mic className="-ml-1 mr-1.5 h-4 w-4 text-green-600" />
                          Recording
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-gray-700 text-lg" id="currentQuestion">
                      {questions[currentQuestionIndex]}
                    </p>
                  </div>
                  <div className="mt-8">
                    <div className="p-4 bg-white rounded-lg shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-gray-900">You</h4>
                          </div>
                        </div>
                        <div>
                          <span id="recordingTime" className="text-sm text-gray-500">
                            {formatTime(recordingSeconds)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Waveform isActive={isRecording} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={handleEndInterview}
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      End Interview
                    </button>
                    <div>
                      <button
                        id="micToggle"
                        onClick={handleToggleMic}
                        type="button"
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          isRecording ? 'bg-red-600' : 'bg-indigo-600'
                        }`}
                      >
                        {isRecording ? <Square className="h-5 w-5" fill="white"/> : <Mic className="h-5 w-5" />}
                      </button>
                    </div>
                    <button
                      onClick={handleNextQuestion}
                      type="button"
                      disabled={currentQuestionIndex >= questions.length -1 && !isRecording} // Disable if last q and not recording
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      Next Question
                    </button>
                  </div>
                </div>

                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm relative">
                  <Lock className="lock-icon h-5 w-5" /> {/* Using .lock-icon class from globals.css */}
                  <h4 className="text-lg font-medium text-gray-900">
                    Real-time Coaching{' '}
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                      Premium
                    </span>
                  </h4>
                  <p className="mt-2 text-gray-500">
                    Upgrade to get real-time tips and feedback while you answer. We'll help you structure your responses, avoid filler words, and maintain a confident tone.
                  </p>
                  <div className="mt-3">
                    <button 
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Upgrade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Simulation
