"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, FileText, Upload, X } from "lucide-react"

interface ResumeUploadProps {
  onUploadComplete: (url: string, filename: string) => void
}

export function ResumeUpload({ onUploadComplete }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ]
      if (!validTypes.includes(selectedFile.type)) {
        setError("Please upload a PDF, DOC, DOCX, or TXT file")
        return
      }

      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "resumes")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Upload failed")
      }

      const data = await response.json()
      setUploadedUrl(data.url)
      onUploadComplete(data.url, file.name)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError(err instanceof Error ? err.message : "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setUploadedUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Resume</CardTitle>
        <CardDescription>Upload your resume to help tailor the interview questions to your experience</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!uploadedUrl ? (
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="resume">Resume</Label>
              <Input
                ref={fileInputRef}
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4" />
                <span className="flex-1 truncate">{file.name}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemove}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            <span className="flex-1 truncate">{file?.name}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemove}>
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!uploadedUrl ? (
          <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
            {isUploading ? "Uploading..." : "Upload Resume"}
            {!isUploading && <Upload className="ml-2 h-4 w-4" />}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={handleRemove}>
            Remove Resume
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
