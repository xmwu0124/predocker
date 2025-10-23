import { NextResponse } from 'next/server'
import { getAllApplications } from '@/lib/applications'

export async function GET() {
  try {
    const apps = getAllApplications()
    return NextResponse.json(apps)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}
