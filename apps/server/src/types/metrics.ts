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

/**
 * Interface for grid cell size metrics
 */
export interface GridSizeMetrics {
  cellCount: number;
  minSize: number;
  maxSize: number;
  avgSize: number;
  resizeCount: number;
}

/**
 * Interface for density metrics
 */
export interface DensityMetrics {
  totalEntities: number;
  cellCount: number;
  avgDensity: number;
  maxDensity: number;
  minDensity: number;
  hotspotCount: number;
  coldspotCount: number;
}

// Interest metrics implementation
export class InterestMetrics {
  private static instance: InterestMetrics;
  
  // Tracking for grid cell metrics
  private gridSizeHistory: GridSizeMetrics[] = [];
  private densityHistory: DensityMetrics[] = [];
  private resizeCount: number = 0;
  private totalNetworkBytesSent: number = 0;
  private totalNetworkBytesSaved: number = 0;
  private lastMetricsLogTime: number = 0;
  private metricsLogInterval: number = 60000; // 1 minute
  
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
    // Only log occasionally to reduce noise
    if (Math.random() < 0.01) { // ~1% of calls
      console.log(`Interest filtering: ${beforeCount} entities before, ${afterCount} after (${Math.round((beforeCount - afterCount) / beforeCount * 100)}% filtered)`);
    }
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
    // Only log occasionally to reduce noise
    if (Math.random() < 0.005) { // ~0.5% of calls
      console.log(`Grid cell density: ${entityCount} entities`);
    }
  }
  
  public recordNetworkUsage(bytesSent: number, bytesSaved: number): void {
    // Accumulate totals
    this.totalNetworkBytesSent += bytesSent;
    this.totalNetworkBytesSaved += bytesSaved;
    
    // Log periodically
    const now = Date.now();
    if (now - this.lastMetricsLogTime >= this.metricsLogInterval) {
      this.lastMetricsLogTime = now;
      
      const totalBytes = this.totalNetworkBytesSent + this.totalNetworkBytesSaved;
      const savingsPercent = totalBytes > 0
        ? (this.totalNetworkBytesSaved / totalBytes * 100).toFixed(2)
        : '0.00';
      
      console.log(`Network usage summary: ${this.formatBytes(this.totalNetworkBytesSent)} sent, ${this.formatBytes(this.totalNetworkBytesSaved)} saved (${savingsPercent}% reduction)`);
    }
  }
  
  public recordUpdateFrequency(updatesPerSecond: number): void {
    console.log(`Update frequency: ${updatesPerSecond.toFixed(2)} updates/second`);
  }
  
  public recordMemoryUsage(memoryUsageBytes: number): void {
    console.log(`Memory usage: ${this.formatBytes(memoryUsageBytes)}`);
  }
  
  /**
   * Records grid cell size metrics.
   *
   * @param metrics Grid size metrics to record
   */
  public recordGridSizeMetrics(metrics: GridSizeMetrics): void {
    this.gridSizeHistory.push(metrics);
    
    // Keep history limited to last 100 entries
    if (this.gridSizeHistory.length > 100) {
      this.gridSizeHistory.shift();
    }
    
    // Log metrics
    console.log(`Grid size metrics: ${metrics.cellCount} cells, sizes: min=${metrics.minSize.toFixed(2)}, max=${metrics.maxSize.toFixed(2)}, avg=${metrics.avgSize.toFixed(2)}, resizes=${metrics.resizeCount}`);
  }
  
  /**
   * Records density metrics.
   *
   * @param metrics Density metrics to record
   */
  public recordDensityMetrics(metrics: DensityMetrics): void {
    this.densityHistory.push(metrics);
    
    // Keep history limited to last 100 entries
    if (this.densityHistory.length > 100) {
      this.densityHistory.shift();
    }
    
    // Log metrics
    console.log(`Density metrics: ${metrics.totalEntities} entities in ${metrics.cellCount} cells, density: min=${metrics.minDensity.toFixed(2)}, max=${metrics.maxDensity.toFixed(2)}, avg=${metrics.avgDensity.toFixed(2)}, hotspots=${metrics.hotspotCount}, coldspots=${metrics.coldspotCount}`);
  }
  
  /**
   * Records a cell resize event.
   */
  public recordCellResize(): void {
    this.resizeCount++;
  }
  
  /**
   * Gets the total number of cell resizes.
   */
  public getResizeCount(): number {
    return this.resizeCount;
  }
  
  /**
   * Gets the grid size history.
   */
  public getGridSizeHistory(): GridSizeMetrics[] {
    return [...this.gridSizeHistory];
  }
  
  /**
   * Gets the density history.
   */
  public getDensityHistory(): DensityMetrics[] {
    return [...this.densityHistory];
  }
  
  /**
   * Sets the metrics log interval.
   *
   * @param interval New interval in milliseconds
   */
  public setMetricsLogInterval(interval: number): void {
    this.metricsLogInterval = interval;
    console.log(`Metrics log interval set to ${interval}ms`);
  }
  
  /**
   * Formats bytes to a human-readable string.
   *
   * @param bytes Number of bytes
   * @returns Formatted string (e.g., "1.23 MB")
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
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
    // Start timer for processing time measurement
    const startTime = Date.now();
    
    // In a real implementation, this would create a delta
    // For now, use the existing compressGameState function
    const delta = this.compressGameState(currentState, previousState);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Calculate compression statistics
    const originalSize = JSON.stringify(currentState).length;
    const compressedSize = JSON.stringify(delta).length;
    const compressionRatio = originalSize > 0 ? originalSize / compressedSize : 1;
    
    // Count fields
    let fieldCount = 0;
    let unchangedFieldCount = 0;
    
    if (previousState) {
      // Count total fields in current state
      const countFields = (obj: any): number => {
        if (!obj || typeof obj !== 'object') return 0;
        
        let count = 0;
        for (const key in obj) {
          count++;
          if (obj[key] && typeof obj[key] === 'object') {
            count += countFields(obj[key]);
          }
        }
        return count;
      };
      
      fieldCount = countFields(currentState);
      
      // Count unchanged fields (fields in current state not in delta)
      const countUnchangedFields = (curr: any, delta: any): number => {
        if (!curr || typeof curr !== 'object' || !delta || typeof delta !== 'object') return 0;
        
        let count = 0;
        for (const key in curr) {
          if (!(key in delta)) {
            count++;
          } else if (curr[key] && typeof curr[key] === 'object' && delta[key] && typeof delta[key] === 'object') {
            count += countUnchangedFields(curr[key], delta[key]);
          }
        }
        return count;
      };
      
      unchangedFieldCount = countUnchangedFields(currentState, delta);
    }
    
    return {
      timestamp: Date.now(),
      delta,
      stats: {
        originalSize,
        compressedSize,
        compressionRatio,
        fieldCount,
        unchangedFieldCount,
        processingTimeMs: processingTime
      }
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