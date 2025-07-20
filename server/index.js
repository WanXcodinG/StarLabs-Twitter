import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import XLSX from 'xlsx'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3001

// Middleware
app.use(cors())
app.use(express.json())

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' })

// In-memory storage for demo purposes
let accounts = []
let config = null
let taskLogs = []
let isTaskRunning = false

// Load initial data
async function loadInitialData() {
  try {
    // Load config
    const configPath = path.join(__dirname, '../config.yaml')
    try {
      const configFile = await fs.readFile(configPath, 'utf8')
      config = yaml.load(configFile)
    } catch (error) {
      console.log('Config file not found, using defaults')
      config = getDefaultConfig()
    }

    // Load accounts if exists
    const accountsPath = path.join(__dirname, '../data/accounts.xlsx')
    try {
      await loadAccountsFromFile(accountsPath)
    } catch (error) {
      console.log('Accounts file not found')
    }
  } catch (error) {
    console.error('Error loading initial data:', error)
  }
}

function getDefaultConfig() {
  return {
    SETTINGS: {
      THREADS: 1,
      ATTEMPTS: 5,
      ACCOUNTS_RANGE: [0, 0],
      EXACT_ACCOUNTS_TO_USE: [],
      SHUFFLE_ACCOUNTS: true,
      PAUSE_BETWEEN_ATTEMPTS: [3, 10],
      RANDOM_PAUSE_BETWEEN_ACCOUNTS: [3, 10],
      RANDOM_PAUSE_BETWEEN_ACTIONS: [3, 10],
      RANDOM_INITIALIZATION_PAUSE: [3, 10],
      SEND_TELEGRAM_LOGS: false,
      SEND_ONLY_SUMMARY: false,
      TELEGRAM_BOT_TOKEN: "",
      TELEGRAM_USERS_IDS: []
    },
    FLOW: {
      SKIP_FAILED_TASKS: false
    },
    TWEETS: {
      RANDOM_TEXT_FOR_TWEETS: false,
      RANDOM_PICTURE_FOR_TWEETS: true
    },
    COMMENTS: {
      RANDOM_TEXT_FOR_COMMENTS: false,
      RANDOM_PICTURE_FOR_COMMENTS: true
    },
    OTHERS: {
      SSL_VERIFICATION: false
    }
  }
}

async function loadAccountsFromFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    accounts = data
      .filter(row => row.AUTH_TOKEN && row.AUTH_TOKEN.trim())
      .map(row => ({
        auth_token: row.AUTH_TOKEN,
        proxy: row.PROXY || '',
        username: row.USERNAME || '',
        status: row.STATUS || 'unknown'
      }))
    
    console.log(`Loaded ${accounts.length} accounts`)
  } catch (error) {
    console.error('Error loading accounts:', error)
    throw error
  }
}

// Routes

// Get accounts
app.get('/api/accounts', (req, res) => {
  res.json(accounts)
})

// Upload accounts
app.post('/api/accounts/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const workbook = XLSX.readFile(req.file.path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    accounts = data
      .filter(row => row.AUTH_TOKEN && row.AUTH_TOKEN.trim())
      .map(row => ({
        auth_token: row.AUTH_TOKEN,
        proxy: row.PROXY || '',
        username: row.USERNAME || '',
        status: row.STATUS || 'unknown'
      }))

    // Clean up uploaded file
    await fs.unlink(req.file.path)

    res.json(accounts)
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to process file' })
  }
})

// Validate accounts
app.post('/api/accounts/validate', async (req, res) => {
  try {
    // Simulate account validation
    const updatedAccounts = accounts.map(account => ({
      ...account,
      status: Math.random() > 0.3 ? 'ok' : ['locked', 'suspended', 'wrong_token'][Math.floor(Math.random() * 3)],
      username: account.username || `user_${Math.random().toString(36).substr(2, 8)}`
    }))
    
    accounts = updatedAccounts
    res.json(accounts)
  } catch (error) {
    console.error('Validation error:', error)
    res.status(500).json({ error: 'Failed to validate accounts' })
  }
})

// Get config
app.get('/api/config', (req, res) => {
  res.json(config)
})

// Update config
app.put('/api/config', async (req, res) => {
  try {
    config = req.body
    
    // Save to file
    const configPath = path.join(__dirname, '../config.yaml')
    const yamlStr = yaml.dump(config)
    await fs.writeFile(configPath, yamlStr, 'utf8')
    
    res.json(config)
  } catch (error) {
    console.error('Config save error:', error)
    res.status(500).json({ error: 'Failed to save config' })
  }
})

