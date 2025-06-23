import mysql from "mysql2/promise"
import dotenv from "dotenv"

dotenv.config()

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "chatgpt_clone",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Create connection pool
export const pool = mysql.createPool(dbConfig)

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    })

    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`)
    await connection.end()

    // Create tables
    await createTables()
    console.log("Database tables created successfully")
  } catch (error) {
    console.error("Database initialization error:", error)
    throw error
  }
}

const createTables = async () => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      rank ENUM('user', 'admin', 'dev') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  const createChatsTable = `
    CREATE TABLE IF NOT EXISTS chats (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) DEFAULT 'New Chat',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  const createMessagesTable = `
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chat_id INT NOT NULL,
      role ENUM('user', 'ai') NOT NULL,
      content TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    )
  `

  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      chat_id INT NOT NULL,
      gemini_instance_id VARCHAR(255),
      context_data JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    )
  `

  const createUserLogsTable = `
    CREATE TABLE IF NOT EXISTS user_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      event_type VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      metadata JSON,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `

  await pool.execute(createUsersTable)
  await pool.execute(createChatsTable)
  await pool.execute(createMessagesTable)
  await pool.execute(createSessionsTable)
  await pool.execute(createUserLogsTable)
}

export default pool
