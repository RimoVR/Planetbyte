/**
 * DeltaCompression - Advanced delta compression for network updates
 * 
 * This class provides optimized delta compression for game state updates,
 * reducing network bandwidth usage by only sending state changes.
 */

import { MetricsCollector, MetricType } from '../metrics/MetricsCollector';

export enum CompressionLevel {
  NONE = 0,       // No compression (full state)
  BASIC = 1,      // Basic delta compression (object differences)
  ADVANCED = 2,   // Advanced delta with type-specific optimizations
  BINARY = 3      // Binary encoding of deltas
}

export interface CompressionOptions {
  level: CompressionLevel;
  includeTypes?: boolean;      // Include type information in deltas
  includeTimestamp?: boolean;  // Include timestamp in deltas
  priorityFields?: string[];   // Fields to always include even if unchanged
  ignoreFields?: string[];     // Fields to exclude from delta calculation
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
  private metricsCollector: MetricsCollector;
  private defaultOptions: CompressionOptions = {
    level: CompressionLevel.BASIC,
    includeTypes: false,
    includeTimestamp: true,
    priorityFields: ['id', 'position'],
    ignoreFields: ['_id', '_rev', 'lastUpdated']
  };

  // Metric names
  private static readonly METRIC_ORIGINAL_SIZE = 'delta.original_size';
  private static readonly METRIC_COMPRESSED_SIZE = 'delta.compressed_size';
  private static readonly METRIC_COMPRESSION_RATIO = 'delta.compression_ratio';
  private static readonly METRIC_PROCESSING_TIME = 'delta.processing_time';

  private constructor() {
    this.metricsCollector = MetricsCollector.getInstance();
    this.registerMetrics();
  }

  /**
   * Get the singleton instance of DeltaCompression
   */
  public static getInstance(): DeltaCompression {
    if (!DeltaCompression.instance) {
      DeltaCompression.instance = new DeltaCompression();
    }
    return DeltaCompression.instance;
  }

  /**
   * Register compression metrics
   */
  private registerMetrics(): void {
    this.metricsCollector.registerMetric({
      name: DeltaCompression.METRIC_ORIGINAL_SIZE,
      type: MetricType.HISTOGRAM,
      description: 'Original size of state before compression (bytes)'
    });

    this.metricsCollector.registerMetric({
      name: DeltaCompression.METRIC_COMPRESSED_SIZE,
      type: MetricType.HISTOGRAM,
      description: 'Compressed size after delta compression (bytes)'
    });

    this.metricsCollector.registerMetric({
      name: DeltaCompression.METRIC_COMPRESSION_RATIO,
      type: MetricType.HISTOGRAM,
      description: 'Compression ratio (higher is better)'
    });

    this.metricsCollector.registerMetric({
      name: DeltaCompression.METRIC_PROCESSING_TIME,
      type: MetricType.TIMER,
      description: 'Time taken to compress state (ms)'
    });
  }

