import { NextRequest, NextResponse } from 'next/server'
import { getAllApplications, saveApplications } from '@/lib/applications'

export async function POST(request: NextRequest) {
  try {
    const { jobId, stage } = await request.json()
    const apps = getAllApplications()
    const app = apps.find(a => a.job_id === jobId)
    
    if (app) {
      const timelineItem = app.timeline.find(t => t.stage === stage)
      if (timelineItem) {
        timelineItem.completed = !timelineItem.completed
        if (timelineItem.completed && !timelineItem.date) {
          timelineItem.date = new Date().toISOString()
        } else if (!timelineItem.completed) {
          timelineItem.date = ''
        }
        app.updated_at = new Date().toISOString()
        saveApplications(apps)
      }
    }
    
    return NextResponse.json(app)
  } catch (error) {
    console.error('Error updating timeline:', error)
    return NextResponse.json({ error: 'Failed to update timeline' }, { status: 500 })
  }
}
