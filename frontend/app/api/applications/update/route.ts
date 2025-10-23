import { NextRequest, NextResponse } from 'next/server'
import { updateJobStatus } from '@/lib/applications'

export async function POST(request: NextRequest) {
  try {
    const { jobId, status } = await request.json()
    const app = updateJobStatus(jobId, status)
    return NextResponse.json(app)
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