  /**
   * Create a delta update from current and previous states
   * @param currentState Current state object
   * @param previousState Previous state object
   * @param options Compression options
   * @returns Delta update object
   */
  public createDelta(
    currentState: any,
    previousState: any,
    options?: Partial<CompressionOptions>
  ): DeltaUpdate {
    const startTime = performance.now();
    const opts = { ...this.defaultOptions, ...options };
    
    // If no previous state or compression disabled, return full state
    if (!previousState || opts.level === CompressionLevel.NONE) {
      const originalSize = this.calculateSize(currentState);
      
      const stats: CompressionStats = {
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        fieldCount: this.countFields(currentState),
        unchangedFieldCount: 0,
        processingTimeMs: performance.now() - startTime
      };
      
      this.recordMetrics(stats);
      
      return {
        timestamp: opts.includeTimestamp ? Date.now() : undefined,
        delta: currentState,
        stats
      };
    }
    
    // Calculate delta based on compression level
    let delta: any;
    let fieldCount = 0;
    let unchangedFieldCount = 0;
    
    switch (opts.level) {
      case CompressionLevel.BASIC:
        const result = this.calculateBasicDelta(
          currentState, 
          previousState, 
          opts.priorityFields || [], 
          opts.ignoreFields || []
        );
        delta = result.delta;
        fieldCount = result.fieldCount;
        unchangedFieldCount = result.unchangedFieldCount;
        break;
        
      case CompressionLevel.ADVANCED:
        const advResult = this.calculateAdvancedDelta(
          currentState, 
          previousState, 
          opts.priorityFields || [], 
          opts.ignoreFields || []
        );
        delta = advResult.delta;
        fieldCount = advResult.fieldCount;
        unchangedFieldCount = advResult.unchangedFieldCount;
        break;
        
      case CompressionLevel.BINARY:
        // Binary encoding would be implemented here
        // For now, fall back to advanced delta
        const binResult = this.calculateAdvancedDelta(
          currentState, 
          previousState, 
          opts.priorityFields || [], 
          opts.ignoreFields || []
        );
        delta = binResult.delta;
        fieldCount = binResult.fieldCount;
        unchangedFieldCount = binResult.unchangedFieldCount;
        break;
    }
    
    const originalSize = this.calculateSize(currentState);
    const compressedSize = this.calculateSize(delta);
    
    const stats: CompressionStats = {
      originalSize,
      compressedSize,
      compressionRatio: originalSize > 0 ? originalSize / compressedSize : 1,
      fieldCount,
      unchangedFieldCount,
      processingTimeMs: performance.now() - startTime
    };
    
    this.recordMetrics(stats);
    
    return {
      timestamp: opts.includeTimestamp ? Date.now() : undefined,
      delta,
      stats
    };
  }

  /**
   * Apply a delta update to a state object
   * @param state Current state object
   * @param deltaUpdate Delta update to apply
   * @returns Updated state object
   */
  public applyDelta(state: any, deltaUpdate: DeltaUpdate): any {
    if (!deltaUpdate || !deltaUpdate.delta) {
      return state;
    }
    
    return this.applyDeltaRecursive(state, deltaUpdate.delta);
  }

  /**
   * Calculate basic delta between current and previous states
   * @param current Current state object
   * @param previous Previous state object
   * @param priorityFields Fields to always include
   * @param ignoreFields Fields to ignore
   * @returns Delta object and statistics
   */
  private calculateBasicDelta(
    current: any,
    previous: any,
    priorityFields: string[],
    ignoreFields: string[]
  ): { delta: any; fieldCount: number; unchangedFieldCount: number } {
    if (typeof current !== 'object' || current === null) {
      return {
        delta: current,
        fieldCount: 1,
        unchangedFieldCount: current === previous ? 1 : 0
      };
    }
    
    const delta: any = {};
    let fieldCount = 0;
    let unchangedFieldCount = 0;
    
    // Handle arrays
    if (Array.isArray(current)) {
      // For arrays, if length changed or previous is not an array, send the whole array
      if (!Array.isArray(previous) || current.length !== previous.length) {
        return {
          delta: current,
          fieldCount: current.length,
          unchangedFieldCount: 0
        };
      }
      
      // Otherwise, check each element
      const arrayDelta: any[] = [];
      let hasChanges = false;
      
      for (let i = 0; i < current.length; i++) {
        const elementResult = this.calculateBasicDelta(
          current[i],
          previous[i],
          priorityFields,
          ignoreFields
        );
        
        fieldCount += elementResult.fieldCount;
        unchangedFieldCount += elementResult.unchangedFieldCount;
        
        if (elementResult.delta !== undefined && 
            JSON.stringify(elementResult.delta) !== JSON.stringify(previous[i])) {
          hasChanges = true;
        }
        
        arrayDelta[i] = elementResult.delta;
      }
      
      return {
        delta: hasChanges ? arrayDelta : undefined,
        fieldCount,
        unchangedFieldCount
      };
    }
    
    // Handle objects
    Object.keys(current).forEach(key => {
      // Skip ignored fields
      if (ignoreFields.includes(key)) {
        return;
      }
      
      fieldCount++;
      
      // Always include priority fields
      if (priorityFields.includes(key)) {
        delta[key] = current[key];
        if (JSON.stringify(current[key]) === JSON.stringify(previous?.[key])) {
          unchangedFieldCount++;
        }
        return;
      }
      
      // If field doesn't exist in previous or is a different type, include it
      if (!previous || previous[key] === undefined || 
          typeof current[key] !== typeof previous[key]) {
        delta[key] = current[key];
        return;
      }
      
      // If field is an object, recurse
      if (typeof current[key] === 'object' && current[key] !== null) {
        const nestedResult = this.calculateBasicDelta(
          current[key],
          previous[key],
          priorityFields,
          ignoreFields
        );
        
        fieldCount += nestedResult.fieldCount - 1; // -1 to avoid double counting this field
        unchangedFieldCount += nestedResult.unchangedFieldCount;
        
        if (nestedResult.delta !== undefined) {
          delta[key] = nestedResult.delta;
        }
      } 
      // Otherwise, include if different
      else if (current[key] !== previous[key]) {
        delta[key] = current[key];
      } else {
        unchangedFieldCount++;
      }
    });
    
    return {
      delta: Object.keys(delta).length > 0 ? delta : undefined,
      fieldCount,
      unchangedFieldCount
    };
  }

