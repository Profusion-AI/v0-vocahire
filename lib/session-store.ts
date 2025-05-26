// lib/session-store.ts

import { redis } from './redis';

const SESSION_PREFIX = "session:";
const SESSION_EXPIRY_SECONDS = 3600; // 1 hour, matches JWT token expiry

export const getSession = async (sessionId: string) => {
  try {
    const session = await redis.get(`${SESSION_PREFIX}${sessionId}`);
    return session;
  } catch (error) {
    console.error(`Error getting session ${sessionId} from Redis:`, error);
    return null;
  }
};

export const setSession = async (sessionId: string, sessionData: any) => {
  try {
    // Set with expiry for automatic cleanup
    await redis.setex(`${SESSION_PREFIX}${sessionId}`, SESSION_EXPIRY_SECONDS, sessionData);
    return true;
  } catch (error) {
    console.error(`Error setting session ${sessionId} in Redis:`, error);
    return false;
  }
};

export const updateSession = async (sessionId: string, updates: Partial<any>) => {
  try {
    const existingSession = await getSession(sessionId);
    if (existingSession) {
      const updatedSession = { ...existingSession, ...updates };
      await setSession(sessionId, updatedSession); // setSession already handles expiry
      return updatedSession;
    }
    return null;
  } catch (error) {
    console.error(`Error updating session ${sessionId} in Redis:`, error);
    return null;
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    await redis.del(`${SESSION_PREFIX}${sessionId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting session ${sessionId} from Redis:`, error);
    return false;
  }
};
