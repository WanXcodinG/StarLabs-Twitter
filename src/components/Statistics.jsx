import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Download } from 'lucide-react'

const Statistics = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/statistics')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadLogs = async () => {
    try {
      const response = await fetch('/api/statistics/download')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `task_logs_${new Date().toISOString().split('T')[0]}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading logs:', error)
      alert('Error downloading logs')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Statistics</h2>
          <p className="text-gray-600">View your bot performance and analytics</p>
        </div>
        
        <button
          onClick={handleDownloadLogs}
          className="btn-primary flex items-center gap-2"
        >
          <Download size={18} />
          Download Logs
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          change={12}
          icon={BarChart3}
          color="text-blue-600"
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          change={5}
          icon={TrendingUp}
          color="text-green-600"
        />
        <StatCard
          title="Active Sessions"
          value={stats?.activeSessions || 0}
          icon={Clock}
          color="text-purple-600"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats?.avgResponseTime || 0}ms`}
          change={-8}
          icon={Clock}
          color="text-orange-600"
        />
      </div>

      {/* Task Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Task Performance</h3>
        
        {stats?.taskStats ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Task</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Success</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Failed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.taskStats).map(([task, data]) => (
                  <tr key={task} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium capitalize">{task}</td>
                    <td className="py-3 px-4">{data.total}</td>
                    <td className="py-3 px-4 text-green-600">{data.success}</td>
                    <td className="py-3 px-4 text-red-600">{data.failed}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${data.total > 0 ? (data.success / data.total) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {data.total > 0 ? Math.round((data.success / data.total) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No task statistics available</p>
            <p className="text-sm text-gray-500">Run some tasks to see performance data</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        
        {stats?.recentActivity ? (
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.task}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  activity.status === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No recent activity</p>
          </div>
        )}
      </div>

      {/* Performance Chart Placeholder */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Performance chart coming soon</p>
            <p className="text-sm text-gray-500">Track your bot's performance over time</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics