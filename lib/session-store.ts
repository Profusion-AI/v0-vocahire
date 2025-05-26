// lib/session-store.ts

// This is a placeholder for a proper, persistent session store (e.g., Redis, Database).
// In a production environment, this Map will not persist data across server restarts or multiple instances.
const sessionStore = new Map<string, any>();

export const getSession = (sessionId: string) => {
  return sessionStore.get(sessionId);
};

export const setSession = (sessionId: string, sessionData: any) => {
  sessionStore.set(sessionId, sessionData);
};

export const updateSession = (sessionId: string, updates: Partial<any>) => {
  const existingSession = sessionStore.get(sessionId);
  if (existingSession) {
    sessionStore.set(sessionId, { ...existingSession, ...updates });
    return sessionStore.get(sessionId);
  }
  return null;
};

export const deleteSession = (sessionId: string) => {
  sessionStore.delete(sessionId);
};
