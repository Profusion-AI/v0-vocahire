/**
 * Global Interview Session Manager
 * Ensures only one interview session can be active at a time
 * Manages cleanup of orphaned sessions and prevents audio overlap
 */

class InterviewSessionManager {
  private static instance: InterviewSessionManager;
  private activeSessionId: string | null = null;
  private cleanupCallbacks: Map<string, () => void> = new Map();
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private mediaStreams: Map<string, MediaStream> = new Map();

  private constructor() {
    if (typeof window !== 'undefined') {
      // Listen for page unload to clean up everything
      window.addEventListener('beforeunload', () => {
        this.cleanupAllSessions();
      });

      // Listen for visibility changes to pause/resume audio
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAllAudio();
        } else {
          this.resumeAllAudio();
        }
      });
    }
  }

  static getInstance(): InterviewSessionManager {
    if (!InterviewSessionManager.instance) {
      InterviewSessionManager.instance = new InterviewSessionManager();
    }
    return InterviewSessionManager.instance;
  }

  /**
   * Register a new session and cleanup any existing sessions
   */
  registerSession(sessionId: string, cleanupCallback: () => void): void {
    console.log(`[SessionManager] Registering new session: ${sessionId}`);
    
    // If there's an active session, clean it up first
    if (this.activeSessionId && this.activeSessionId !== sessionId) {
      console.log(`[SessionManager] Cleaning up previous session: ${this.activeSessionId}`);
      this.cleanupSession(this.activeSessionId);
    }

    this.activeSessionId = sessionId;
    this.cleanupCallbacks.set(sessionId, cleanupCallback);
  }

  /**
   * Register an audio element for a session
   */
  registerAudioElement(sessionId: string, audioElement: HTMLAudioElement): void {
    // Clean up any existing audio for this session
    const existingAudio = this.audioElements.get(sessionId);
    if (existingAudio && existingAudio !== audioElement) {
      existingAudio.pause();
      existingAudio.srcObject = null;
      existingAudio.remove();
    }

    this.audioElements.set(sessionId, audioElement);
  }

  /**
   * Register a peer connection for a session
   */
  registerPeerConnection(sessionId: string, peerConnection: RTCPeerConnection): void {
    this.peerConnections.set(sessionId, peerConnection);
  }

  /**
   * Register a media stream for a session
   */
  registerMediaStream(sessionId: string, stream: MediaStream): void {
    this.mediaStreams.set(sessionId, stream);
  }

  /**
   * Check if a session is currently active
   */
  isSessionActive(sessionId: string): boolean {
    return this.activeSessionId === sessionId;
  }

  /**
   * Clean up a specific session
   */
  cleanupSession(sessionId: string): void {
    console.log(`[SessionManager] Cleaning up session: ${sessionId}`);

    // Clean up audio element
    const audioElement = this.audioElements.get(sessionId);
    if (audioElement) {
      audioElement.pause();
      audioElement.srcObject = null;
      audioElement.remove();
      this.audioElements.delete(sessionId);
    }

    // Clean up peer connection
    const peerConnection = this.peerConnections.get(sessionId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(sessionId);
    }

    // Clean up media stream
    const mediaStream = this.mediaStreams.get(sessionId);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStreams.delete(sessionId);
    }

    // Call the cleanup callback
    const cleanupCallback = this.cleanupCallbacks.get(sessionId);
    if (cleanupCallback) {
      try {
        cleanupCallback();
      } catch (error) {
        console.error(`[SessionManager] Error in cleanup callback:`, error);
      }
      this.cleanupCallbacks.delete(sessionId);
    }

    // Clear active session if it matches
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = null;
    }
  }

  /**
   * Clean up all sessions
   */
  cleanupAllSessions(): void {
    console.log(`[SessionManager] Cleaning up all sessions`);
    const sessionIds = Array.from(this.cleanupCallbacks.keys());
    sessionIds.forEach(sessionId => this.cleanupSession(sessionId));
  }

  /**
   * Pause all audio elements (for tab switching)
   */
  private pauseAllAudio(): void {
    this.audioElements.forEach(audio => {
      if (!audio.paused) {
        audio.pause();
      }
    });
  }

  /**
   * Resume all audio elements (for tab switching)
   */
  private resumeAllAudio(): void {
    if (this.activeSessionId) {
      const audio = this.audioElements.get(this.activeSessionId);
      if (audio && audio.paused) {
        audio.play().catch(e => 
          console.error(`[SessionManager] Failed to resume audio:`, e)
        );
      }
    }
  }

  /**
   * Get the currently active session ID
   */
  getActiveSessionId(): string | null {
    return this.activeSessionId;
  }
}

// Export singleton instance
export const sessionManager = typeof window !== 'undefined' 
  ? InterviewSessionManager.getInstance() 
  : null;