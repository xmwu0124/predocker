'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileText, Clock, CheckCircle, Calendar } from 'lucide-react'

type Job = {
  id: number
  title: string
  institution: string
  deadline: string
  url: string
}

type Recommendation = {
  job_id: number
  status: string
  notes: string
  updated_date?: string
}

export default function RefereeDashboard() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [referee, setReferee] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      loadDashboard()
    } else {
      setError('No access token provided')
      setLoading(false)
    }
  }, [token])

  const loadDashboard = async () => {
    try {
      const res = await fetch(`/api/referees/dashboard?token=${token}`)
      if (!res.ok) {
        setError('Invalid access link')
        setLoading(false)
        return
      }
      
      const data = await res.json()
      setReferee(data.referee)
      setJobs(data.jobs)
      setRecommendations(data.recommendations)
      setLoading(false)
    } catch (err) {
      setError('Failed to load dashboard')
      setLoading(false)
    }
  }

  const updateStatus = async (jobId: number, status: string, notes: string) => {
    await fetch('/api/referees/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, job_id: jobId, status, notes })
    })
    loadDashboard()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg border p-8 text-center max-w-md">
          <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }
return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Reference Letters Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {referee.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{referee.institution}</p>
              <p className="text-xs text-gray-500">{referee.email}</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Recommendation Requests</h2>
          <p className="text-gray-600">
            You have {jobs.length} recommendation request{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => {
            const rec = recommendations.find(r => r.job_id === job.id)
            const status = rec?.status || 'pending'
            
            return (
              <div key={job.id} className="bg-white rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                    <p className="text-gray-600 mb-2">{job.institution}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Deadline: {job.deadline}
                      </span>
                    </div>
                    {job.url !== 'N/A' && (
                      <a href={job.url} target="_blank" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                        View job posting →
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status === 'pending' && <Clock className="h-5 w-5 text-yellow-500" />}
                    {status === 'in_progress' && <FileText className="h-5 w-5 text-blue-500" />}
                    {status === 'submitted' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {status === 'pending' && 'Pending'}
                      {status === 'in_progress' && 'In Progress'}
                      {status === 'submitted' && 'Submitted'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-sm font-medium mb-2">Update Status:</label>
                  <select
                    value={status}
                    onChange={(e) => updateStatus(job.id, e.target.value, rec?.notes || '')}
                    className="px-3 py-2 border rounded-lg mb-3"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                  </select>

                  <label className="block text-sm font-medium mb-2">Notes:</label>
                  <textarea
                    value={rec?.notes || ''}
                    onChange={(e) => updateStatus(job.id, status, e.target.value)}
                    placeholder="Add notes..."
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                  
                  {rec?.updated_date && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(rec.updated_date).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {jobs.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-600">You have no pending recommendation requests</p>
          </div>
        )}
      </div>
    </div>
  )
}