  /**
   * Calculate advanced delta with type-specific optimizations
   * @param current Current state object
   * @param previous Previous state object
   * @param priorityFields Fields to always include
   * @param ignoreFields Fields to ignore
   * @returns Delta object and statistics
   */
  private calculateAdvancedDelta(
    current: any,
    previous: any,
    priorityFields: string[],
    ignoreFields: string[]
  ): { delta: any; fieldCount: number; unchangedFieldCount: number } {
    // Start with basic delta
    const basicResult = this.calculateBasicDelta(
      current,
      previous,
      priorityFields,
      ignoreFields
    );
    
    // If no delta or not an object, return basic result
    if (!basicResult.delta || typeof basicResult.delta !== 'object' || basicResult.delta === null) {
      return basicResult;
    }
    
    // Apply type-specific optimizations
    const optimizedDelta = this.applyTypeSpecificOptimizations(
      basicResult.delta,
      current,
      previous
    );
    
    return {
      delta: optimizedDelta,
      fieldCount: basicResult.fieldCount,
      unchangedFieldCount: basicResult.unchangedFieldCount
    };
  }

  /**
   * Apply type-specific optimizations to delta
   * @param delta Basic delta object
   * @param current Current state object
   * @param previous Previous state object
   * @returns Optimized delta object
   */
  private applyTypeSpecificOptimizations(
    delta: any,
    current: any,
    previous: any
  ): any {
    // If delta is not an object or is null, return as is
    if (typeof delta !== 'object' || delta === null) {
      return delta;
    }
    
    // Handle arrays
    if (Array.isArray(delta)) {
      return delta;
    }
    
    const optimizedDelta: any = { ...delta };
    
    // Optimize position updates (common in games)
    if (delta.position && typeof delta.position === 'object' && 
        previous?.position && typeof previous.position === 'object') {
      
      // If only small changes in position, send relative movement
      const dx = current.position.x - previous.position.x;
      const dy = current.position.y - previous.position.y;
      
      // If changes are small, use relative positioning
      if (Math.abs(dx) < 100 && Math.abs(dy) < 100) {
        optimizedDelta.position = { dx, dy, _rel: true };
      }
    }
    
    // Optimize rotation updates (common in games)
    if (delta.rotation !== undefined && previous?.rotation !== undefined) {
      // If rotation change is small, send relative rotation
      const rotDiff = current.rotation - previous.rotation;
      
      // Normalize to -PI to PI
      const normalizedDiff = ((rotDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
      
      if (Math.abs(normalizedDiff) < 0.5) {
        optimizedDelta.rotation = { dr: normalizedDiff, _rel: true };
      }
    }
    
    // Recursively apply optimizations to nested objects
    Object.keys(optimizedDelta).forEach(key => {
      if (typeof optimizedDelta[key] === 'object' && optimizedDelta[key] !== null) {
        optimizedDelta[key] = this.applyTypeSpecificOptimizations(
          optimizedDelta[key],
          current[key],
          previous?.[key]
        );
      }
    });
    
    return optimizedDelta;
  }

  /**
   * Apply delta recursively to a state object
   * @param state Current state object
   * @param delta Delta to apply
   * @returns Updated state object
   */
  private applyDeltaRecursive(state: any, delta: any): any {
    // If delta is null or undefined, return state unchanged
    if (delta === null || delta === undefined) {
      return state;
    }
    
    // If state is null/undefined or delta is a primitive, replace state with delta
    if (state === null || state === undefined || 
        typeof delta !== 'object' || typeof state !== 'object') {
      return delta;
    }
    
    // Handle arrays
    if (Array.isArray(delta)) {
      // If state is not an array or lengths differ, replace with delta
      if (!Array.isArray(state) || state.length !== delta.length) {
        return [...delta];
      }
      
      // Update each element
      const result = [...state];
      for (let i = 0; i < delta.length; i++) {
        if (delta[i] !== undefined) {
          result[i] = this.applyDeltaRecursive(state[i], delta[i]);
        }
      }
      
      return result;
    }
    
    // Handle objects
    const result = { ...state };
    
    Object.keys(delta).forEach(key => {
      // Handle relative position updates
      if (key === 'position' && delta[key]?._rel === true) {
        result[key] = {
          x: (state[key]?.x || 0) + (delta[key].dx || 0),
          y: (state[key]?.y || 0) + (delta[key].dy || 0)
        };
      }
      // Handle relative rotation updates
      else if (key === 'rotation' && delta[key]?._rel === true) {
        result[key] = (state[key] || 0) + (delta[key].dr || 0);
      }
      // Handle nested objects
      else if (typeof delta[key] === 'object' && delta[key] !== null && 
               typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.applyDeltaRecursive(result[key], delta[key]);
      }
      // Otherwise, replace with delta value
      else {
        result[key] = delta[key];
      }
    });
    
    return result;
  }

  /**
   * Calculate approximate size of an object in bytes
   * @param obj Object to measure
   * @returns Approximate size in bytes
   */
  private calculateSize(obj: any): number {
    if (obj === undefined) {
      return 0;
    }
    
    const jsonString = JSON.stringify(obj);
    return jsonString.length * 2; // Approximate UTF-16 encoding
  }

  /**
   * Count fields in an object recursively
   * @param obj Object to count fields in
   * @returns Number of fields
   */
  private countFields(obj: any): number {
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return 1;
    }
    
    if (Array.isArray(obj)) {
      return obj.reduce((count, item) => count + this.countFields(item), 0);
    }
    
    return Object.keys(obj).reduce((count, key) => {
      return count + this.countFields(obj[key]);
    }, 0);
  }

  /**
   * Record compression metrics
   * @param stats Compression statistics
   */
  private recordMetrics(stats: CompressionStats): void {
    this.metricsCollector.recordHistogram(
      DeltaCompression.METRIC_ORIGINAL_SIZE,
      stats.originalSize
    );
    
    this.metricsCollector.recordHistogram(
      DeltaCompression.METRIC_COMPRESSED_SIZE,
      stats.compressedSize
    );
    
    this.metricsCollector.recordHistogram(
      DeltaCompression.METRIC_COMPRESSION_RATIO,
      stats.compressionRatio
    );
    
    // Record processing time (convert to milliseconds)
    this.metricsCollector.recordHistogram(
      DeltaCompression.METRIC_PROCESSING_TIME,
      stats.processingTimeMs
    );
  }
}