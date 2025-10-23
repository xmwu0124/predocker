'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Calendar, FileText, BarChart3, CheckCircle, Bookmark, Send, Star, X } from 'lucide-react'
import DocumentsView from './components/DocumentsView'
import StatisticsView from './components/StatisticsView'

type Job = { id: number, title: string, institution: string, location: string, deadline: string, url: string, field: string, status?: string, match_score?: number }
type Application = { id: number, job_id: number, status: string, timeline: any[] }

export default function Home() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'saved' | 'applications' | 'documents' | 'stats'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [matchedJobs, setMatchedJobs] = useState<number[]>([])

  const loadData = () => {
    Promise.all([
      fetch('/api/jobs').then(r => r.json()),
      fetch('/api/applications').then(r => r.json())
    ]).then(([j, a]) => {
      setJobs(j.map((job: Job) => ({ ...job, status: a.find((ap: Application) => ap.job_id === job.id)?.status || 'new' })))
      setApplications(a)
      setLoading(false)
    })
  }

  useEffect(() => { 
    loadData()
    const stored = localStorage.getItem('matched_jobs')
    if (stored) setMatchedJobs(JSON.parse(stored))
  }, [])

  const saveJob = async (jobId: number) => {
    await fetch('/api/applications/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, status: 'saved' }) })
    loadData()
  }

  const markAsApplied = async (jobId: number) => {
    await fetch('/api/applications/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, status: 'applied' }) })
    loadData()
  }

  const removeApplication = async (jobId: number) => {
    await fetch('/api/applications/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, status: 'new' }) })
    loadData()
  }

  const toggleStage = async (jobId: number, stage: string) => {
    await fetch('/api/applications/timeline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId, stage }) })
    loadData()
  }

  const allJobs = jobs.filter(j => j.status === 'new')
  const saved = jobs.filter(j => j.status === 'saved')
  const applied = applications.filter(a => a.status === 'applied' || a.status === 'interviewing')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center"><Briefcase className="h-8 w-8 text-blue-600" /><span className="ml-2 text-2xl font-bold">PreDocker</span></div>
          <span className="text-sm text-gray-600">{allJobs.length} new • {saved.length} saved • {applied.length} applied</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-1 bg-white p-1 rounded-lg shadow-sm mb-6 border">
          {[
            { id: 'jobs', label: 'All Jobs', icon: Briefcase },
            { id: 'saved', label: `Saved (${saved.length})`, icon: Bookmark },
            { id: 'applications', label: `Applications (${applied.length})`, icon: CheckCircle },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'stats', label: 'Statistics', icon: BarChart3 }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`flex items-center px-4 py-2 rounded-md ${activeTab === t.id ? 'bg-gray-100 font-medium' : 'text-gray-600'}`}>
              <t.icon className="h-4 w-4 mr-2" />{t.label}
            </button>
          ))}
        </div>

        {activeTab === 'jobs' && (
          <div className="space-y-3">
            {allJobs.map(j => {
              const isMatched = matchedJobs.includes(j.id)
              return (
                <div key={j.id} className={`bg-white rounded-lg border p-5 ${isMatched ? 'border-yellow-300 shadow-md' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold">{j.title}</h3>
                        {isMatched && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
                      </div>
                      <p className="text-gray-600 mb-2">{j.institution}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span><Calendar className="inline h-4 w-4 mr-1" />Due: {j.deadline}</span>
                        <span>📍 {j.location}</span>
                      </div>
                      {j.url !== 'N/A' && <a href={j.url} target="_blank" className="text-sm text-blue-600 hover:underline mt-2 inline-block">View →</a>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveJob(j.id)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Bookmark className="h-4 w-4" />Save
                      </button>
                      <button onClick={() => markAsApplied(j.id)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <Send className="h-4 w-4" />Apply
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-3">
            {saved.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Saved Jobs</h3>
                <p className="text-gray-500">Click Save to bookmark jobs</p>
              </div>
            ) : (
              saved.map(j => (
                <div key={j.id} className="bg-white rounded-lg border p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{j.title}</h3>
                      <p className="text-gray-600 mb-2">{j.institution}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span><Calendar className="inline h-4 w-4 mr-1" />Due: {j.deadline}</span>
                        <span>📍 {j.location}</span>
                      </div>
                      {j.url !== 'N/A' && <a href={j.url} target="_blank" className="text-sm text-blue-600 hover:underline mt-2 inline-block">View →</a>}
                    </div>
                    <button onClick={() => markAsApplied(j.id)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Send className="h-4 w-4" />Apply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          applied.length === 0 ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Applications</h3>
              <p className="text-gray-500">Click Apply to start tracking</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applied.map(app => {
                const job = jobs.find(j => j.id === app.job_id)
                if (!job) return null
                return (
                  <div key={app.id} className="bg-white rounded-lg border p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-gray-600">{job.institution}</p>
                      </div>
                      <button onClick={() => removeApplication(job.id)} className="text-gray-400 hover:text-red-600">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {app.timeline.map((e: any, i: number) => (
                        <button key={i} onClick={() => toggleStage(job.id, e.stage)} className={`flex flex-col items-center min-w-[100px] p-3 rounded-lg border-2 transition-all ${e.completed ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${e.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {e.completed ? '✓' : i + 1}
                          </div>
                          <div className={`text-xs font-medium text-center ${e.completed ? 'text-green-700' : 'text-gray-600'}`}>
                            {e.stage === 'applied' && 'Applied'}
                            {e.stage === 'reference' && 'Reference'}
                            {e.stage === 'codetest' && 'Code Test'}
                            {e.stage === 'interview' && 'Interview'}
                            {e.stage === 'result' && 'Result'}
                          </div>
                          {e.date && <div className="text-xs text-gray-500 mt-1">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {activeTab === 'documents' && <DocumentsView onAnalysisComplete={(jobIds: number[]) => {
          setMatchedJobs(jobIds)
          localStorage.setItem('matched_jobs', JSON.stringify(jobIds))
        }} />}

        {activeTab === 'stats' && <StatisticsView applications={applications} jobs={jobs} />}
      </div>
    </div>
  )
}
