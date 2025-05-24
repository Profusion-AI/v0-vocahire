/**
 * Global Interview Session Manager
 * Ensures only one interview session is active at a time
 * Handles cleanup of orphaned sessions and resources
 */
class InterviewSessionManager {
  private static instance: InterviewSessionManager
  private activeSessionId: string | null = null
  private cleanupCallbacks: Map<string, () => void> = new Map()
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private mediaStreams: Map<string, MediaStream> = new Map()
  private audioElements: Map<string, HTMLAudioElement> = new Map()
  private debugCallback: ((message: string) => void) | null = null

  private constructor() {
    if (typeof window !== 'undefined') {
      // Clean up everything on page unload
      window.addEventListener('beforeunload', () => {
        this.cleanupAllSessions()
      })
    }
  }

  static getInstance(): InterviewSessionManager {
    if (!InterviewSessionManager.instance) {
      InterviewSessionManager.instance = new InterviewSessionManager()
    }
    return InterviewSessionManager.instance
  }

  setDebugCallback(callback: (message: string) => void) {
    this.debugCallback = callback
  }

  private log(message: string) {
    if (this.debugCallback) {
      this.debugCallback(`[SessionManager] ${message}`)
    }
    console.log(`[SessionManager] ${message}`)
  }

  registerSession(sessionId: string, cleanupCallback: () => void): void {
    this.log(`Registering session: ${sessionId}`)
    
    // If there's an active session that's different, clean it up first
    if (this.activeSessionId && this.activeSessionId !== sessionId) {
      this.log(`Cleaning up previous session: ${this.activeSessionId}`)
      const previousCallback = this.cleanupCallbacks.get(this.activeSessionId)
      if (previousCallback) {
        try {
          // Call the cleanup callback for the old session
          previousCallback()
        } catch (error) {
          this.log(`Error calling cleanup callback for previous session: ${error}`)
        }
      }
      // Ensure resources are cleaned up even if callback fails
      this.cleanupSessionResources(this.activeSessionId)
    }

    this.activeSessionId = sessionId
    this.cleanupCallbacks.set(sessionId, cleanupCallback)
    this.log(`Session registered: ${sessionId}`)
  }

  registerPeerConnection(sessionId: string, pc: RTCPeerConnection): void {
    if (!sessionId || !pc) return
    this.log(`Registering peer connection for session: ${sessionId}`)
    this.peerConnections.set(sessionId, pc)
  }

  registerMediaStream(sessionId: string, stream: MediaStream): void {
    if (!sessionId || !stream) return
    this.log(`Registering media stream for session: ${sessionId}`)
    this.mediaStreams.set(sessionId, stream)
  }

  registerAudioElement(sessionId: string, audioEl: HTMLAudioElement): void {
    if (!sessionId || !audioEl) return
    this.log(`Registering audio element for session: ${sessionId}`)
    
    // Clean up any existing audio element for this session
    const existingAudio = this.audioElements.get(sessionId)
    if (existingAudio && existingAudio !== audioEl) {
      this.cleanupAudioElement(existingAudio)
    }
    
    this.audioElements.set(sessionId, audioEl)
  }

  private cleanupAudioElement(audioEl: HTMLAudioElement): void {
    if (!audioEl) return
    try {
      audioEl.pause()
      audioEl.srcObject = null
      audioEl.src = ''
      audioEl.load() // Reset the element
      // Remove from DOM if it's attached
      if (audioEl.parentNode) {
        audioEl.remove()
      }
      this.log('Audio element cleaned up')
    } catch (error) {
      this.log(`Error cleaning up audio element: ${error}`)
    }
  }

  private cleanupPeerConnection(pc: RTCPeerConnection): void {
    if (!pc) return
    try {
      // Check if connection is already closed
      if (pc.connectionState === 'closed') {
        this.log('Peer connection already closed')
        return
      }

      // Close all data channels
      // Note: We can't directly access data channels, but closing the PC will close them
      
      // Stop all transceivers
      if (pc.getTransceivers) {
        pc.getTransceivers().forEach(transceiver => {
          try {
            transceiver.stop()
          } catch (e) {
            this.log(`Error stopping transceiver: ${e}`)
          }
        })
      }

      // Remove all tracks
      const senders = pc.getSenders()
      senders.forEach(sender => {
        try {
          pc.removeTrack(sender)
        } catch (e) {
          this.log(`Error removing sender: ${e}`)
        }
      })

      // Close the peer connection
      pc.close()
      this.log('Peer connection closed')
    } catch (error) {
      this.log(`Error cleaning up peer connection: ${error}`)
    }
  }

  private cleanupMediaStream(stream: MediaStream): void {
    if (!stream) return
    try {
      stream.getTracks().forEach(track => {
        track.stop()
        this.log(`Track stopped: ${track.kind}`)
      })
    } catch (error) {
      this.log(`Error cleaning up media stream: ${error}`)
    }
  }

  private cleanupSessionResources(sessionId: string): void {
    this.log(`Cleaning up resources for session: ${sessionId}`)

    // Clean up audio element first (most important for preventing audio overlap)
    const audioEl = this.audioElements.get(sessionId)
    if (audioEl) {
      this.cleanupAudioElement(audioEl)
      this.audioElements.delete(sessionId)
    }

    // Clean up media stream
    const stream = this.mediaStreams.get(sessionId)
    if (stream) {
      this.cleanupMediaStream(stream)
      this.mediaStreams.delete(sessionId)
    }

    // Clean up peer connection last (as it might reference the stream)
    const pc = this.peerConnections.get(sessionId)
    if (pc) {
      this.cleanupPeerConnection(pc)
      this.peerConnections.delete(sessionId)
    }

    this.log(`Resources cleaned up for session: ${sessionId}`)
  }

  cleanupSession(sessionId: string): void {
    this.log(`Cleaning up session: ${sessionId}`)
    
    // First, clean up all registered resources
    this.cleanupSessionResources(sessionId)
    
    // Then call the cleanup callback if it exists
    const cleanupCallback = this.cleanupCallbacks.get(sessionId)
    if (cleanupCallback) {
      try {
        cleanupCallback()
        this.log(`Session cleanup callback executed: ${sessionId}`)
      } catch (error) {
        this.log(`Error during session cleanup callback: ${error}`)
      }
    }

    // Remove the cleanup callback
    this.cleanupCallbacks.delete(sessionId)
    
    // Clear active session if it's the one being cleaned up
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null
      this.log(`Active session cleared: ${sessionId}`)
    }
  }

  isSessionActive(sessionId: string): boolean {
    return this.activeSessionId === sessionId
  }

  getActiveSessionId(): string | null {
    return this.activeSessionId
  }

  // Clean up all sessions (useful for testing or emergency cleanup)
  cleanupAllSessions(): void {
    this.log('Cleaning up all sessions')
    const sessionIds = Array.from(this.cleanupCallbacks.keys())
    sessionIds.forEach(sessionId => this.cleanupSession(sessionId))
  }

  // Get resource counts for debugging
  getResourceCounts(): { sessions: number; peerConnections: number; streams: number; audioElements: number } {
    return {
      sessions: this.cleanupCallbacks.size,
      peerConnections: this.peerConnections.size,
      streams: this.mediaStreams.size,
      audioElements: this.audioElements.size
    }
  }
}

// Export singleton instance
export const interviewSessionManager = typeof window !== 'undefined' 
  ? InterviewSessionManager.getInstance() 
  : null