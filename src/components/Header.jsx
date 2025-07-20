import React from 'react'
import { Star, Github, MessageCircle, BookOpen } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Star className="w-8 h-8 text-primary-600 star-animation" />
              <Star className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 star-animation" style={{ animationDelay: '1s' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">StarLabs</h1>
              <p className="text-sm text-gray-600">Twitter Bot v2.1</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/0xStarLabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://t.me/StarLabsChat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="hidden sm:inline">Chat</span>
            </a>
            <a
              href="https://star-labs.gitbook.io/star-labs/twitter/eng"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <BookOpen size={18} />
              <span className="hidden sm:inline">Docs</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header