import React, { useState, useEffect } from 'react'
import { Save, RotateCcw, Settings, Clock, Users, MessageSquare } from 'lucide-react'

const ConfigManager = ({ config, setConfig }) => {
  const [localConfig, setLocalConfig] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (config) {
      setLocalConfig(JSON.parse(JSON.stringify(config)))
    }
  }, [config])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(localConfig)
      })

      if (response.ok) {
        const updatedConfig = await response.json()
        setConfig(updatedConfig)
        alert('Configuration saved successfully!')
      } else {
        alert('Failed to save configuration')
      }
    } catch (error) {
      console.error('Save config error:', error)
      alert('Error saving configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (config) {
      setLocalConfig(JSON.parse(JSON.stringify(config)))
    }
  }

  const updateConfig = (path, value) => {
    setLocalConfig(prev => {
      const newConfig = { ...prev }
      const keys = path.split('.')
      let current = newConfig
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return newConfig
    })
  }

  if (!localConfig) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
          <p className="text-gray-600">Manage bot settings and parameters</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} />
          General Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threads
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={localConfig.SETTINGS?.THREADS || 1}
              onChange={(e) => updateConfig('SETTINGS.THREADS', parseInt(e.target.value) || 1)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Number of concurrent threads</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attempts
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={localConfig.SETTINGS?.ATTEMPTS || 5}
              onChange={(e) => updateConfig('SETTINGS.ATTEMPTS', parseInt(e.target.value) || 5)}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Number of retry attempts</p>
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localConfig.SETTINGS?.SHUFFLE_ACCOUNTS || false}
                onChange={(e) => updateConfig('SETTINGS.SHUFFLE_ACCOUNTS', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Shuffle Accounts</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Randomize account processing order</p>
          </div>
        </div>
      </div>

      {/* Account Range */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          Account Range
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Index
            </label>
            <input
              type="number"
              min="0"
              value={localConfig.SETTINGS?.ACCOUNTS_RANGE?.[0] || 0}
              onChange={(e) => {
                const newRange = [...(localConfig.SETTINGS?.ACCOUNTS_RANGE || [0, 0])]
                newRange[0] = parseInt(e.target.value) || 0
                updateConfig('SETTINGS.ACCOUNTS_RANGE', newRange)
              }}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">0 means start from first account</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Index
            </label>
            <input
              type="number"
              min="0"
              value={localConfig.SETTINGS?.ACCOUNTS_RANGE?.[1] || 0}
              onChange={(e) => {
                const newRange = [...(localConfig.SETTINGS?.ACCOUNTS_RANGE || [0, 0])]
                newRange[1] = parseInt(e.target.value) || 0
                updateConfig('SETTINGS.ACCOUNTS_RANGE', newRange)
              }}
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">0 means use all accounts</p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exact Accounts to Use
            </label>
            <input
              type="text"
              value={localConfig.SETTINGS?.EXACT_ACCOUNTS_TO_USE?.join(', ') || ''}
              onChange={(e) => {
                const accounts = e.target.value
                  .split(',')
                  .map(s => parseInt(s.trim()))
                  .filter(n => !isNaN(n))
                updateConfig('SETTINGS.EXACT_ACCOUNTS_TO_USE', accounts)
              }}
              placeholder="e.g., 1, 4, 6"
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated account numbers (overrides range)</p>
          </div>
        </div>
      </div>

      {/* Timing Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} />
          Timing Settings
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'PAUSE_BETWEEN_ATTEMPTS', label: 'Pause Between Attempts', desc: 'Delay between retry attempts (seconds)' },
            { key: 'RANDOM_PAUSE_BETWEEN_ACCOUNTS', label: 'Pause Between Accounts', desc: 'Delay between processing accounts (seconds)' },
            { key: 'RANDOM_PAUSE_BETWEEN_ACTIONS', label: 'Pause Between Actions', desc: 'Delay between individual actions (seconds)' },
            { key: 'RANDOM_INITIALIZATION_PAUSE', label: 'Initialization Pause', desc: 'Initial delay before starting each account (seconds)' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {label}
                </label>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min</label>
                <input
                  type="number"
                  min="1"
                  value={localConfig.SETTINGS?.[key]?.[0] || 3}
                  onChange={(e) => {
                    const newRange = [...(localConfig.SETTINGS?.[key] || [3, 10])]
                    newRange[0] = parseInt(e.target.value) || 3
                    updateConfig(`SETTINGS.${key}`, newRange)
                  }}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max</label>
                <input
                  type="number"
                  min="1"
                  value={localConfig.SETTINGS?.[key]?.[1] || 10}
                  onChange={(e) => {
                    const newRange = [...(localConfig.SETTINGS?.[key] || [3, 10])]
                    newRange[1] = parseInt(e.target.value) || 10
                    updateConfig(`SETTINGS.${key}`, newRange)
                  }}
                  className="input-field"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare size={20} />
          Content Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tweets</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localConfig.TWEETS?.RANDOM_TEXT_FOR_TWEETS || false}
                  onChange={(e) => updateConfig('TWEETS.RANDOM_TEXT_FOR_TWEETS', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Use random text for tweets</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localConfig.TWEETS?.RANDOM_PICTURE_FOR_TWEETS || false}
                  onChange={(e) => updateConfig('TWEETS.RANDOM_PICTURE_FOR_TWEETS', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Use random pictures for tweets</span>
              </label>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Comments</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localConfig.COMMENTS?.RANDOM_TEXT_FOR_COMMENTS || false}
                  onChange={(e) => updateConfig('COMMENTS.RANDOM_TEXT_FOR_COMMENTS', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Use random text for comments</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localConfig.COMMENTS?.RANDOM_PICTURE_FOR_COMMENTS || false}
                  onChange={(e) => updateConfig('COMMENTS.RANDOM_PICTURE_FOR_COMMENTS', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Use random pictures for comments</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Flow Settings</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localConfig.FLOW?.SKIP_FAILED_TASKS || false}
              onChange={(e) => updateConfig('FLOW.SKIP_FAILED_TASKS', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Skip Failed Tasks</span>
          </label>
          <p className="text-xs text-gray-500 ml-6">Continue processing even if some tasks fail</p>
        </div>
      </div>

      {/* Telegram Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Telegram Notifications</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={localConfig.SETTINGS?.SEND_TELEGRAM_LOGS || false}
              onChange={(e) => updateConfig('SETTINGS.SEND_TELEGRAM_LOGS', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Send Telegram Logs</span>
          </label>

          {localConfig.SETTINGS?.SEND_TELEGRAM_LOGS && (
            <>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={localConfig.SETTINGS?.SEND_ONLY_SUMMARY || false}
                  onChange={(e) => updateConfig('SETTINGS.SEND_ONLY_SUMMARY', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Send Only Summary</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Token
                </label>
                <input
                  type="text"
                  value={localConfig.SETTINGS?.TELEGRAM_BOT_TOKEN || ''}
                  onChange={(e) => updateConfig('SETTINGS.TELEGRAM_BOT_TOKEN', e.target.value)}
                  placeholder="Your Telegram bot token"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User IDs
                </label>
                <input
                  type="text"
                  value={localConfig.SETTINGS?.TELEGRAM_USERS_IDS?.join(', ') || ''}
                  onChange={(e) => {
                    const ids = e.target.value
                      .split(',')
                      .map(s => parseInt(s.trim()))
                      .filter(n => !isNaN(n))
                    updateConfig('SETTINGS.TELEGRAM_USERS_IDS', ids)
                  }}
                  placeholder="e.g., 123456789, 987654321"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated Telegram user IDs</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigManager