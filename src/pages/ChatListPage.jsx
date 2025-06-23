import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { chatAPI } from '../lib/api.js';
import { MessageCircle, Plus, LogOut, Trash2, Clock, User } from 'lucide-react';

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const response = await chatAPI.getChats();
      setChats(response.data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    setCreating(true);
    try {
      const response = await chatAPI.createChat('New Chat');
      navigate(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setCreating(false);
    }
  };

  const deleteChat = async (chatId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    try {
      await chatAPI.deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container">
        {/* Header */}
        <header className="py-6 border-b border-border-color">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle size={32} className="text-accent-blue" />
              <h1 className="text-2xl font-bold">Chat AI</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <User size={16} />
                <span>{user?.username || user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="btn btn-ghost"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
          <div className="max-w-4xl mx-auto">
            {/* New Chat Button */}
            <div className="mb-8">
              <button
                onClick={createNewChat}
                disabled={creating}
                className="btn btn-primary"
              >
                <Plus size={20} />
                {creating ? 'Creating...' : 'New Chat'}
              </button>
            </div>

            {/* Chat List */}
            {chats.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle size={64} className="text-text-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">No chats yet</h2>
                <p className="text-text-secondary mb-6">
                  Start a new conversation with AI
                </p>
                <button
                  onClick={createNewChat}
                  disabled={creating}
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  {creating ? 'Creating...' : 'Start Your First Chat'}
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {chats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chat/${chat.id}`}
                    className="chat-card"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-text-primary mb-1">
                          {chat.title}
                        </h3>
                        <div className="flex items-center gap-2 text-text-muted text-sm">
                          <Clock size={14} />
                          <span>{formatDate(chat.last_active_at)}</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteChat(chat.id, e)}
                        className="delete-btn"
                        title="Delete chat"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx>{`
        .chat-card {
          display: block;
          padding: 20px;
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .chat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          border-color: var(--accent-blue);
        }

        .chat-card:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.05), transparent);
          transition: left 0.5s;
        }

        .chat-card:hover:before {
          left: 100%;
        }

        .delete-btn {
          padding: 8px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .chat-card:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover {
          background: var(--error-color);
          color: white;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default ChatListPage;