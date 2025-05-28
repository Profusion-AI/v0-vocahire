import { NextResponse } from "next/server";
import { getSecrets } from '@/lib/secret-manager';

export async function GET(_request: Request) {
  // Fetch secrets within the async handler
  const xirsysSecrets = await getSecrets([
    'XIRSYS_IDENT',
    'XIRSYS_SECRET',
    'XIRSYS_CHANNEL',
  ]);

  const XIRSYS_IDENT = xirsysSecrets.XIRSYS_IDENT;
  const XIRSYS_SECRET = xirsysSecrets.XIRSYS_SECRET;
  const XIRSYS_CHANNEL = xirsysSecrets.XIRSYS_CHANNEL;

  console.log("Xirsys environment check:", {
    identSet: !!XIRSYS_IDENT,
    secretSet: !!XIRSYS_SECRET,
    channelSet: !!XIRSYS_CHANNEL, // Log if the specific env var is set
  });

  if (!XIRSYS_IDENT || !XIRSYS_SECRET || !XIRSYS_CHANNEL) { // Make XIRSYS_CHANNEL mandatory
    console.error(
      "Xirsys credentials or channel not fully configured. XIRSYS_IDENT, XIRSYS_SECRET, and XIRSYS_CHANNEL must be set."
    );
    // Fallback to public STUN if Xirsys isn't configured.
    // This is a design choice; alternatively, you could return an error.
    return NextResponse.json({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
      source: "fallback_due_to_missing_xirsys_config", // Be specific about why fallback
    });
  }

  try {
    console.log(`Attempting to fetch Xirsys ICE servers for channel: ${XIRSYS_CHANNEL}...`);

    const xirsysUrl = `https://global.xirsys.net/_turn/${XIRSYS_CHANNEL}`;

    const xirsysResponse = await fetch(xirsysUrl, {
      method: "PUT", // Or "POST" - ensure this matches your Xirsys API version
      headers: {
        "Authorization": "Basic " + Buffer.from(`${XIRSYS_IDENT}:${XIRSYS_SECRET}`).toString("base64"),
        "Content-Type": "application/json",
      },
      // body: JSON.stringify({ format: "urls" }) // Only if required by Xirsys
    });

    if (!xirsysResponse.ok) {
      const errorText = await xirsysResponse.text();
      console.error("Xirsys API error response:", errorText); // Log the full error text
      throw new Error(`Xirsys API request failed: ${xirsysResponse.status} - ${errorText.substring(0, 200)}`);
    }

    const data = await xirsysResponse.json();
    // console.log("Raw Xirsys response:", JSON.stringify(data)); // For deep debugging

    if (data && data.v && data.v.iceServers) {
      console.log(`Successfully retrieved ${data.v.iceServers.length} raw ICE servers from Xirsys.`);

      // Process servers to ensure UDP and TCP variants for TURN
      const processedServers = data.v.iceServers.flatMap((server: any) => { // Use flatMap for cleaner array generation
        const baseUrls = Array.isArray(server.urls) ? server.urls : [server.urls];
        const newServerConfigs: RTCIceServer[] = [];

        baseUrls.forEach((baseUrl: string) => {
          if (typeof baseUrl === 'string' && baseUrl.toLowerCase().startsWith("turn:")) {
            if (!baseUrl.includes("?transport=")) {
              // If no transport specified, Xirsys usually means UDP. Provide both.
              newServerConfigs.push({ ...server, urls: baseUrl }); // Default (UDP)
              newServerConfigs.push({ ...server, urls: `${baseUrl}?transport=tcp` }); // TCP version
            } else {
              // If transport is specified, keep it as is
              newServerConfigs.push({ ...server, urls: baseUrl });
            }
          } else {
            // For STUN or other types, or if TURN already has transport
            newServerConfigs.push({ ...server, urls: baseUrl });
          }
        });
        // If the original server object had multiple URLs and some were STUN,
        // this flatMap approach might duplicate STUN entries if not careful.
        // A more robust way if Xirsys returns mixed STUN/TURN in one server object:
        if (newServerConfigs.length > 0) return newServerConfigs;
        return [server]; // Fallback to original if no processing happened
      }).filter(
        (server: RTCIceServer, index: number, self: RTCIceServer[]) =>
          index === self.findIndex((s) => JSON.stringify(s.urls) === JSON.stringify(server.urls)),
      )


      console.log(`Processed ${processedServers.length} ICE server configurations (with UDP/TCP variants).`);

      // --- REMOVED THE AGGRESSIVE FILTERING BLOCK ---
      // Client-side logic is better for dynamically blacklisting servers that fail during a session.
      // The backend should provide all candidates Xirsys offers.
      // If you have *strong, universal evidence* a specific Xirsys server/port/transport is *always* bad,
      // you could add a very targeted filter here, but be cautious.
      // Example of a very mild, less risky filter (if needed):
      // const finalServers = processedServers.filter(server => {
      //   const urls = Array.isArray(server.urls) ? server.urls : [server.urls];
      //   return !urls.some(url => url.includes(":80?transport=tcp")); // Only if :80 TCP is truly problematic
      // });
      // For now, let's return all processed servers:
      const finalServers = processedServers;

      console.log(`Returning ${finalServers.length} final ICE server configurations to client.`);

      return NextResponse.json({
        iceServers: finalServers,
        source: "xirsys", // Good to indicate the source
      });
    } else {
      console.error("Unexpected Xirsys response format. Data or v.iceServers missing. Full response:", JSON.stringify(data));
      throw new Error("Unexpected Xirsys response format from server");
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch/process Xirsys ICE servers:", errorMessage);
    // Log the original error if it's not just a string
    if (error instanceof Error && error.cause) console.error("Original cause:", error.cause);


    return NextResponse.json({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
      source: "fallback_due_to_xirsys_error", // Specific fallback reason
      error: errorMessage, // Pass error message for client-side debugging if needed
    });
  }
}
