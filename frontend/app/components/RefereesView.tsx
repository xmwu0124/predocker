'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Copy, CheckCircle } from 'lucide-react'

type Referee = {
  id: number
  name: string
  email: string
  institution: string
  title: string
  access_token: string
  assigned_jobs: number[]
}

type Job = {
  id: number
  title: string
  institution: string
}

export default function RefereesView({ jobs }: { jobs: Job[] }) {
  const [referees, setReferees] = useState<Referee[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    title: '',
    assigned_jobs: [] as number[]
  })

  useEffect(() => {
    loadReferees()
  }, [])

  const loadReferees = async () => {
    const res = await fetch('/api/referees')
    const data = await res.json()
    setReferees(data)
  }

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  const addReferee = async () => {
    if (!formData.name || !formData.email) return
    
    const newReferee = {
      ...formData,
      access_token: generateToken(),
      recommendations: []
    }
    
    await fetch('/api/referees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReferee)
    })
    
    setFormData({ name: '', email: '', institution: '', title: '', assigned_jobs: [] })
    setShowAddForm(false)
    loadReferees()
  }

  const deleteReferee = async (id: number) => {
    await fetch('/api/referees', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    loadReferees()
  }

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/referee?token=${token}`
    navigator.clipboard.writeText(link)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const toggleJobAssignment = (jobId: number) => {
    setFormData(prev => ({
      ...prev,
      assigned_jobs: prev.assigned_jobs.includes(jobId)
        ? prev.assigned_jobs.filter(id => id !== jobId)
        : [...prev.assigned_jobs, jobId]
    }))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Referee Management</h2>
              <p className="text-sm text-gray-500">Share dashboard links with your referees</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Referee
          </button>
        </div>

        {showAddForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Institution"
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Title (e.g., Professor)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Assign Jobs:</label>
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                {jobs.slice(0, 20).map((job) => (
                  <label key={job.id} className="flex items-start gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.assigned_jobs.includes(job.id)}
                      onChange={() => toggleJobAssignment(job.id)}
                      className="mt-1 rounded"
                    />
                    <span className="text-sm flex-1">{job.title} - {job.institution}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button onClick={addReferee} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Referee
              </button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {referees.map((ref) => (
          <div key={ref.id} className="bg-white rounded-lg border p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{ref.title} {ref.name}</h3>
                <p className="text-sm text-gray-600">{ref.institution}</p>
                <p className="text-sm text-gray-500">{ref.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {ref.assigned_jobs?.length || 0} job(s) assigned
                </p>
              </div>
              <button
                onClick={() => deleteReferee(ref.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <button
                onClick={() => copyLink(ref.access_token)}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
              >
                {copiedToken === ref.access_token ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Dashboard Link
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {referees.length === 0 && !showAddForm && (
          <div className="col-span-2 bg-white rounded-lg border p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Referees Yet</h3>
            <p className="text-gray-500 mb-4">Add referees and assign jobs</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Referee
            </button>
          </div>
        )}
      </div>
    </div>
  )
}