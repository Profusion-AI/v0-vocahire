// This file handles WebSocket communication with the OpenAI Realtime API

export interface RealtimeWebSocketOptions {
  sessionId: string
  token: string
  onOpen?: () => void
  onMessage?: (event: MessageEvent) => void
  onError?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
}

export class RealtimeWebSocket {
  private ws: WebSocket | null = null
  private options: RealtimeWebSocketOptions
  private eventIdCounter = 0

  constructor(options: RealtimeWebSocketOptions) {
    this.options = options
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // OpenAI Realtime WebSocket requires the ephemeral token
        // Browser WebSockets can't send custom headers, so we include it in the URL
        const wsUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`
        console.log("Connecting to OpenAI Realtime WebSocket with ephemeral token")
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log("WebSocket connection established")
          
          // For OpenAI Realtime WebSocket, we need to send the ephemeral token
          // as the first message to authenticate the session
          const authMessage = {
            event_id: this.generateEventId(),
            type: "session.update",
            session: {
              ephemeral_token: this.options.token
            }
          }
          
          this.ws!.send(JSON.stringify(authMessage))
          console.log("Sent authentication message with ephemeral token")
          
          if (this.options.onOpen) this.options.onOpen()
          resolve()
        }

        this.ws.onmessage = (event) => {
          console.log("WebSocket message received:", event.data)
          if (this.options.onMessage) this.options.onMessage(event)
        }

        this.ws.onerror = (event) => {
          console.error("WebSocket error:", event)
          if (this.options.onError) this.options.onError(event)
          reject(new Error("WebSocket connection error"))
        }

        this.ws.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason)
          if (this.options.onClose) this.options.onClose(event)
        }
      } catch (error) {
        console.error("Error creating WebSocket:", error)
        reject(error)
      }
    })
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  // Generate a unique event ID for each message
  private generateEventId(): string {
    return `event_${Date.now()}_${this.eventIdCounter++}`
  }

  // Send a message to the server
  send(type: string, data: any = {}): string {
    if (!this.isConnected()) {
      throw new Error("WebSocket is not connected")
    }

    const eventId = this.generateEventId()
    const message = {
      event_id: eventId,
      type,
      ...data,
    }

    this.ws!.send(JSON.stringify(message))
    return eventId
  }

  // Helper methods for common message types

  // Update session configuration
  updateSession(sessionConfig: any): string {
    return this.send("session.update", {
      session: sessionConfig,
    })
  }

  // Append audio to the input buffer
  appendAudio(audioBase64: string): string {
    return this.send("input_audio_buffer.append", {
      audio: audioBase64,
    })
  }

  // Commit the audio buffer
  commitAudioBuffer(): string {
    return this.send("input_audio_buffer.commit")
  }

  // Clear the audio buffer
  clearAudioBuffer(): string {
    return this.send("input_audio_buffer.clear")
  }

  // Create a response
  createResponse(responseConfig: any = {}): string {
    return this.send("response.create", {
      response: responseConfig,
    })
  }

  // Cancel a response
  cancelResponse(responseId?: string): string {
    return this.send("response.cancel", responseId ? { response_id: responseId } : {})
  }

  // Clear the output audio buffer
  clearOutputAudioBuffer(): string {
    return this.send("output_audio_buffer.clear")
  }
}

// Parse a WebSocket message
export function parseWebSocketMessage(event: MessageEvent): any {
  try {
    return JSON.parse(event.data)
  } catch (error) {
    console.error("Error parsing WebSocket message:", error)
    return null
  }
}

// Helper function to handle WebSocket events
export function handleWebSocketEvent(event: any, handlers: Record<string, (data: any) => void>): void {
  if (!event || !event.type) {
    console.error("Invalid WebSocket event:", event)
    return
  }

  const handler = handlers[event.type]
  if (handler) {
    handler(event)
  } else {
    console.log("Unhandled WebSocket event type:", event.type)
  }
}
