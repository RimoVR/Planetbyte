/**
 * Local implementation of metrics classes for the server
 * This is a temporary solution until the module resolution issues are fixed
 */

// Basic metric types
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer'
}

export interface MetricValue {
  value: number;
  timestamp: number;
}

export interface HistogramValue extends MetricValue {
  min: number;
  max: number;
  sum: number;
  count: number;
  avg: number;
  p50: number;
  p90: number;
  p99: number;
}

// Interest metrics implementation
export class InterestMetrics {
  private static instance: InterestMetrics;
  
  private constructor() {
    // Initialize metrics
    console.log('Initializing InterestMetrics');
  }
  
  public static getInstance(): InterestMetrics {
    if (!InterestMetrics.instance) {
      InterestMetrics.instance = new InterestMetrics();
    }
    return InterestMetrics.instance;
  }
  
  public recordEntityCounts(beforeCount: number, afterCount: number): void {
    console.log(`Interest filtering: ${beforeCount} entities before, ${afterCount} after (${Math.round((beforeCount - afterCount) / beforeCount * 100)}% filtered)`);
  }
  
  public startProcessingTimer(): void {
    // In a real implementation, this would start a timer
    console.time('interest_processing');
  }
  
  public stopProcessingTimer(): number {
    // In a real implementation, this would stop the timer and return elapsed time
    console.timeEnd('interest_processing');
    return 0;
  }
  
  public recordGridCellDensity(entityCount: number): void {
    console.log(`Grid cell density: ${entityCount} entities`);
  }
  
  public recordNetworkUsage(bytesSent: number, bytesSaved: number): void {
    console.log(`Network usage: ${bytesSent} bytes sent, ${bytesSaved} bytes saved`);
  }
  
  public recordUpdateFrequency(updatesPerSecond: number): void {
    console.log(`Update frequency: ${updatesPerSecond} updates/second`);
  }
  
  public recordMemoryUsage(memoryUsageBytes: number): void {
    console.log(`Memory usage: ${Math.round(memoryUsageBytes / 1024 / 1024)} MB`);
  }
}

// Delta compression implementation
export enum CompressionLevel {
  NONE = 0,
  BASIC = 1,
  ADVANCED = 2,
  BINARY = 3
}

export interface CompressionStats {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fieldCount: number;
  unchangedFieldCount: number;
  processingTimeMs: number;
}

export interface DeltaUpdate {
  timestamp?: number;
  delta: any;
  stats?: CompressionStats;
}

export class DeltaCompression {
  private static instance: DeltaCompression;
  
  private constructor() {
    // Initialize compression
    console.log('Initializing DeltaCompression');
  }
  
  public static getInstance(): DeltaCompression {
    if (!DeltaCompression.instance) {
      DeltaCompression.instance = new DeltaCompression();
    }
    return DeltaCompression.instance;
  }
  
  public createDelta(currentState: any, previousState: any, options?: any): DeltaUpdate {
    // In a real implementation, this would create a delta
    // For now, use the existing compressGameState function
    const delta = this.compressGameState(currentState, previousState);
    
    return {
      timestamp: Date.now(),
      delta
    };
  }
  
  public applyDelta(state: any, deltaUpdate: DeltaUpdate): any {
    // In a real implementation, this would apply a delta
    // For now, use the existing applyDeltaUpdate function
    return this.applyDeltaUpdate(state, deltaUpdate.delta);
  }
  
  // Simplified versions of the existing functions
  private compressGameState(currentState: any, previousState: any): any {
    if (!previousState) {
      return currentState;
    }
    
    const delta: any = {};
    
    Object.keys(currentState).forEach(key => {
      if (typeof currentState[key] === 'object' && currentState[key] !== null) {
        const nestedDelta = this.compressGameState(currentState[key], previousState[key]);
        if (Object.keys(nestedDelta).length > 0) {
          delta[key] = nestedDelta;
        }
      } else if (currentState[key] !== previousState[key]) {
        delta[key] = currentState[key];
      }
    });
    
    return delta;
  }
  
  private applyDeltaUpdate(state: any, delta: any): any {
    if (!delta || Object.keys(delta).length === 0) {
      return state;
    }
    
    const newState = { ...state };
    
    Object.keys(delta).forEach(key => {
      if (typeof delta[key] === 'object' && delta[key] !== null && typeof newState[key] === 'object') {
        newState[key] = this.applyDeltaUpdate(newState[key], delta[key]);
      } else {
        newState[key] = delta[key];
      }
    });
    
    return newState;
  }
}