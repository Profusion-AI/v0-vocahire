/**
 * Global Interview Session Manager
 * Ensures only one interview session is active at a time
 * Handles cleanup of orphaned sessions and resources
 * Supports pause/resume functionality for better user experience
 */

// Session states
export enum SessionState {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  BACKGROUND = 'BACKGROUND',
  TERMINATED = 'TERMINATED'
}

interface SessionInfo {
  id: string
  state: SessionState
  cleanupCallback: () => void
  pauseTimeout?: NodeJS.Timeout
  originalAudioStates?: {
    localTracks: Array<{ track: MediaStreamTrack; enabled: boolean }>
    remoteAudio: { playing: boolean; currentTime: number }
  }
}

class InterviewSessionManager {
  private static instance: InterviewSessionManager
  private sessions: Map<string, SessionInfo> = new Map()
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private mediaStreams: Map<string, MediaStream> = new Map()
  private audioElements: Map<string, HTMLAudioElement> = new Map()
  private debugCallback: ((message: string) => void) | null = null
  private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map()
  
  // Configuration
  private readonly PAUSE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    if (typeof window !== 'undefined') {
      // Clean up everything on page unload
      window.addEventListener('beforeunload', () => {
        this.terminateAllSessions()
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
    
    // Check if this session already exists and is paused
    const existingSession = this.sessions.get(sessionId)
    if (existingSession && (existingSession.state === SessionState.PAUSED || existingSession.state === SessionState.BACKGROUND)) {
      this.log(`Found existing paused session: ${sessionId}, will resume instead of creating new`)
      return
    }
    
    // Find any active session and pause it instead of terminating
    const activeSession = Array.from(this.sessions.values()).find(s => s.state === SessionState.ACTIVE)
    if (activeSession && activeSession.id !== sessionId) {
      this.log(`Pausing currently active session: ${activeSession.id}`)
      this.pauseSession(activeSession.id)
    }

    // Create new session info
    const sessionInfo: SessionInfo = {
      id: sessionId,
      state: SessionState.ACTIVE,
      cleanupCallback
    }
    
    this.sessions.set(sessionId, sessionInfo)
    this.log(`Session registered and active: ${sessionId}`)
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

  pauseSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session || session.state !== SessionState.ACTIVE) {
      this.log(`Cannot pause session ${sessionId}: not found or not active`)
      return
    }

    this.log(`Pausing session: ${sessionId}`)
    
    // Save current audio states before pausing
    const mediaStream = this.mediaStreams.get(sessionId)
    const audioElement = this.audioElements.get(sessionId)
    
    if (mediaStream || audioElement) {
      session.originalAudioStates = {
        localTracks: [],
        remoteAudio: { playing: false, currentTime: 0 }
      }
      
      // Save and disable local audio tracks
      if (mediaStream) {
        mediaStream.getAudioTracks().forEach(track => {
          session.originalAudioStates!.localTracks.push({
            track,
            enabled: track.enabled
          })
          track.enabled = false // Mute microphone
        })
      }
      
      // Save and pause remote audio
      if (audioElement && !audioElement.paused) {
        session.originalAudioStates!.remoteAudio = {
          playing: true,
          currentTime: audioElement.currentTime
        }
        audioElement.pause()
      }
    }
    
    // Update session state
    session.state = SessionState.PAUSED
    
    // Set timeout for automatic termination
    const timeout = setTimeout(() => {
      this.log(`Session ${sessionId} auto-terminating after pause timeout`)
      this.terminateSession(sessionId)
    }, this.PAUSE_TIMEOUT_MS)
    
    session.pauseTimeout = timeout
    this.sessionTimeouts.set(sessionId, timeout)
    
    this.log(`Session paused: ${sessionId}`)
  }

  resumeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (!session || (session.state !== SessionState.PAUSED && session.state !== SessionState.BACKGROUND)) {
      this.log(`Cannot resume session ${sessionId}: not found or not paused`)
      return
    }

    this.log(`Resuming session: ${sessionId}`)
    
    // Clear termination timeout
    if (session.pauseTimeout) {
      clearTimeout(session.pauseTimeout)
      this.sessionTimeouts.delete(sessionId)
      session.pauseTimeout = undefined
    }
    
    // Restore audio states
    if (session.originalAudioStates) {
      // Re-enable local audio tracks
      session.originalAudioStates.localTracks.forEach(({ track, enabled }) => {
        if (track.readyState === 'live') {
          track.enabled = enabled
        }
      })
      
      // Resume remote audio if it was playing
      const audioElement = this.audioElements.get(sessionId)
      if (audioElement && session.originalAudioStates.remoteAudio.playing) {
        audioElement.currentTime = session.originalAudioStates.remoteAudio.currentTime
        audioElement.play().catch(e => 
          this.log(`Failed to resume audio playback: ${e}`)
        )
      }
      
      session.originalAudioStates = undefined
    }
    
    // Update session state
    session.state = SessionState.ACTIVE
    
    this.log(`Session resumed: ${sessionId}`)
  }

  terminateSession(sessionId: string): void {
    this.log(`Terminating session: ${sessionId}`)
    
    const session = this.sessions.get(sessionId)
    if (!session) {
      this.log(`Session ${sessionId} not found`)
      return
    }
    
    // Clear any pending timeouts
    if (session.pauseTimeout) {
      clearTimeout(session.pauseTimeout)
      this.sessionTimeouts.delete(sessionId)
    }
    
    // Update state to terminated
    session.state = SessionState.TERMINATED
    
    // Clean up all registered resources
    this.cleanupSessionResources(sessionId)
    
    // Call the cleanup callback if it exists
    if (session.cleanupCallback) {
      try {
        session.cleanupCallback()
        this.log(`Session cleanup callback executed: ${sessionId}`)
      } catch (error) {
        this.log(`Error during session cleanup callback: ${error}`)
      }
    }

    // Remove the session
    this.sessions.delete(sessionId)
    
    this.log(`Session terminated: ${sessionId}`)
  }

  isSessionActive(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    return session ? session.state === SessionState.ACTIVE : false
  }
  
  isSessionPaused(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    return session ? (session.state === SessionState.PAUSED || session.state === SessionState.BACKGROUND) : false
  }

  getSessionState(sessionId: string): SessionState | null {
    const session = this.sessions.get(sessionId)
    return session ? session.state : null
  }

  getActiveSessionId(): string | null {
    const activeSession = Array.from(this.sessions.values()).find(s => s.state === SessionState.ACTIVE)
    return activeSession ? activeSession.id : null
  }

  // Clean up all sessions (useful for testing or emergency cleanup)
  terminateAllSessions(): void {
    this.log('Terminating all sessions')
    const sessionIds = Array.from(this.sessions.keys())
    sessionIds.forEach(sessionId => this.terminateSession(sessionId))
  }

  // Get resource counts for debugging
  getResourceCounts(): { sessions: number; peerConnections: number; streams: number; audioElements: number } {
    return {
      sessions: this.sessions.size,
      peerConnections: this.peerConnections.size,
      streams: this.mediaStreams.size,
      audioElements: this.audioElements.size
    }
  }
  
  // Check if a session exists (in any state)
  hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }
}

// Export singleton instance
export const interviewSessionManager = typeof window !== 'undefined' 
  ? InterviewSessionManager.getInstance() 
  : null