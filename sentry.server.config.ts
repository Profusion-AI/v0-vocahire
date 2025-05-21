// This file configures the initialization of Sentry for edge features (middleware, edge API routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://8309a1941060aec59087303183e2873d@o4509363453820928.ingest.us.sentry.io/4509363455000576",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Send default PII (personally identifiable information)
  sendDefaultPii: false,

  // Debugging options for development
  debug: process.env.NODE_ENV === 'development',
});