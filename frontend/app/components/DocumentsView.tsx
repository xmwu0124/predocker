'use client'

import { useState } from 'react'
import { FileText, Upload, CheckCircle, XCircle, Sparkles } from 'lucide-react'

export default function DocumentsView({ onAnalysisComplete }: { onAnalysisComplete: (jobIds: number[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [cvInfo, setCvInfo] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      setError('Please upload PDF or DOCX file')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('cv', file)

    try {
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setCvInfo(data)
        analyzeCV(data.filename)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const analyzeCV = async (filename: string) => {
    setAnalyzing(true)
    try {
      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })

      const data = await response.json()
      if (response.ok) {
        setAnalysis(data)
        const jobIds = data.matched_jobs?.map((j: any) => j.id) || []
        onAnalysisComplete(jobIds)
      }
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center mb-8">
          <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your CV</h3>
          <p className="text-gray-500">We will analyze and recommend matching positions</p>
        </div>

        <div className="max-w-md mx-auto">
          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 mb-4 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span>
              </p>
              <p className="text-xs text-gray-500">PDF or DOCX</p>
            </div>
            <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileUpload} disabled={uploading} />
          </label>

          {uploading && (
            <div className="mt-4 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          )}

          {analyzing && (
            <div className="mt-4 text-center">
              <Sparkles className="h-8 w-8 text-purple-600 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-gray-600">Analyzing your CV...</p>
            </div>
          )}

          {cvInfo && !analyzing && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-900">Uploaded: {cvInfo.filename}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {analysis && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
          
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium mb-2">Research Fields</p>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords?.fields?.map((f: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">{f}</span>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium mb-2">Technical Skills</p>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords?.skills?.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">{s}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">
              Found {analysis.total_matches} matching positions! Check All Jobs tab - they are marked with ⭐
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
