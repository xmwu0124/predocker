'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Calendar, FileText, BarChart3, CheckCircle, Bookmark, Send, Star, X, Download, Menu, Users } from 'lucide-react'
import DocumentsView from './components/DocumentsView'
import StatisticsView from './components/StatisticsView'
import RefereesView from './components/RefereesView'

type Job = { id: number, title: string, institution: string, location: string, deadline: string, url: string, field: string, status?: string }
type Application = { id: number, job_id: number, status: string, timeline: any[] }

export default function Home() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'saved' | 'applications' | 'documents' | 'referees' | 'stats'>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [matchedJobs, setMatchedJobs] = useState<number[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  const exportData = () => {
    window.location.href = '/api/export'
  }

  const allJobs = jobs.filter(j => j.status === 'new')
  const saved = jobs.filter(j => j.status === 'saved')
  const applied = applications.filter(a => a.status === 'applied' || a.status === 'interviewing')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <span className="ml-2 text-xl md:text-2xl font-bold">PreDocker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs md:text-sm text-gray-600">{allJobs.length} new • {saved.length} saved • {applied.length} applied</span>
              <button onClick={exportData} className="p-2 hover:bg-gray-100 rounded-lg" title="Export to CSV">
                <Download className="h-5 w-5 text-gray-600" />
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 md:py-8">
        <div className={`${mobileMenuOpen ? 'flex' : 'hidden md:flex'} flex-col md:flex-row gap-1 bg-white p-1 rounded-lg shadow-sm mb-4 md:mb-6 border overflow-x-auto`}>
          {[
            { id: 'jobs', label: 'Jobs', icon: Briefcase },
            { id: 'saved', label: `Saved`, icon: Bookmark },
            { id: 'applications', label: `Apps`, icon: CheckCircle },
            { id: 'documents', label: 'CV', icon: FileText },
            { id: 'referees', label: 'Refs', icon: Users },
            { id: 'stats', label: 'Stats', icon: BarChart3 }
          ].map(t => (
            <button 
              key={t.id} 
              onClick={() => { setActiveTab(t.id as any); setMobileMenuOpen(false); }}
              className={`flex items-center justify-center md:justify-start px-3 py-2 rounded-md transition-all text-sm whitespace-nowrap ${activeTab === t.id ? 'bg-gray-100 font-medium' : 'text-gray-600'}`}
            >
              <t.icon className="h-4 w-4 mr-2" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'jobs' && (
          <div className="space-y-2 md:space-y-3">
            {allJobs.map(j => {
              const isMatched = matchedJobs.includes(j.id)
              return (
                <div key={j.id} className={`bg-white rounded-lg border p-3 md:p-5 ${isMatched ? 'border-yellow-300 shadow-md' : ''}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base md:text-lg font-semibold truncate">{j.title}</h3>
                        {isMatched && <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm md:text-base text-gray-600 truncate mb-2">{j.institution}</p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs md:text-sm text-gray-500">
                        <span className="flex items-center"><Calendar className="inline h-3 w-3 md:h-4 md:w-4 mr-1" />Due: {j.deadline}</span>
                        <span className="truncate">📍 {j.location}</span>
                      </div>
                      {j.url !== 'N/A' && <a href={j.url} target="_blank" className="text-xs md:text-sm text-blue-600 hover:underline mt-2 inline-block">View →</a>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => saveJob(j.id)} className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs md:text-sm">
                        <Bookmark className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Save</span>
                      </button>
                      <button onClick={() => markAsApplied(j.id)} className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs md:text-sm">
                        <Send className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden sm:inline">Apply</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-2 md:space-y-3">
            {saved.length === 0 ? (
              <div className="bg-white rounded-lg border p-8 text-center">
                <Bookmark className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg md:text-xl font-semibold mb-2">No Saved Jobs</h3>
                <p className="text-sm md:text-base text-gray-500">Click Save to bookmark jobs</p>
              </div>
            ) : (
              saved.map(j => (
                <div key={j.id} className="bg-white rounded-lg border p-3 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-semibold mb-1">{j.title}</h3>
                      <p className="text-sm md:text-base text-gray-600 mb-2">{j.institution}</p>
                      <div className="flex gap-4 text-xs md:text-sm text-gray-500">
                        <span><Calendar className="inline h-3 w-3 md:h-4 md:w-4 mr-1" />Due: {j.deadline}</span>
                        <span>📍 {j.location}</span>
                      </div>
                      {j.url !== 'N/A' && <a href={j.url} target="_blank" className="text-xs md:text-sm text-blue-600 hover:underline mt-2 inline-block">View →</a>}
                    </div>
                    <button onClick={() => markAsApplied(j.id)} className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      <Send className="h-4 w-4" />
                      Apply
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
              <CheckCircle className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">No Active Applications</h3>
              <p className="text-sm md:text-base text-gray-500">Click Apply to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {applied.map(app => {
                const job = jobs.find(j => j.id === app.job_id)
                if (!job) return null
                return (
                  <div key={app.id} className="bg-white rounded-lg border p-4 md:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base md:text-lg font-semibold truncate">{job.title}</h3>
                        <p className="text-sm md:text-base text-gray-600 truncate">{job.institution}</p>
                      </div>
                      <button onClick={() => removeApplication(job.id)} className="text-gray-400 hover:text-red-600 flex-shrink-0">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2">
                      {app.timeline.map((e: any, i: number) => (
                        <button key={i} onClick={() => toggleStage(job.id, e.stage)} className={`flex flex-col items-center min-w-[80px] md:min-w-[100px] p-2 md:p-3 rounded-lg border-2 transition-all ${e.completed ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-2 text-sm ${e.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {e.completed ? '✓' : i + 1}
                          </div>
                          <div className={`text-[10px] md:text-xs font-medium text-center ${e.completed ? 'text-green-700' : 'text-gray-600'}`}>
                            {e.stage === 'applied' && 'Applied'}
                            {e.stage === 'reference' && 'Reference'}
                            {e.stage === 'codetest' && 'Code Test'}
                            {e.stage === 'interview' && 'Interview'}
                            {e.stage === 'result' && 'Result'}
                          </div>
                          {e.date && <div className="text-[9px] md:text-xs text-gray-500 mt-1">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
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

        {activeTab === 'referees' && <RefereesView jobs={allJobs} />}

        {activeTab === 'stats' && <StatisticsView applications={applications} jobs={jobs} />}
      </div>
    </div>
  )
}
