import { NextResponse, NextRequest } from "next/server"
import { getAuth } from "@clerk/nextjs/server"
import { connectionPoolMonitor } from "@/lib/db-connection-monitor"
import { prisma } from "@/lib/prisma"

/**
 * Diagnostic endpoint to check database connection pool health
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const auth = getAuth(request);
    if (!auth.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user is admin (optional - you can remove this if needed for debugging)
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { role: true }
    });
    
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    
    // Update and get current metrics
    await connectionPoolMonitor.updateMetrics();
    const currentMetrics = connectionPoolMonitor.getCurrentMetrics();
    const utilizationPercentage = connectionPoolMonitor.getUtilization();
    const isHealthy = connectionPoolMonitor.isPoolHealthy();
    const recommendations = connectionPoolMonitor.getRecommendations();
    const history = connectionPoolMonitor.getMetricsHistory().slice(-10); // Last 10 readings
    
    // Get current connection info from database
    const connectionInfo = await prisma.$queryRaw<Array<{
      pid: number;
      usename: string;
      application_name: string;
      client_addr: string;
      state: string;
      query_start: Date | null;
      state_change: Date;
      wait_event_type: string | null;
      wait_event: string | null;
    }>>`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        state,
        query_start,
        state_change,
        wait_event_type,
        wait_event
      FROM pg_stat_activity
      WHERE datname = current_database()
      AND pid <> pg_backend_pid()
      ORDER BY state_change DESC
      LIMIT 25
    `;
    
    // Get database size info
    const dbSize = await prisma.$queryRaw<Array<{
      database_size: string;
    }>>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
    `;
    
    // Calculate connection age
    const now = new Date();
    const connectionDetails = connectionInfo.map(conn => ({
      ...conn,
      age_seconds: conn.state_change ? Math.floor((now.getTime() - new Date(conn.state_change).getTime()) / 1000) : 0,
      query_duration_ms: conn.query_start ? Math.floor((now.getTime() - new Date(conn.query_start).getTime())) : null
    }));
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'warning',
      metrics: {
        current: currentMetrics,
        utilization: `${utilizationPercentage}%`,
        health: isHealthy ? '✅ HEALTHY' : '⚠️ WARNING'
      },
      recommendations,
      connectionDetails: connectionDetails.map(conn => ({
        pid: conn.pid,
        user: conn.usename,
        app: conn.application_name,
        client: conn.client_addr,
        state: conn.state,
        age_seconds: conn.age_seconds,
        query_duration_ms: conn.query_duration_ms,
        wait_event: conn.wait_event
      })),
      database: {
        size: dbSize[0].database_size,
        poolConfiguration: {
          size: currentMetrics.poolSize,
          timeout: '20s',
          statementTimeout: '30s'
        }
      },
      history: history.map(h => ({
        time: h.lastChecked,
        active: h.activeConnections,
        idle: h.idleConnections,
        total: h.totalConnections,
        utilization: Math.round((h.activeConnections / h.poolSize) * 100)
      }))
    });
    
  } catch (error) {
    console.error('[ConnectionPoolDiagnostic] Error:', error);
    return NextResponse.json({ 
      error: "Failed to get connection pool metrics",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}