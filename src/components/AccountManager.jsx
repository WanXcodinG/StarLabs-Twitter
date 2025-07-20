import React, { useState, useRef } from 'react'
import { Upload, Download, Plus, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react'

const AccountManager = ({ accounts, setAccounts }) => {
  const [showTokens, setShowTokens] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/accounts/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const newAccounts = await response.json()
        setAccounts(newAccounts)
        alert('Accounts uploaded successfully!')
      } else {
        alert('Failed to upload accounts')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading file')
    } finally {
      setIsUploading(false)
      event.target.value = ''
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = "AUTH_TOKEN,PROXY,USERNAME,STATUS\n,,,\n,,,\n,,,"
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'accounts_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleValidateAccounts = async () => {
    try {
      const response = await fetch('/api/accounts/validate', {
        method: 'POST'
      })

      if (response.ok) {
        const updatedAccounts = await response.json()
        setAccounts(updatedAccounts)
        alert('Account validation completed!')
      } else {
        alert('Failed to validate accounts')
      }
    } catch (error) {
      console.error('Validation error:', error)
      alert('Error validating accounts')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      'ok': { class: 'status-success', text: 'Active' },
      'locked': { class: 'status-warning', text: 'Locked' },
      'suspended': { class: 'status-error', text: 'Suspended' },
      'wrong_token': { class: 'status-error', text: 'Invalid Token' },
      'unknown': { class: 'status-info', text: 'Unknown' }
    }

    const config = statusConfig[status] || statusConfig['unknown']
    return (
      <span className={`status-badge ${config.class}`}>
        {config.text}
      </span>
    )
  }

  const maskToken = (token) => {
    if (!token) return 'N/A'
    return showTokens ? token : `${token.substring(0, 6)}...${token.substring(token.length - 4)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account Manager</h2>
          <p className="text-gray-600">Manage your Twitter accounts</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadTemplate}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            Template
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-primary flex items-center gap-2"
          >
            <Upload size={18} />
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
          
          <button
            onClick={handleValidateAccounts}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Validate
          </button>
        </div>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {accounts.filter(acc => acc.status === 'ok').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Locked</p>
          <p className="text-2xl font-bold text-yellow-600">
            {accounts.filter(acc => acc.status === 'locked').length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-600">Issues</p>
          <p className="text-2xl font-bold text-red-600">
            {accounts.filter(acc => acc.status && acc.status !== 'ok').length}
          </p>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Accounts ({accounts.length})</h3>
          <button
            onClick={() => setShowTokens(!showTokens)}
            className="btn-secondary flex items-center gap-2"
          >
            {showTokens ? <EyeOff size={18} /> : <Eye size={18} />}
            {showTokens ? 'Hide' : 'Show'} Tokens
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts loaded</h3>
            <p className="text-gray-600 mb-4">Upload an Excel file to get started</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Upload Accounts
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">#</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Auth Token</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Username</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Proxy</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-mono">
                      {maskToken(account.auth_token)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {account.username || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {account.proxy ? '✓' : '✗'}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {getStatusBadge(account.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountManager