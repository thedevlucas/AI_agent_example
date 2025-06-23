"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.jsx"
import { chatAPI, messageAPI } from "../lib/api.js"
import { ArrowLeft, Send, Bot, User, Loader2, MessageCircle, Shield } from "lucide-react"
import MessageRenderer from "../components/MessageRenderer.jsx"
import MessageActions from "../components/MessageActions.jsx"

const ChatPage = () => {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Check if current user is admin
  const isAdmin = user.rank == "dev"

  useEffect(() => {
    if (user && chatId) {
      loadChat()
      loadMessages()
    }
  }, [user, chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadChat = async () => {
    try {
      const response = await chatAPI.getChat(chatId)
      setChat(response.data)
    } catch (error) {
      console.error("Error loading chat:", error)
      navigate("/chats")
    }
  }

  const loadMessages = async () => {
    try {
      const response = await messageAPI.getMessages(chatId)
      console.log("Loaded messages:", response.data)
      setMessages(response.data || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSending(true)

    try {
      const response = await messageAPI.sendMessage(chatId, messageText)
      console.log("Send message response:", response.data)

      // Handle both single AI message and multiple AI messages (for admin commands)
      if (response.data.aiMessages) {
        // Admin command with multiple messages
        const newMessages = [response.data.userMessage, ...response.data.aiMessages]
        console.log("New messages (admin command):", newMessages)
        setMessages((prev) => [...prev, ...newMessages])
      } else {
        // Regular conversation with single AI message
        const { userMessage, aiMessage } = response.data
        console.log("New messages (regular):", { userMessage, aiMessage })
        setMessages((prev) => [...prev, userMessage, aiMessage])
      }

      // Update chat title if it's the first message
      if (messages.length === 0) {
        const title = messageText.length > 50 ? messageText.substring(0, 50) + "..." : messageText
        setChat((prev) => ({ ...prev, title }))
      }
    } catch (error) {
      console.error("Error sending message:", error)
      // Show error message to user
      const errorMessage = {
        id: Date.now(),
        chat_id: chatId,
        role: "ai",
        content: "Sorry, I encountered an error while processing your message. Please try again.",
        timestamp: new Date().toISOString(),
        emotion: "concerned + apologetic",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaChange = (e) => {
    setNewMessage(e.target.value)

    // Auto-resize textarea
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/chats" className="btn btn-ghost">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-3">
                <MessageCircle size={24} className="text-accent-blue" />
                <h1 className="text-lg font-semibold">{chat?.title || "New Chat"}</h1>
                {isAdmin && (
                  <span className="admin-badge">
                    <Shield size={14} />
                    Admin Mode
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="chat-messages">
        <div className="container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <Bot size={64} className="text-text-muted mb-4" />
              <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
              <p className="text-text-secondary">Send a message to begin your chat with AI</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => {

                return (
                  <div
                    key={message.id}
                    className={`message ${message.role === "user" ? "message-user" : "message-ai"}`}
                  >
                    <div className="message-avatar">
                      {message.role === "user" ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        <MessageRenderer content={message.content} />
                        {/* Emotion display in corner for admin users */}
                        {isAdmin && message.emotion && message.role === "ai" && (
                          <span className="emotion-corner">{message.emotion}</span>
                        )}
                      </div>
                      <div className="message-time">{new Date(message.timestamp).toLocaleTimeString()}</div>
                      {message.role === "ai" && <MessageActions message={message} content={message.content} />}
                    </div>
                  </div>
                )
              })}
              {sending && (
                <div className="message message-ai">
                  <div className="message-avatar">
                    <Bot size={20} />
                  </div>
                  <div className="message-content">
                    <div className="message-text typing">
                      <Loader2 size={16} className="animate-spin" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input */}
      <footer className="chat-input">
        <div className="container">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="message-input"
              disabled={sending}
              rows={1}
            />
            <button onClick={sendMessage} disabled={!newMessage.trim() || sending} className="send-button">
              {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .chat-page {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--primary-bg);
        }

        .chat-header {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--glass-border);
          padding: 16px 0;
          flex-shrink: 0;
        }

        .admin-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #3B82F6, #1D4ED8);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 0;
        }

        .empty-chat {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          min-height: 400px;
        }

        .messages-list {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .message {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          animation: fadeIn 0.3s ease-out;
        }

        .message-user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .message-user .message-avatar {
          background: linear-gradient(135deg, var(--accent-blue), #0099CC);
          color: white;
        }

        .message-ai .message-avatar {
          background: var(--tertiary-bg);
          color: var(--accent-green);
          border: 1px solid var(--border-light);
        }

        .message-content {
          flex: 1;
          max-width: 70%;
        }

        .message-text {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 18px;
          padding: 12px 16px;
          color: var(--text-primary);
          line-height: 1.5;
          word-wrap: break-word;
          position: relative;
        }

        .message-user .message-text {
          background: linear-gradient(135deg, var(--accent-blue), #0099CC);
          color: white;
          border: none;
        }

        .message-text.typing {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
        }

        .emotion-corner {
          position: absolute;
          bottom: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: #00D4FF;
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 500;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 212, 255, 0.3);
          z-index: 10;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .message-user .emotion-corner {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .message-time {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
          padding: 0 16px;
        }

        .message-user .message-time {
          text-align: right;
        }

        .chat-input {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-top: 1px solid var(--glass-border);
          padding: 16px 0;
          flex-shrink: 0;
        }

        .input-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          gap: 12px;
          align-items: end;
          padding: 0 20px;
        }

        .message-input {
          flex: 1;
          background: var(--secondary-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 12px 20px;
          color: var(--text-primary);
          font-size: 16px;
          resize: none;
          outline: none;
          transition: all 0.3s ease;
          min-height: 44px;
          max-height: 120px;
        }

        .message-input:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }

        .message-input::placeholder {
          color: var(--text-muted);
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, var(--accent-blue), #0099CC);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.4);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @media (max-width: 768px) {
          .chat-messages {
            padding: 16px 0;
          }

          .messages-list {
            padding: 0 16px;
          }

          .message-content {
            max-width: 85%;
          }

          .input-container {
            padding: 0 16px;
          }

          .emotion-corner {
            font-size: 9px;
            padding: 1px 4px;
            max-width: 100px;
          }
        }
      `}</style>
    </div>
  )
}

export default ChatPage
