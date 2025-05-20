#!/usr/bin/env node

/**
 * Script to help you add Vercel's IP ranges to Supabase allowlist
 */

console.log("=== SUPABASE IP ALLOWLIST CONFIGURATION FOR VERCEL ===");
console.log("");
console.log("The error 'Can't reach database server at db.ajaozgjepudbdqxkcuie.supabase.co:5432'");
console.log("often occurs when Vercel's deployment IP addresses are not in your Supabase allowlist.");
console.log("");
console.log("Steps to fix this issue:");
console.log("");
console.log("1. Log in to your Supabase dashboard: https://supabase.com/dashboard");
console.log("");
console.log("2. Select your project");
console.log("");
console.log("3. Go to Project Settings > Database");
console.log("");
console.log("4. Find the 'Connection Pooling' section");
console.log("");
console.log("5. Add the following Vercel IP ranges to your allowlist:");
console.log("   (NOTE: These are the current Vercel IP ranges as of May 2025)");
console.log("");
console.log("   76.76.21.0/24");
console.log("   151.115.16.0/22");
console.log("   76.76.16.0/20");
console.log("");
console.log("6. If you're testing from a specific IP address, add that IP as well");
console.log("");
console.log("7. Save your changes and wait a few minutes for them to propagate");
console.log("");
console.log("For the most up-to-date Vercel IP ranges, check:");
console.log("https://vercel.com/guides/how-to-allowlist-deployment-ip-address");
console.log("");
console.log("ALTERNATIVE: Disable IP allowlisting entirely (less secure, only for testing)");
console.log("1. In your Supabase dashboard, go to Project Settings > Database");
console.log("2. Find 'Connection Pooling' settings");
console.log("3. Toggle 'Disable IP Allowlisting'");
console.log("4. Save changes");
console.log("");
console.log("IMPORTANT: For a production deployment, it's more secure to");
console.log("specify the exact IP ranges instead of disabling allowlisting entirely.");