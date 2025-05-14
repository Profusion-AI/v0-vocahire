"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Added SelectContent, SelectTrigger, SelectValue
import { Label } from '@/components/ui/label'; // Added Label for consistency
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Added Card components for structure

const jobStages = [
  'Exploring Options',
  'Applying to Jobs',
  'Interviewing',
  'Negotiating Offers',
  'Recently Hired',
  'Other'
];

export default function ProfilePage() {
  const [selectedStage, setSelectedStage] = useState('');
  const [showOther, setShowOther] = useState(false);
  const [creditsOpen, setCreditsOpen] = useState(false);

  const handleStageChange = (value: string) => {
    setSelectedStage(value);
    setShowOther(value === 'Other');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
      <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl text-center">Manage Your VocaHire Profile</h1>

      <section className="space-y-8"> {/* Increased spacing */}
        <Card className="shadow-lg"> {/* Added Card and shadow */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold">LinkedIn Profile</CardTitle> {/* Styled title */}
            <CardDescription className="text-gray-600">Connect your LinkedIn to personalize your interview questions.</CardDescription> {/* Styled description */}
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              <Button variant="secondary" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md">Connect LinkedIn</Button> {/* Styled button */}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg"> {/* Added Card and shadow */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Job Search Stage</CardTitle> {/* Styled title */}
          </CardHeader>
          <CardContent className="space-y-4"> {/* Added spacing */}
            <div className="flex flex-col space-y-1.5"> {/* Added container for label/select */}
              <Label htmlFor="job-stage" className="text-gray-700">Current Stage</Label> {/* Added Label */}
              <Select
                value={selectedStage}
                onValueChange={handleStageChange}
              >
                <SelectTrigger id="job-stage" className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"> {/* Styled trigger */}
                  <SelectValue placeholder="Select your current stage" />
                </SelectTrigger>
                <SelectContent>
                  {jobStages.map(stage => (
                    <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AnimatePresence>
              {showOther && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-2"
                >
                  <Input placeholder="Please specify..." className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" /> {/* Styled input */}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card className="shadow-lg"> {/* Added Card and shadow */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Resume & Role Context</CardTitle> {/* Styled title */}
            <CardDescription className="text-gray-600">Upload your resume and optionally paste a job description to receive tailored questions.</CardDescription> {/* Styled description */}
          </CardHeader>
          <CardContent className="space-y-4"> {/* Added spacing */}
            <div className="flex flex-col space-y-1.5"> {/* Added container for label/input */}
              <Label htmlFor="resume-upload" className="text-gray-700">Upload Resume</Label> {/* Added Label */}
              <Input id="resume-upload" type="file" accept=".pdf,.doc,.docx" className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" /> {/* Styled input */}
            </div>
            <div className="flex flex-col space-y-1.5"> {/* Added container for label/textarea */}
              <Label htmlFor="job-description" className="text-gray-700">Job Description (Optional)</Label> {/* Added Label */}
              <textarea
                id="job-description"
                placeholder="Paste job description (optional)"
                className="w-full border border-gray-300 rounded-md p-2 mt-2 focus:border-indigo-500 focus:ring-indigo-500 text-gray-700" // Styled textarea
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg"> {/* Added Card and shadow */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Interview Feedback Snapshot</CardTitle> {/* Styled title */}
            <CardDescription className="text-gray-600">Preview your past performance and analytics.</CardDescription> {/* Styled description */}
          </CardHeader>
          <CardContent>
            <div className="mt-4 border border-dashed border-gray-300 rounded-md p-4 text-gray-500 text-center">
              No feedback available yet. Complete a practice session to view your insights here.
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg"> {/* Added Card and shadow */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex justify-between items-center"> {/* Styled title */}
              Interview Credits
              <Button variant="ghost" onClick={() => setCreditsOpen(!creditsOpen)} className="text-indigo-600 hover:bg-gray-100"> {/* Styled button */}
                {creditsOpen ? 'Hide' : 'Manage'}
              </Button>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {creditsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <CardContent className="mt-4 space-y-4"> {/* Added CardContent and spacing */}
                  <div className="text-base text-gray-700">You have <strong>3</strong> remaining credits.</div> {/* Styled text */}
                  <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md">Purchase More Credits</Button> {/* Styled button */}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </section>
    </div>
  );
}