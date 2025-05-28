import { GoogleLiveAPIClient, Tool } from './google-live-api';
import { redis } from './redis';
import { getSecret } from './secret-manager';

interface SessionMetadata {
  userId: string;
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  status: 'active' | 'ended' | 'error';
}

export class LiveAPISessionManager {
  private static instance: LiveAPISessionManager;
  private sessions: Map<string, GoogleLiveAPIClient> = new Map();
  private metadata: Map<string, SessionMetadata> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CLEANUP_INTERVAL = 60 * 1000; // 1 minute

  private constructor() {
    this.startCleanupInterval();
  }

  static getInstance(): LiveAPISessionManager {
    if (!LiveAPISessionManager.instance) {
      LiveAPISessionManager.instance = new LiveAPISessionManager();
    }
    return LiveAPISessionManager.instance;
  }

  async getOrCreateSession(
    sessionId: string,
    config: {
      model: string;
      systemInstruction: { parts: { text: string }[] };
      generationConfig?: any;
      tools?: Tool[];
    }
  ): Promise<GoogleLiveAPIClient> {
    // Check if session already exists
    if (this.sessions.has(sessionId)) {
      const existingClient = this.sessions.get(sessionId)!;
      this.updateActivity(sessionId);
      return existingClient;
    }

    // Create new client with fetched API key
    const apiKey = await getSecret('GOOGLE_AI_API_KEY');
    const client = new GoogleLiveAPIClient({
      apiKey: apiKey || '', // Use the fetched API key
      model: config.model || 'models/gemini-2.0-flash-exp',
      systemInstruction: config.systemInstruction,
      generationConfig: config.generationConfig,
    });

    // Store session
    this.sessions.set(sessionId, client);
    this.metadata.set(sessionId, {
      userId: '', // We don't have userId in the new interface
      sessionId,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: 'active',
    });

    // Store metadata in Redis for distributed systems
    if (redis) {
      await redis.setex(
        `session:${sessionId}`,
        this.SESSION_TIMEOUT / 1000,
        JSON.stringify(this.metadata.get(sessionId))
      );
    }

    // Set up cleanup on disconnect
    client.on('disconnected', () => {
      this.endSession(sessionId);
    });

    return client;
  }

  getSession(sessionId: string): GoogleLiveAPIClient | null {
    const client = this.sessions.get(sessionId);
    if (client) {
      this.updateActivity(sessionId);
    }
    return client || null;
  }

  async closeSession(sessionId: string): Promise<void> {
    return this.endSession(sessionId);
  }

  async endSession(sessionId: string): Promise<void> {
    const client = this.sessions.get(sessionId);
    if (client) {
      client.disconnect();
      this.sessions.delete(sessionId);
    }

    const metadata = this.metadata.get(sessionId);
    if (metadata) {
      metadata.status = 'ended';
      this.metadata.delete(sessionId);
    }

    // Remove from Redis
    if (redis) {
      await redis.del(`session:${sessionId}`);
    }
  }

  async getActiveSessionsCount(): Promise<number> {
    return this.sessions.size;
  }

  async getSessionMetadata(sessionId: string): Promise<SessionMetadata | null> {
    // Try local first
    const local = this.metadata.get(sessionId);
    if (local) return local;

    // Try Redis
    if (redis) {
      const data = await redis.get(`session:${sessionId}`);
      // Ensure data is a non-empty string before parsing
      if (typeof data === 'string' && data.length > 0) {
        try {
          return JSON.parse(data) as SessionMetadata;
        } catch (e) {
          console.error(`Error parsing session metadata for ${sessionId}:`, e);
          return null; // Return null if parsing fails
        }
      }
    }

    return null;
  }

  private updateActivity(sessionId: string): void {
    const metadata = this.metadata.get(sessionId);
    if (metadata) {
      metadata.lastActivity = Date.now();
      
      // Update Redis
      if (redis) {
        redis.setex(
          `session:${sessionId}`,
          this.SESSION_TIMEOUT / 1000,
          JSON.stringify(metadata)
        ).catch(console.error);
      }
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, this.CLEANUP_INTERVAL);
  }

  private async cleanupInactiveSessions(): Promise<void> {
    const now = Date.now();
    const sessionsToRemove: string[] = [];

    for (const [sessionId, metadata] of this.metadata.entries()) {
      if (now - metadata.lastActivity > this.SESSION_TIMEOUT) {
        sessionsToRemove.push(sessionId);
      }
    }

    // Remove inactive sessions
    for (const sessionId of sessionsToRemove) {
      console.log(`Cleaning up inactive session: ${sessionId}`);
      await this.endSession(sessionId);
    }
  }

  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // End all active sessions
    const sessionIds = Array.from(this.sessions.keys());
    await Promise.all(sessionIds.map(id => this.endSession(id)));
  }
}

// Export singleton instance
export const liveAPISessionManager = LiveAPISessionManager.getInstance();
