import { NextResponse } from "next/server"
import { readdirSync } from "fs"
import { join } from "path"

function findApiRoutes(dir: string, basePath = "/api"): string[] {
  const routes: string[] = []

  try {
    const items = readdirSync(dir, { withFileTypes: true })

    for (const item of items) {
      const fullPath = join(dir, item.name)

      if (item.isDirectory()) {
        // If this is a route group (in brackets), don't include in path
        const nextBasePath =
          item.name.startsWith("(") && item.name.endsWith(")") ? basePath : `${basePath}/${item.name}`

        routes.push(...findApiRoutes(fullPath, nextBasePath))
      } else if (item.name === "route.ts" || item.name === "route.js") {
        routes.push(basePath)
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }

  return routes
}

export async function GET() {
  try {
    const apiDir = join(process.cwd(), "app/api")
    const routes = findApiRoutes(apiDir)

    return NextResponse.json({
      routes,
      count: routes.length,
    })
  } catch (error) {
    console.error("Error scanning API routes:", error)
    return NextResponse.json({ error: "Failed to scan API routes" }, { status: 500 })
  }
}
