// This file configures the initialization of Sentry on the browser side.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://8309a1941060aec59087303183e2873d@o4509363453820928.ingest.us.sentry.io/4509363455000576",

  // Add Session Replay integration for user session recording
  integrations: [
    Sentry.replayIntegration(),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Send default PII (personally identifiable information)
  sendDefaultPii: false,

  // Debugging options for development
  debug: process.env.NODE_ENV === 'development',
});