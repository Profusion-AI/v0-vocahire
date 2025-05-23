/**
 * Simple Circuit Breaker pattern to prevent cascading failures
 * Particularly useful for rate limiting and API protection
 */

interface CircuitState {
  failures: number
  lastFailureTime: number
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

class CircuitBreaker {
  private circuits: Map<string, CircuitState> = new Map()
  
  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minute
    private halfOpenRetryTimeout: number = 10000 // 10 seconds
  ) {}

  async execute<T>(
    circuitKey: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    const circuit = this.getCircuit(circuitKey)
    
    // Check if circuit is open
    if (circuit.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - circuit.lastFailureTime
      
      if (timeSinceLastFailure > this.recoveryTimeout) {
        // Try to recover - move to half-open
        circuit.state = 'HALF_OPEN'
        console.log(`[CircuitBreaker] ${circuitKey}: Moving to HALF_OPEN state`)
      } else {
        // Circuit is still open, use fallback or throw
        if (fallback) {
          console.log(`[CircuitBreaker] ${circuitKey}: Circuit OPEN, using fallback`)
          return await fallback()
        }
        throw new Error(`Circuit breaker is OPEN for ${circuitKey}. Try again in ${Math.ceil((this.recoveryTimeout - timeSinceLastFailure) / 1000)} seconds.`)
      }
    }

    try {
      const result = await operation()
      
      // Success - reset circuit if it was half-open
      if (circuit.state === 'HALF_OPEN') {
        this.reset(circuitKey)
        console.log(`[CircuitBreaker] ${circuitKey}: Recovered, moving to CLOSED state`)
      }
      
      return result
    } catch (error) {
      this.recordFailure(circuitKey, error)
      throw error
    }
  }

  private getCircuit(key: string): CircuitState {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, {
        failures: 0,
        lastFailureTime: 0,
        state: 'CLOSED'
      })
    }
    return this.circuits.get(key)!
  }

  private recordFailure(key: string, error: any): void {
    const circuit = this.getCircuit(key)
    circuit.failures++
    circuit.lastFailureTime = Date.now()

    // Check if we should open the circuit
    if (circuit.failures >= this.failureThreshold) {
      circuit.state = 'OPEN'
      console.log(`[CircuitBreaker] ${key}: Circuit OPEN after ${circuit.failures} failures`)
    }

    // Special handling for rate limit errors - open circuit immediately
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('RATE_LIMIT_ERROR')) {
      circuit.state = 'OPEN'
      circuit.failures = this.failureThreshold
      console.log(`[CircuitBreaker] ${key}: Circuit OPEN due to rate limiting`)
    }
  }

  private reset(key: string): void {
    const circuit = this.getCircuit(key)
    circuit.failures = 0
    circuit.state = 'CLOSED'
    circuit.lastFailureTime = 0
  }

  // Get current state for monitoring
  getState(key: string): CircuitState {
    return { ...this.getCircuit(key) }
  }

  // Manual reset for admin purposes
  forceReset(key: string): void {
    this.reset(key)
    console.log(`[CircuitBreaker] ${key}: Manually reset to CLOSED state`)
  }
}

// Global circuit breaker instance
export const circuitBreaker = new CircuitBreaker(
  3, // 3 failures before opening
  300000, // 5 minutes recovery timeout
  30000 // 30 seconds half-open retry timeout
)

// Convenience function for OpenAI operations
export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitKey: string = 'openai-realtime',
  fallback?: () => Promise<T>
): Promise<T> {
  return circuitBreaker.execute(circuitKey, operation, fallback)
}