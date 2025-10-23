import fs from 'fs'
import path from 'path'
import os from 'os'

const homeDir = os.homedir()
const JOBS_FILE = path.join(homeDir, 'Desktop', 'predocker', 'database', 'jobs.json')

export interface Job {
  id: number
  title: string
  institution: string | null
  location: string | null
  deadline: string | null
  url: string | null
  description: string | null
  field: string | null
  scraped_date: string | null
  is_active: number
}

export function getAllJobs(): Job[] {
  try {
    console.log('Reading from:', JOBS_FILE)
    
    if (!fs.existsSync(JOBS_FILE)) {
      console.error('File not found:', JOBS_FILE)
      return []
    }
    
    const data = fs.readFileSync(JOBS_FILE, 'utf-8')
    const jobs = JSON.parse(data) as Job[]
    
    console.log(`Loaded ${jobs.length} jobs`)
    
    return jobs.filter(job => job.is_active === 1)
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}
