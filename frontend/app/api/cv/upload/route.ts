import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import os from 'os'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('cv') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const homeDir = os.homedir()
    const uploadsDir = join(homeDir, 'Desktop', 'predocker', 'uploads')
    const filePath = join(uploadsDir, file.name)
    
    await writeFile(filePath, buffer)
    
    return NextResponse.json({ 
      success: true, 
      filename: file.name,
      path: filePath
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
