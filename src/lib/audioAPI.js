import api, { getBackendUrl } from "./api.js"

export const audioAPI = {
  generateAudio: (text, messageId) => {
    console.log("audioAPI: Generating audio for message:", messageId)
    return api.post("/audio/generate", { text, messageId })
  },

  getAudioInfo: (filename) => {
    console.log("audioAPI: Getting audio info for:", filename)
    return api.get(`/audio/info/${filename}`)
  },

  listAudioFiles: () => {
    console.log("audioAPI: Listing audio files")
    return api.get("/audio/list")
  },

  // Helper function to get the correct audio URL
  getAudioUrl: (relativePath) => {
    const backendUrl = getBackendUrl()
    return `${backendUrl}${relativePath}`
  },
}
