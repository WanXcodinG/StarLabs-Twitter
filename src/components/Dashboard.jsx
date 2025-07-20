import React, { useState, useEffect } from 'react'
import { Users, Settings, Activity, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

const Dashboard = ({ accounts, config }) => {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    lockedAccounts: 0,
    suspendedAccounts: 0,
    recentTasks: 0,
    successRate: 0
  })

  useEffect(() => {
    if (accounts) {
      const totalAccounts = accounts.length
      const activeAccounts = accounts.filter(acc => acc.status === 'ok').length
      const lockedAccounts = accounts.filter(acc => acc.status === 'locked').length
      const suspendedAccounts = accounts.filter(acc => acc.status === 'suspended').length

      setStats({
        totalAccounts,
        activeAccounts,
        lockedAccounts,
        suspendedAccounts,
        recentTasks: 0, // This would come from task logs
        successRate: totalAccounts > 0 ? (activeAccounts / totalAccounts * 100).toFixed(1) : 0
      })
    }
  }, [accounts])

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  const QuickActions = () => (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button className="btn-primary flex items-center justify-center gap-2">
          <Activity size={18} />
          Start Tasks
        </button>
        <button className="btn-secondary flex items-center justify-center gap-2">
          <Users size={18} />
          Mutual Sub
        </button>
        <button className="btn-secondary flex items-center justify-center gap-2">
          <Settings size={18} />
          Settings
        </button>
        <button className="btn-secondary flex items-center justify-center gap-2">
          <Clock size={18} />
          Schedule
        </button>
      </div>
    </div>
  )

  const RecentActivity = () => (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">Task completed successfully</p>
            <p className="text-xs text-gray-500">2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">Account validation needed</p>
            <p className="text-xs text-gray-500">5 minutes ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium">Task failed - rate limit</p>
            <p className="text-xs text-gray-500">10 minutes ago</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to StarLabs Twitter Bot</h2>
        <p className="text-gray-600">Manage your Twitter automation with ease</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Accounts"
          value={stats.totalAccounts}
          icon={Users}
          color="text-blue-600"
          description="All loaded accounts"
        />
        <StatCard
          title="Active Accounts"
          value={stats.activeAccounts}
          icon={CheckCircle}
          color="text-green-600"
          description="Ready to use"
        />
        <StatCard
          title="Locked Accounts"
          value={stats.lockedAccounts}
          icon={AlertCircle}
          color="text-yellow-600"
          description="Temporarily locked"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon={Activity}
          color="text-purple-600"
          description="Account health"
        />
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* Configuration Overview */}
      {config && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Current Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Threads</p>
              <p className="text-xl font-bold text-gray-900">{config.SETTINGS?.THREADS || 1}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Attempts</p>
              <p className="text-xl font-bold text-gray-900">{config.SETTINGS?.ATTEMPTS || 5}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Shuffle Accounts</p>
              <p className="text-xl font-bold text-gray-900">
                {config.SETTINGS?.SHUFFLE_ACCOUNTS ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard