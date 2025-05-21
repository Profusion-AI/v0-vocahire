import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export const dynamic = "force-dynamic";

// Test API route for Sentry integration
export async function GET(request: NextRequest) {
  try {
    // Capture some context
    Sentry.setTag("test_endpoint", "sentry_verification");
    Sentry.setContext("request_info", {
      url: request.url,
      method: "GET",
      userAgent: request.headers.get("user-agent"),
    });

    // Test different types of errors
    const testType = request.nextUrl.searchParams.get("type") || "error";

    switch (testType) {
      case "error":
        throw new Error("Test error from API route - Sentry integration verification");
      
      case "warning":
        Sentry.captureMessage("Test warning message for Sentry verification", "warning");
        return NextResponse.json({ 
          message: "Warning captured successfully", 
          timestamp: new Date().toISOString() 
        });
      
      case "info":
        Sentry.captureMessage("Test info message for Sentry verification", "info");
        return NextResponse.json({ 
          message: "Info captured successfully", 
          timestamp: new Date().toISOString() 
        });
      
      case "transaction":
        // Start a transaction for performance monitoring
        return await Sentry.startSpan({
          name: "test_api_transaction",
          op: "http.server",
        }, async (span) => {
          // Simulate some work with a child span
          return await Sentry.startSpan({
            name: "test.processing",
            parentSpan: span,
          }, async () => {
            // Simulate async work
            await new Promise(resolve => setTimeout(resolve, 100));
            
            return NextResponse.json({ 
              message: "Transaction test completed", 
              timestamp: new Date().toISOString() 
            });
          });
        });
      
      default:
        return NextResponse.json({ 
          message: "Test API working - no error triggered",
          availableTypes: ["error", "warning", "info", "transaction"],
          usage: "Add ?type=error to trigger an error"
        });
    }
  } catch (error) {
    // This error will be captured by Sentry automatically
    // but we can add additional context
    Sentry.setContext("error_details", {
      endpoint: "/api/test-sentry",
      testType: request.nextUrl.searchParams.get("type"),
    });

    // Re-throw to let Sentry handle it
    throw error;
  }
}