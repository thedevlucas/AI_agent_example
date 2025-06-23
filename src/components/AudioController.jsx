import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, RotateCcw, Loader2 } from "lucide-react"

const AudioController = ({ audioUrl, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const audioRef = useRef(null)

  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    console.log("AudioController: Setting up audio with URL:", audioUrl)

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => {
      console.log("AudioController: Audio loaded, duration:", audio.duration)
      setDuration(audio.duration)
      setIsLoading(false)
    }
    const handleEnded = () => {
      console.log("AudioController: Audio ended")
      setIsPlaying(false)
    }
    const handleLoadStart = () => {
      console.log("AudioController: Audio load started")
      setIsLoading(true)
      setHasError(false)
    }
    const handleCanPlay = () => {
      console.log("AudioController: Audio can play")
      setIsLoading(false)
    }
    const handleError = (e) => {
      console.error("AudioController: Audio error event:", e)
      console.error("AudioController: Audio error details:", {
        error: audio.error,
        networkState: audio.networkState,
        readyState: audio.readyState,
        src: audio.src,
      })

      let message = "Failed to load audio"
      if (audio.error) {
        switch (audio.error.code) {
          case 1:
            message = "Audio loading was aborted"
            break
          case 2:
            message = "Network error occurred"
            break
          case 3:
            message = "Audio format not supported"
            break
          case 4:
            message = "Audio source not found"
            break
          default:
            message = `Audio error (code: ${audio.error.code})`
        }
      }

      setErrorMessage(message)
      setHasError(true)
      setIsLoading(false)
    }

    const handleLoadedData = () => {
      console.log("AudioController: Audio data loaded")
    }

    const handleProgress = () => {
      console.log("AudioController: Audio loading progress")
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("loadeddata", handleLoadedData)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)
    audio.addEventListener("error", handleError)
    audio.addEventListener("progress", handleProgress)

    // Force load the audio
    audio.load()

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("loadeddata", handleLoadedData)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("progress", handleProgress)
    }
  }, [audioUrl])

  const togglePlayPause = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        console.log("AudioController: Attempting to play audio")
        await audio.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("AudioController: Play error:", error)
      setErrorMessage("Failed to play audio")
      setHasError(true)
    }
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (!audio || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handlePlaybackRateChange = (rate) => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = rate
    setPlaybackRate(rate)
  }

  const handleVolumeChange = (e) => {
    const audio = audioRef.current
    const newVolume = Number.parseFloat(e.target.value)

    if (audio) {
      audio.volume = newVolume
    }
    setVolume(newVolume)
  }

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="audio-controller">
      <audio ref={audioRef} src={audioUrl} preload="auto" crossOrigin="anonymous" />

      {hasError ? (
        <div className="audio-error">
          <span>{errorMessage}</span>
          <button
            onClick={() => {
              setHasError(false)
              setIsLoading(true)
              audioRef.current?.load()
            }}
            className="retry-btn"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="audio-controls">
          <button
            onClick={togglePlayPause}
            className="play-pause-btn"
            title={isPlaying ? "Pause" : "Play"}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>

          <div className="progress-container">
            <span className="time-display">{formatTime(currentTime)}</span>

            <div className="progress-bar" onClick={handleSeek}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                <div className="progress-thumb" style={{ left: `${progressPercent}%` }} />
              </div>
            </div>

            <span className="time-display">{formatTime(duration)}</span>
          </div>

          <div className="volume-control">
            <Volume2 size={14} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

          <div className="speed-control">
            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(Number.parseFloat(e.target.value))}
              className="speed-select"
            >
              {playbackRates.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}x
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              const audio = audioRef.current
              if (audio) {
                audio.currentTime = 0
                setCurrentTime(0)
              }
            }}
            className="reset-btn"
            title="Reset to beginning"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      <style jsx>{`
        .audio-controller {
          margin-top: 8px;
          padding: 12px;
          background: var(--tertiary-bg);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .audio-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }

        .play-pause-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--accent-blue);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .play-pause-btn:hover:not(:disabled) {
          background: #0099CC;
          transform: scale(1.05);
        }

        .play-pause-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 0;
        }

        .time-display {
          color: var(--text-secondary);
          font-size: 11px;
          font-family: monospace;
          min-width: 35px;
          text-align: center;
        }

        .progress-bar {
          flex: 1;
          height: 20px;
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 4px 0;
        }

        .progress-track {
          width: 100%;
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-blue), var(--accent-green));
          border-radius: 2px;
          transition: width 0.1s ease;
        }

        .progress-thumb {
          position: absolute;
          top: 50%;
          width: 12px;
          height: 12px;
          background: var(--accent-blue);
          border: 2px solid white;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: left 0.1s ease;
        }

        .progress-bar:hover .progress-thumb {
          transform: translate(-50%, -50%) scale(1.2);
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }

        .volume-slider {
          width: 60px;
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
        }

        .volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: var(--accent-blue);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: var(--accent-blue);
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .speed-control {
          flex-shrink: 0;
        }

        .speed-select {
          background: var(--secondary-bg);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          color: var(--text-primary);
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          outline: none;
        }

        .speed-select:focus {
          border-color: var(--accent-blue);
        }

        .reset-btn {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: none;
          background: var(--secondary-bg);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .reset-btn:hover {
          background: var(--tertiary-bg);
          color: var(--text-primary);
        }

        @media (max-width: 480px) {
          .audio-controls {
            gap: 8px;
          }
          
          .volume-control {
            display: none;
          }
          
          .time-display {
            font-size: 10px;
            min-width: 30px;
          }
        }

        .audio-error {
          padding: 12px;
          text-align: center;
          color: var(--error-color);
          font-size: 12px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: center;
        }

        .retry-btn {
          padding: 4px 12px;
          background: var(--accent-blue);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .retry-btn:hover {
          background: #0099CC;
        }
      `}</style>
    </div>
  )
}

export default AudioController
