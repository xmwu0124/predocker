'use client'

import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

type Application = {
  id: number
  job_id: number
  status: string
  timeline: any[]
  created_at?: string
}

type Job = {
  id: number
  title: string
  institution: string
}

export default function StatisticsView({ applications, jobs }: { applications: Application[], jobs: Job[] }) {
  const applied = applications.filter(a => a.status === 'applied' || a.status === 'interviewing')
  
  // Calculate statistics
  const totalApplied = applied.length
  const inProgress = applied.filter(a => a.timeline.some(t => t.completed && t.stage !== 'result')).length
  const interviews = applied.filter(a => a.timeline.find(t => t.stage === 'interview')?.completed).length
  const results = applied.filter(a => a.timeline.find(t => t.stage === 'result')?.completed).length
  
  // Stage completion stats
  const stages = ['applied', 'reference', 'codetest', 'interview', 'result']
  const stageStats = stages.map(stage => {
    const completed = applied.filter(a => a.timeline.find(t => t.stage === stage)?.completed).length
    return {
      stage,
      completed,
      percentage: totalApplied > 0 ? Math.round((completed / totalApplied) * 100) : 0
    }
  })
  
  const statCards = [
    { label: 'Total Applied', value: totalApplied, icon: BarChart3, color: 'blue' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'yellow' },
    { label: 'Interviews', value: interviews, icon: TrendingUp, color: 'purple' },
    { label: 'Results', value: results, icon: CheckCircle, color: 'green' }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Stage Progress */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Application Pipeline</h3>
        <div className="space-y-4">
          {stageStats.map((stat, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {stat.stage === 'applied' && 'Applied'}
                  {stat.stage === 'reference' && 'Reference Check'}
                  {stat.stage === 'codetest' && 'Code Test'}
                  {stat.stage === 'interview' && 'Interview'}
                  {stat.stage === 'result' && 'Final Result'}
                </span>
                <span className="text-sm text-gray-600">{stat.completed} / {totalApplied}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applications */}
      {applied.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
          <div className="space-y-3">
            {applied.slice(0, 5).map(app => {
              const job = jobs.find(j => j.id === app.job_id)
              if (!job) return null
              
              const completedStages = app.timeline.filter(t => t.completed).length
              const progress = Math.round((completedStages / app.timeline.length) * 100)
              
              return (
                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.institution}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{progress}%</p>
                      <p className="text-xs text-gray-500">{completedStages}/5 stages</p>
                    </div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {applied.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Yet</h3>
          <p className="text-gray-500">Start applying to jobs to see your statistics here</p>
        </div>
      )}
    </div>
  )
}
