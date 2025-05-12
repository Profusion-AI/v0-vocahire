/**
 * This script lists all API routes in the application.
 * Run with: npx ts-node scripts/list-api-routes.ts
 */

import fs from "fs"
import path from "path"

const API_DIR = path.join(process.cwd(), "app/api")

function findApiRoutes(dir: string, basePath = "/api"): string[] {
  const routes: string[] = []

  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      // Skip node_modules and .next
      if (item.name === "node_modules" || item.name === ".next") continue

      // If this is a route group (in brackets), don't include in path
      const nextBasePath = item.name.startsWith("(") && item.name.endsWith(")") ? basePath : `${basePath}/${item.name}`

      routes.push(...findApiRoutes(fullPath, nextBasePath))
    } else if (item.name === "route.ts" || item.name === "route.js") {
      routes.push(basePath)
    }
  }

  return routes
}

try {
  console.log("Scanning for API routes...")
  const routes = findApiRoutes(API_DIR)

  console.log("\nFound API routes:")
  routes.forEach((route) => {
    console.log(`- ${route}`)
  })

  console.log(`\nTotal: ${routes.length} API routes`)
} catch (error) {
  console.error("Error scanning API routes:", error)
}
