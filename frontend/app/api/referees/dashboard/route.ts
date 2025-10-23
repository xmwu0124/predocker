import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

const getDataPath = (file: string) => {
  const homeDir = os.homedir()
  return path.join(homeDir, 'Desktop', 'predocker', 'database', file)
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }
    
    const refereesPath = getDataPath('referees.json')
    const refereesData = JSON.parse(fs.readFileSync(refereesPath, 'utf-8'))
    
    const referee = refereesData.find((r: any) => r.access_token === token)
    if (!referee) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    const jobsPath = getDataPath('jobs.json')
    const allJobs = JSON.parse(fs.readFileSync(jobsPath, 'utf-8'))
    
    const assignedJobs = allJobs.filter((j: any) => 
      referee.assigned_jobs.includes(j.id)
    )
    
    return NextResponse.json({
      referee: {
        name: referee.name,
        email: referee.email,
        institution: referee.institution
      },
      jobs: assignedJobs,
      recommendations: referee.recommendations || []
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
