import React, { useState, useEffect } from 'react'
import { Star, Twitter, Settings, Play, Upload, Download, Users, BarChart3 } from 'lucide-react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import AccountManager from './components/AccountManager'
import TaskRunner from './components/TaskRunner'
import ConfigManager from './components/ConfigManager'
import Statistics from './components/Statistics'
import MutualSubscription from './components/MutualSubscription'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [accounts, setAccounts] = useState([])
  const [config, setConfig] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setIsLoading(true)
      
      // Load accounts
      const accountsResponse = await fetch('/api/accounts')
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json()
        setAccounts(accountsData)
      }

      // Load config
      const configResponse = await fetch('/api/config')
      if (configResponse.ok) {
        const configData = await configResponse.json()
        setConfig(configData)
      }
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'accounts', label: 'Accounts', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: Play },
    { id: 'mutual', label: 'Mutual Sub', icon: Twitter },
    { id: 'config', label: 'Settings', icon: Settings },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard accounts={accounts} config={config} />
      case 'accounts':
        return <AccountManager accounts={accounts} setAccounts={setAccounts} />
      case 'tasks':
        return <TaskRunner accounts={accounts} config={config} />
      case 'mutual':
        return <MutualSubscription accounts={accounts} config={config} />
      case 'config':
        return <ConfigManager config={config} setConfig={setConfig} />
      case 'stats':
        return <Statistics />
      default:
        return <Dashboard accounts={accounts} config={config} />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading StarLabs Twitter Bot...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-sm border border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default App