/**
 * Database Connection Pool Monitoring
 * Tracks connection pool health and provides metrics for debugging
 */

import { prisma } from './prisma';

export interface ConnectionPoolMetrics {
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalConnections: number;
  poolSize: number;
  lastChecked: Date;
}

class ConnectionPoolMonitor {
  private metrics: ConnectionPoolMetrics = {
    activeConnections: 0,
    idleConnections: 0,
    waitingRequests: 0,
    totalConnections: 0,
    poolSize: 25, // Our configured pool size
    lastChecked: new Date(),
  };

  private metricsHistory: ConnectionPoolMetrics[] = [];
  private readonly maxHistorySize = 100;

  /**
   * Update connection pool metrics
   */
  async updateMetrics(): Promise<ConnectionPoolMetrics> {
    try {
      // Query pg_stat_activity to get connection information
      const connections = await prisma.$queryRaw<Array<{
        state: string;
        count: string;
      }>>`
        SELECT state, COUNT(*) as count
        FROM pg_stat_activity
        WHERE datname = current_database()
        AND pid <> pg_backend_pid()
        GROUP BY state
      `;

      // Reset metrics
      this.metrics = {
        activeConnections: 0,
        idleConnections: 0,
        waitingRequests: 0,
        totalConnections: 0,
        poolSize: 25,
        lastChecked: new Date(),
      };

      // Process connection states
      for (const conn of connections) {
        const count = parseInt(conn.count, 10);
        
        if (conn.state === 'active') {
          this.metrics.activeConnections = count;
        } else if (conn.state === 'idle') {
          this.metrics.idleConnections = count;
        } else if (conn.state === 'idle in transaction') {
          this.metrics.activeConnections += count; // Count as active
        }
        
        this.metrics.totalConnections += count;
      }

      // Store in history
      this.metricsHistory.push({ ...this.metrics });
      if (this.metricsHistory.length > this.maxHistorySize) {
        this.metricsHistory.shift();
      }

      return this.metrics;
    } catch (error) {
      console.error('[ConnectionPoolMonitor] Failed to update metrics:', error);
      return this.metrics;
    }
  }

  /**
   * Get current metrics without updating
   */
  getCurrentMetrics(): ConnectionPoolMetrics {
    return { ...this.metrics };
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(): ConnectionPoolMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Check if connection pool is healthy
   */
  isPoolHealthy(): boolean {
    const utilizationRate = this.metrics.activeConnections / this.metrics.poolSize;
    const hasAvailableConnections = this.metrics.idleConnections > 0;
    
    return utilizationRate < 0.8 && hasAvailableConnections;
  }

  /**
   * Get pool utilization percentage
   */
  getUtilization(): number {
    return Math.round((this.metrics.activeConnections / this.metrics.poolSize) * 100);
  }

  /**
   * Log current pool status
   */
  logPoolStatus(): void {
    const utilization = this.getUtilization();
    const health = this.isPoolHealthy() ? '✅ HEALTHY' : '⚠️  WARNING';
    
    console.log(`[ConnectionPool] ${health} - Utilization: ${utilization}%`);
    console.log(`[ConnectionPool] Active: ${this.metrics.activeConnections}/${this.metrics.poolSize}`);
    console.log(`[ConnectionPool] Idle: ${this.metrics.idleConnections}`);
    console.log(`[ConnectionPool] Total: ${this.metrics.totalConnections}`);
  }

  /**
   * Get recommendations based on current metrics
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const utilization = this.getUtilization();

    if (utilization > 80) {
      recommendations.push('Connection pool is near capacity. Consider increasing pool size.');
    }

    if (this.metrics.idleConnections === 0 && utilization > 50) {
      recommendations.push('No idle connections available. May experience connection timeouts.');
    }

    if (this.metrics.totalConnections >= this.metrics.poolSize) {
      recommendations.push('Connection pool is saturated. New requests will wait for available connections.');
    }

    // Check for connection leak patterns
    const recentHistory = this.metricsHistory.slice(-10);
    const increasingActive = recentHistory.every((m, i) => 
      i === 0 || m.activeConnections >= recentHistory[i - 1].activeConnections
    );

    if (increasingActive && recentHistory.length >= 10) {
      recommendations.push('Possible connection leak detected. Active connections continuously increasing.');
    }

    return recommendations;
  }
}

// Export singleton instance
export const connectionPoolMonitor = new ConnectionPoolMonitor();

// Auto-update metrics every 30 seconds in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  setInterval(async () => {
    await connectionPoolMonitor.updateMetrics();
    connectionPoolMonitor.logPoolStatus();
    
    const recommendations = connectionPoolMonitor.getRecommendations();
    if (recommendations.length > 0) {
      console.warn('[ConnectionPool] Recommendations:', recommendations);
    }
  }, 30000);
}