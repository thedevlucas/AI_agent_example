import express from "express"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { fileURLToPath } from "url"
import { authenticateToken } from "../middleware/auth.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// ElevenLabs API configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID

// Generate audio from text using ElevenLabs
router.post("/generate", authenticateToken, async (req, res) => {
  try {
    const { text, messageId } = req.body

    if (!text || !messageId) {
      return res.status(400).json({ error: "Text and messageId are required" })
    }

    // Clean text for better audio generation
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]*`/g, "")
      .trim()
    if (!cleanText) {
      return res.status(400).json({ error: "No readable text found" })
    }

    // Create a hash of the text to use as filename
    const textHash = crypto.createHash("md5").update(cleanText).digest("hex")
    const audioFileName = `${messageId}_${textHash}.mp3`
    const audioPath = path.join(__dirname, "..", "public", "audio", audioFileName)

    // Check if audio file already exists
    if (fs.existsSync(audioPath)) {
      return res.json({
        success: true,
        audioUrl: `/public/audio/${audioFileName}`,
        cached: true,
      })
    }

    // Validate ElevenLabs API key
    if (!ELEVENLABS_API_KEY) {
      return res.status(500).json({
        error: "ElevenLabs API key not configured",
        details: "Please set ELEVENLABS_API_KEY environment variable",
      })
    }

    // Generate audio using ElevenLabs API with better error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    // Save audio file
    const audioBuffer = await response.arrayBuffer()
    fs.writeFileSync(audioPath, Buffer.from(audioBuffer))

    res.json({
      success: true,
      audioUrl: `/public/audio/${audioFileName}`,
      cached: false,
    })
  } catch (error) {
    console.error("Audio generation error:", error)

    if (error.name === "AbortError") {
      return res.status(408).json({
        error: "Request timeout",
        details: "Audio generation took too long",
      })
    }

    res.status(500).json({
      error: "Failed to generate audio",
      details: error.message,
    })
  }
})

// Get audio file info
router.get("/info/:filename", authenticateToken, (req, res) => {
  try {
    const { filename } = req.params
    const audioPath = path.join(__dirname, "..", "public", "audio", filename)

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: "Audio file not found" })
    }

    const stats = fs.statSync(audioPath)
    res.json({
      exists: true,
      size: stats.size,
      created: stats.birthtime,
    })
  } catch (error) {
    console.error("Audio info error:", error)
    res.status(500).json({ error: "Failed to get audio info" })
  }
})

export default router
