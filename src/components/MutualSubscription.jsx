import React, { useState } from 'react'
import { Users, Play, Settings, Info } from 'lucide-react'

const MutualSubscription = ({ accounts, config }) => {
  const [followersPerAccount, setFollowersPerAccount] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const activeAccounts = accounts.filter(acc => acc.status === 'ok')

  const handleStartMutualSubscription = async () => {
    if (activeAccounts.length < 2) {
      alert('Need at least 2 active accounts for mutual subscription')
      return
    }

    if (followersPerAccount <= 0) {
      alert('Followers per account must be greater than 0')
      return
    }

    setIsRunning(true)
    setProgress({ current: 0, total: activeAccounts.length })

    try {
      const response = await fetch('/api/mutual-subscription/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          followersPerAccount,
          accounts: activeAccounts.map(acc => acc.auth_token)
        })
      })

      if (response.ok) {
        // Handle progress updates
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter(line => line.trim())

          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              if (data.type === 'progress') {
                setProgress(data.progress)
              }
            } catch (e) {
              // Ignore invalid JSON
            }
          }
        }

        alert('Mutual subscription completed successfully!')
      } else {
        alert('Failed to start mutual subscription')
      }
    } catch (error) {
      console.error('Mutual subscription error:', error)
      alert('Error executing mutual subscription')
    } finally {
      setIsRunning(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const handleStopMutualSubscription = async () => {
    try {
      await fetch('/api/mutual-subscription/stop', { method: 'POST' })
      setIsRunning(false)
      setProgress({ current: 0, total: 0 })
    } catch (error) {
      console.error('Stop mutual subscription error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mutual Subscription</h2>
          <p className="text-gray-600">Make accounts follow each other</p>
        </div>
        
        <div className="flex gap-2">
          {isRunning ? (
            <button
              onClick={handleStopMutualSubscription}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Users size={18} />
              Stop Process
            </button>
          ) : (
            <button
              onClick={handleStartMutualSubscription}
              disabled={activeAccounts.length < 2}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} />
              Start Mutual Sub
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Processing Accounts</span>
                <span className="text-sm text-gray-600">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} />
          Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Followers per Account
            </label>
            <input
              type="number"
              min="1"
              max={Math.max(1, activeAccounts.length - 1)}
              value={followersPerAccount}
              onChange={(e) => setFollowersPerAccount(parseInt(e.target.value) || 1)}
              className="input-field w-32"
              disabled={isRunning}
            />
            <p className="text-sm text-gray-600 mt-1">
              Each account will follow this many other accounts
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-green-600">{activeAccounts.length}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Follows</p>
              <p className="text-2xl font-bold text-purple-600">
                {activeAccounts.length * followersPerAccount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Information */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info size={20} />
          How it Works
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <p>Each account will be assigned a random set of other accounts to follow</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <p>The system ensures no account follows itself</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <p>Random delays are applied between follow actions to avoid rate limits</p>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </div>
            <p>Only active accounts (status: OK) will participate in the process</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {activeAccounts.length < 2 && (
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Insufficient Active Accounts</h4>
              <p className="text-sm text-yellow-700">
                You need at least 2 active accounts to run mutual subscription. 
                Please check your account status in the Account Manager.
              </p>
            </div>
          </div>
        </div>
      )}

      {followersPerAccount >= activeAccounts.length && activeAccounts.length > 1 && (
        <div className="card border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">High Follower Count</h4>
              <p className="text-sm text-yellow-700">
                You've set followers per account to {followersPerAccount}, but you only have {activeAccounts.length} active accounts. 
                Each account can follow at most {activeAccounts.length - 1} other accounts.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MutualSubscription