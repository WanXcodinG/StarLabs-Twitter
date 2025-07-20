import React, { useState } from 'react'
import { Play, Square, Settings, Clock, CheckCircle, AlertCircle } from 'lucide-react'

const TaskRunner = ({ accounts, config }) => {
  const [selectedTasks, setSelectedTasks] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [taskInputs, setTaskInputs] = useState({})
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const availableTasks = [
    { id: 'follow', name: 'Follow', description: 'Follow users', requiresInput: true, inputType: 'usernames' },
    { id: 'like', name: 'Like', description: 'Like tweets', requiresInput: true, inputType: 'tweet_links' },
    { id: 'retweet', name: 'Retweet', description: 'Retweet posts', requiresInput: true, inputType: 'tweet_links' },
    { id: 'comment', name: 'Comment', description: 'Comment on tweets', requiresInput: true, inputType: 'tweet_link' },
    { id: 'comment_image', name: 'Comment with Image', description: 'Comment with image', requiresInput: true, inputType: 'tweet_link' },
    { id: 'tweet', name: 'Tweet', description: 'Post tweets', requiresInput: false },
    { id: 'tweet_image', name: 'Tweet with Image', description: 'Post tweets with images', requiresInput: false },
    { id: 'quote', name: 'Quote', description: 'Quote tweets', requiresInput: true, inputType: 'tweet_links' },
    { id: 'quote_image', name: 'Quote with Image', description: 'Quote with images', requiresInput: true, inputType: 'tweet_links' },
    { id: 'unfollow', name: 'Unfollow', description: 'Unfollow users', requiresInput: true, inputType: 'usernames' },
    { id: 'check_valid', name: 'Check Valid', description: 'Validate accounts', requiresInput: false }
  ]

  const handleTaskToggle = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const handleInputChange = (taskId, value) => {
    setTaskInputs(prev => ({
      ...prev,
      [taskId]: value
    }))
  }

  const handleStartTasks = async () => {
    if (selectedTasks.length === 0) {
      alert('Please select at least one task')
      return
    }

    if (accounts.length === 0) {
      alert('No accounts available')
      return
    }

    // Validate required inputs
    const tasksWithInputs = selectedTasks.filter(taskId => {
      const task = availableTasks.find(t => t.id === taskId)
      return task?.requiresInput
    })

    for (const taskId of tasksWithInputs) {
      if (!taskInputs[taskId]?.trim()) {
        const task = availableTasks.find(t => t.id === taskId)
        alert(`Please provide input for ${task.name}`)
        return
      }
    }

    setIsRunning(true)
    setProgress({ current: 0, total: accounts.length })

    try {
      const response = await fetch('/api/tasks/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tasks: selectedTasks,
          inputs: taskInputs,
          accounts: accounts.map(acc => acc.auth_token)
        })
      })

      if (response.ok) {
        // Handle task execution progress
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

        alert('Tasks completed successfully!')
      } else {
        alert('Failed to start tasks')
      }
    } catch (error) {
      console.error('Task execution error:', error)
      alert('Error executing tasks')
    } finally {
      setIsRunning(false)
      setProgress({ current: 0, total: 0 })
    }
  }

  const handleStopTasks = async () => {
    try {
      await fetch('/api/tasks/stop', { method: 'POST' })
      setIsRunning(false)
      setProgress({ current: 0, total: 0 })
    } catch (error) {
      console.error('Stop tasks error:', error)
    }
  }

  const getInputPlaceholder = (inputType) => {
    switch (inputType) {
      case 'usernames':
        return 'Enter usernames separated by spaces (e.g., user1 user2 user3)'
      case 'tweet_links':
        return 'Enter tweet URLs separated by spaces'
      case 'tweet_link':
        return 'Enter tweet URL'
      default:
        return 'Enter input'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Runner</h2>
          <p className="text-gray-600">Execute Twitter automation tasks</p>
        </div>
        
        <div className="flex gap-2">
          {isRunning ? (
            <button
              onClick={handleStopTasks}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Square size={18} />
              Stop Tasks
            </button>
          ) : (
            <button
              onClick={handleStartTasks}
              disabled={selectedTasks.length === 0 || accounts.length === 0}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} />
              Start Tasks
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
                <span className="text-sm font-medium text-gray-700">Progress</span>
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

      {/* Account Status */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Account Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">Active Accounts</p>
              <p className="text-sm text-gray-600">
                {accounts.filter(acc => acc.status === 'ok').length} / {accounts.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium">Issues</p>
              <p className="text-sm text-gray-600">
                {accounts.filter(acc => acc.status && acc.status !== 'ok').length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Threads</p>
              <p className="text-sm text-gray-600">{config?.SETTINGS?.THREADS || 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Task Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Select Tasks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedTasks.includes(task.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTaskToggle(task.id)}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={() => handleTaskToggle(task.id)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{task.name}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Inputs */}
      {selectedTasks.some(taskId => {
        const task = availableTasks.find(t => t.id === taskId)
        return task?.requiresInput
      }) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Task Inputs</h3>
          <div className="space-y-4">
            {selectedTasks.map(taskId => {
              const task = availableTasks.find(t => t.id === taskId)
              if (!task?.requiresInput) return null

              return (
                <div key={taskId}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {task.name} Input
                  </label>
                  <textarea
                    value={taskInputs[taskId] || ''}
                    onChange={(e) => handleInputChange(taskId, e.target.value)}
                    placeholder={getInputPlaceholder(task.inputType)}
                    className="input-field h-24 resize-none"
                    disabled={isRunning}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskRunner