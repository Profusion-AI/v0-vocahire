import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { setSession } from 'lib/session-store';
import { v4 as uuidv4 } from 'uuid';

const CreateSessionSchema = z.object({
  userId: z.string().optional(), // Clerk handles this, but keeping for clarity
  jobTitle: z.string(),
  resumeContext: z.string().nullable().optional(),
  interviewType: z.enum(["technical", "behavioral", "mixed"]).default("technical"),
  preferences: z.object({
    difficulty: z.enum(["junior", "mid", "senior"]).default("mid"),
    duration: z.number().int().min(1).max(120).default(30), // minutes
    focusAreas: z.array(z.string()).optional(),
  }).optional(),
});

// Helper to fetch ICE servers
async function getIceServers() {
  try {
    // Assuming Xirsys API is accessible and configured via environment variables
    const XIRSYS_SECRET = process.env.XIRSYS_SECRET;
    if (!XIRSYS_SECRET) {
      console.warn("XIRSYS_SECRET is not set. Using default STUN servers.");
      return [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ];
    }

    const xirsysResponse = await fetch('https://global.xirsys.net/_turn/vocahire', {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`vocahire:${XIRSYS_SECRET}`).toString('base64'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: "urls"
      })
    });

    const data = await xirsysResponse.json();

    if (!xirsysResponse.ok || !data || !data.v || !data.v.iceServers) {
      console.error("Failed to retrieve ICE servers from Xirsys:", data);
      // Fallback to Google STUN servers on Xirsys failure
      return [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ];
    }

    console.log(`Successfully retrieved ${data.v.iceServers.length} ICE servers from Xirsys.`);
    // Xirsys format is already compatible, but ensure it's an array of RTCIceServer-like objects
    const iceServers = data.v.iceServers.map((server: any) => ({
      urls: server.urls,
      username: server.username,
      credential: server.credential,
    }));

    return iceServers;

  } catch (error) {
    console.error("Error fetching ICE servers:", error);
    // Fallback to Google STUN servers on any error
    return [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ];
  }
}

export async function POST(request: NextRequest) {
  const auth = getAuth(request);

  if (!auth.userId) {
    return NextResponse.json({ code: "AUTH_INVALID", message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validatedData = CreateSessionSchema.parse(body);

    // TODO: Implement credit check here (403 Forbidden: Insufficient credits)
    // For now, assume sufficient credits.

    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3600 * 1000); // 1 hour expiry

    const sessionData = {
      sessionId,
      userId: auth.userId,
      jobTitle: validatedData.jobTitle,
      resumeContext: validatedData.resumeContext,
      interviewType: validatedData.interviewType,
      preferences: validatedData.preferences,
      status: "initializing",
      startedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      messageCount: 0,
      lastActivity: now.toISOString(),
      // Additional fields as needed
    };

    const sessionSet = await setSession(sessionId, sessionData);
    if (!sessionSet) {
      throw new Error("Failed to store session data.");
    }

    const iceServers = await getIceServers();

    // Construct the websocketUrl based on the request's host
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'wss' : 'ws';
    const websocketUrl = `${protocol}://${host}/api/webrtc-exchange/${sessionId}`;

    return NextResponse.json({
      sessionId,
      status: "initializing",
      iceServers,
      websocketUrl,
      expiresAt: expiresAt.toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error("Error creating session:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        code: "INVALID_REQUEST_DATA",
        message: "Invalid request data",
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      code: "INTERNAL_ERROR",
      message: "Failed to create interview session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
