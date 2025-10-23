import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json()
    
    const homeDir = os.homedir()
    const cvPath = path.join(homeDir, 'Desktop', 'predocker', 'uploads', filename)
    const scriptPath = path.join(homeDir, 'Desktop', 'predocker', 'scraper', 'cv_parser.py')
    
    const { stdout } = await execAsync(`python3 "${scriptPath}" "${cvPath}"`)
    const result = JSON.parse(stdout)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error analyzing CV:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}