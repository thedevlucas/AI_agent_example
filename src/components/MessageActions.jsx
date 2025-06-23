"use client"

import { useState } from "react"
import { Volume2, Copy, Check, Loader2 } from "lucide-react"
import { audioAPI } from "../lib/audioAPI.js"
import AudioController from "./AudioController.jsx"

const MessageActions = ({ message, content }) => {
  const [audioUrl, setAudioUrl] = useState(null)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [showAudioController, setShowAudioController] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTextToSpeech = async () => {
    if (audioUrl) {
      setShowAudioController(!showAudioController)
      return
    }

    setIsGeneratingAudio(true)
    try {
      console.log("MessageActions: Starting audio generation for message:", message.id)
      console.log("MessageActions: Content length:", content.length)

      const response = await audioAPI.generateAudio(content, message.id)
      console.log("MessageActions: Audio generation response:", response.data)

      if (response.data.success) {
        // Use the backend server URL (port 5000) instead of frontend (port 3000)
        const backendUrl = "http://localhost:5000"
        const fullAudioUrl = `${backendUrl}${response.data.audioUrl}`
        console.log("MessageActions: Full audio URL:", fullAudioUrl)

        // Test if the audio URL is accessible with more detailed logging
        try {
          console.log("MessageActions: Testing audio URL accessibility...")
          const testResponse = await fetch(fullAudioUrl, {
            method: "HEAD",
            mode: "cors",
          })
          console.log("MessageActions: Audio URL test response:", {
            status: testResponse.status,
            statusText: testResponse.statusText,
            headers: Object.fromEntries(testResponse.headers.entries()),
          })

          if (!testResponse.ok) {
            throw new Error(`Audio file not accessible: ${testResponse.status} ${testResponse.statusText}`)
          }

          console.log("MessageActions: Audio URL is accessible, setting up player")
          setAudioUrl(fullAudioUrl)
          setShowAudioController(true)
        } catch (fetchError) {
          console.error("MessageActions: Audio URL test failed:", fetchError)

          // Try to get more info about the file
          try {
            const filename = response.data.audioUrl.split("/").pop()
            const infoResponse = await audioAPI.getAudioInfo(filename)
            console.log("MessageActions: Audio file info:", infoResponse.data)
          } catch (infoError) {
            console.error("MessageActions: Could not get audio file info:", infoError)
          }

          throw new Error("Audio file not accessible")
        }
      } else {
        throw new Error("Failed to generate audio")
      }
    } catch (error) {
      console.error("MessageActions: Error generating audio:", error)

      let errorMessage = "Failed to generate audio. Please try again."
      if (error.response?.data?.details) {
        errorMessage = error.response.data.details
      } else if (error.message) {
        errorMessage = error.message
      }

      alert(errorMessage)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy text:", error)
    }
  }

  return (
    <div className="message-actions">
      <div className="action-buttons">
        <button
          onClick={handleTextToSpeech}
          disabled={isGeneratingAudio}
          className={`action-btn ${audioUrl ? "active" : ""}`}
          title="Text to Speech"
        >
          {isGeneratingAudio ? <Loader2 size={14} className="animate-spin" /> : <Volume2 size={14} />}
        </button>

        <button onClick={handleCopyText} className="action-btn" title="Copy text">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      {showAudioController && audioUrl && (
        <AudioController audioUrl={audioUrl} onClose={() => setShowAudioController(false)} />
      )}

      <style jsx>{`
        .message-actions {
          margin-top: 8px;
        }

        .action-buttons {
          display: flex;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .message:hover .action-buttons {
          opacity: 1;
        }

        .action-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--tertiary-bg);
          color: var(--text-primary);
          transform: scale(1.05);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .action-btn.active {
          background: var(--accent-blue);
          color: white;
          border-color: var(--accent-blue);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default MessageActions
