import fs from 'fs'
import path from 'path'
import os from 'os'

const homeDir = os.homedir()
const APPLICATIONS_FILE = path.join(homeDir, 'Desktop', 'predocker', 'database', 'applications.json')

export interface Application {
  id: number
  job_id: number
  status: 'saved' | 'applied' | 'interviewing' | 'accepted' | 'rejected'
  applied_date: string | null
  timeline: TimelineEvent[]
  documents: string[]
  notes: string
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  stage: 'applied' | 'reference' | 'codetest' | 'interview' | 'result'
  date: string
  notes: string
  completed: boolean
}

export function getAllApplications(): Application[] {
  try {
    if (!fs.existsSync(APPLICATIONS_FILE)) {
      fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([]))
    }
    const data = fs.readFileSync(APPLICATIONS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading applications:', error)
    return []
  }
}

export function saveApplications(apps: Application[]) {
  try {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2))
  } catch (error) {
    console.error('Error saving applications:', error)
  }
}

export function updateJobStatus(jobId: number, status: Application['status']) {
  const apps = getAllApplications()
  const existing = apps.find(a => a.job_id === jobId)
  
  if (existing) {
    existing.status = status
    existing.updated_at = new Date().toISOString()
    
    if (status === 'applied' && existing.timeline.length === 0) {
      existing.applied_date = new Date().toISOString()
      existing.timeline = [
        { stage: 'applied', date: new Date().toISOString(), notes: '', completed: true },
        { stage: 'reference', date: '', notes: '', completed: false },
        { stage: 'codetest', date: '', notes: '', completed: false },
        { stage: 'interview', date: '', notes: '', completed: false },
        { stage: 'result', date: '', notes: '', completed: false }
      ]
    }
  } else {
    const newApp: Application = {
      id: apps.length + 1,
      job_id: jobId,
      status,
      applied_date: status === 'applied' ? new Date().toISOString() : null,
      timeline: status === 'applied' ? [
        { stage: 'applied', date: new Date().toISOString(), notes: '', completed: true },
        { stage: 'reference', date: '', notes: '', completed: false },
        { stage: 'codetest', date: '', notes: '', completed: false },
        { stage: 'interview', date: '', notes: '', completed: false },
        { stage: 'result', date: '', notes: '', completed: false }
      ] : [],
      documents: [],
      notes: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    apps.push(newApp)
  }
  
  saveApplications(apps)
  return apps.find(a => a.job_id === jobId)
}

export function getApplicationByJobId(jobId: number): Application | undefined {
  const apps = getAllApplications()
  return apps.find(a => a.job_id === jobId)
}
