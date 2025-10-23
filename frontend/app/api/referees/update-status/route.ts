import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import os from 'os'

const getRefereesPath = () => {
  const homeDir = os.homedir()
  return path.join(homeDir, 'Desktop', 'predocker', 'database', 'referees.json')
}

export async function POST(request: Request) {
  try {
    const { token, job_id, status, notes } = await request.json()
    
    const refereesPath = getRefereesPath()
    let referees = JSON.parse(fs.readFileSync(refereesPath, 'utf-8'))
    
    const refereeIndex = referees.findIndex((r: any) => r.access_token === token)
    if (refereeIndex === -1) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    if (!referees[refereeIndex].recommendations) {
      referees[refereeIndex].recommendations = []
    }
    
    const recIndex = referees[refereeIndex].recommendations.findIndex(
      (r: any) => r.job_id === job_id
    )
    
    if (recIndex >= 0) {
      referees[refereeIndex].recommendations[recIndex] = {
        job_id,
        status,
        notes,
        updated_date: new Date().toISOString()
      }
    } else {
      referees[refereeIndex].recommendations.push({
        job_id,
        status,
        notes,
        updated_date: new Date().toISOString()
      })
    }
    
    fs.writeFileSync(refereesPath, JSON.stringify(referees, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}