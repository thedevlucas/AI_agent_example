import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import chatRoutes from "./routes/chat.js"
import messageRoutes from "./routes/message.js"
import { initializeDatabase } from "./config/database.js"
import session from "express-session"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import audioRoutes from "./routes/audio.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, "public", "audio")
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true })
}

// Serve static files from public directory with proper headers
app.use(
  "/public",
  express.static(path.join(__dirname, "public"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".mp3")) {
        res.setHeader("Content-Type", "audio/mpeg")
        res.setHeader("Accept-Ranges", "bytes")
        res.setHeader("Cache-Control", "public, max-age=31536000")
        res.setHeader("Access-Control-Allow-Origin", "*")
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        res.setHeader("Access-Control-Allow-Headers", "Range")
      }
    },
  }),
)

// Add specific CORS handling for audio files
app.options("/public/audio/{*any}", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Range")
  res.sendStatus(200)
})

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "una_clave_super_segura",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    },
  }),
)

app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/messages", messageRoutes)

// Audio routes
app.use("/api/audio", audioRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running!" })
})

// Test audio endpoint
app.get("/api/test-audio", (req, res) => {
  const audioDir = path.join(__dirname, "public", "audio")
  const files = fs.readdirSync(audioDir).filter((file) => file.endsWith(".mp3"))
  res.json({
    audioFiles: files,
    audioDir: audioDir,
    sampleUrl: files.length > 0 ? `/public/audio/${files[0]}` : null,
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!" })
})

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase()
    console.log("Database initialized successfully")

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Audio files served from: ${path.join(__dirname, "public", "audio")}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