// Run tasks
app.post('/api/tasks/run', async (req, res) => {
  try {
    const { tasks, inputs, accounts: accountTokens } = req.body
    
    if (isTaskRunning) {
      return res.status(400).json({ error: 'Tasks are already running' })
    }

    isTaskRunning = true
    
    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    // Simulate task execution
    const totalAccounts = accountTokens.length
    
    for (let i = 0; i < totalAccounts; i++) {
      if (!isTaskRunning) break
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Send progress update
      const progress = { current: i + 1, total: totalAccounts }
      res.write(JSON.stringify({ type: 'progress', progress }) + '\n')
      
      // Log task execution
      for (const task of tasks) {
        taskLogs.push({
          task,
          account: i + 1,
          status: Math.random() > 0.2 ? 'success' : 'failed',
          timestamp: new Date().toISOString()
        })
      }
    }

    isTaskRunning = false
    res.end()
  } catch (error) {
    console.error('Task execution error:', error)
    isTaskRunning = false
    res.status(500).json({ error: 'Failed to execute tasks' })
  }
})

// Stop tasks
app.post('/api/tasks/stop', (req, res) => {
  isTaskRunning = false
  res.json({ success: true })
})

// Run mutual subscription
app.post('/api/mutual-subscription/run', async (req, res) => {
  try {
    const { followersPerAccount, accounts: accountTokens } = req.body
    
    if (isTaskRunning) {
      return res.status(400).json({ error: 'Tasks are already running' })
    }

    isTaskRunning = true
    
    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    })

    // Simulate mutual subscription
    const totalAccounts = accountTokens.length
    
    for (let i = 0; i < totalAccounts; i++) {
      if (!isTaskRunning) break
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Send progress update
      const progress = { current: i + 1, total: totalAccounts }
      res.write(JSON.stringify({ type: 'progress', progress }) + '\n')
      
      // Log mutual subscription
      taskLogs.push({
        task: 'mutual_subscription',
        account: i + 1,
        status: Math.random() > 0.1 ? 'success' : 'failed',
        timestamp: new Date().toISOString()
      })
    }

    isTaskRunning = false
    res.end()
  } catch (error) {
    console.error('Mutual subscription error:', error)
    isTaskRunning = false
    res.status(500).json({ error: 'Failed to execute mutual subscription' })
  }
})

// Stop mutual subscription
app.post('/api/mutual-subscription/stop', (req, res) => {
  isTaskRunning = false
  res.json({ success: true })
})

// Get statistics
app.get('/api/statistics', (req, res) => {
  try {
    const totalTasks = taskLogs.length
    const successfulTasks = taskLogs.filter(log => log.status === 'success').length
    const successRate = totalTasks > 0 ? Math.round((successfulTasks / totalTasks) * 100) : 0
    
    // Group by task type
    const taskStats = {}
    taskLogs.forEach(log => {
      if (!taskStats[log.task]) {
        taskStats[log.task] = { total: 0, success: 0, failed: 0 }
      }
      taskStats[log.task].total++
      if (log.status === 'success') {
        taskStats[log.task].success++
      } else {
        taskStats[log.task].failed++
      }
    })
    
    // Recent activity (last 10)
    const recentActivity = taskLogs
      .slice(-10)
      .reverse()
      .map(log => ({
        task: log.task,
        status: log.status,
        timestamp: new Date(log.timestamp).toLocaleString()
      }))
    
    res.json({
      totalTasks,
      successRate,
      activeSessions: isTaskRunning ? 1 : 0,
      avgResponseTime: Math.floor(Math.random() * 1000) + 500,
      taskStats,
      recentActivity
    })
  } catch (error) {
    console.error('Statistics error:', error)
    res.status(500).json({ error: 'Failed to get statistics' })
  }
})

// Download logs
app.get('/api/statistics/download', (req, res) => {
  try {
    // Create workbook
    const wb = XLSX.utils.book_new()
    
    // Convert logs to worksheet
    const ws = XLSX.utils.json_to_sheet(taskLogs)
    XLSX.utils.book_append_sheet(wb, ws, 'Task Logs')
    
    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename=task_logs.xlsx')
    res.send(buffer)
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Failed to download logs' })
  }
})

// Initialize and start server
loadInitialData().then(() => {
  app.listen(port, () => {
    console.log(`StarLabs Twitter Bot API server running on port ${port}`)
  })
})