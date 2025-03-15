/**
 * MetricsCollector - Performance metrics collection system
 * 
 * This class provides a centralized way to collect, aggregate, and analyze
 * performance metrics throughout the application. It supports various metric
 * types including counters, gauges, histograms, and timers.
 */

export enum MetricType {
  COUNTER = 'counter',   // Monotonically increasing value (e.g., request count)
  GAUGE = 'gauge',       // Value that can go up and down (e.g., memory usage)
  HISTOGRAM = 'histogram', // Distribution of values (e.g., response times)
  TIMER = 'timer'        // Specialized histogram for timing operations
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
  p50: number;  // 50th percentile (median)
  p90: number;  // 90th percentile
  p99: number;  // 99th percentile
}

export interface MetricDefinition {
  name: string;
  type: MetricType;
  description: string;
  tags?: Record<string, string>;
}

export interface MetricsSnapshot {
  timestamp: number;
  metrics: Record<string, MetricValue | HistogramValue>;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  private metrics: Map<string, MetricDefinition> = new Map();
  private values: Map<string, MetricValue[]> = new Map();
  private histogramValues: Map<string, number[]> = new Map();
  private timers: Map<string, number> = new Map();
  private snapshotInterval: number = 10000; // 10 seconds by default
  private maxSamples: number = 100; // Maximum samples to keep per metric
  private intervalId: number | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of MetricsCollector
   */
  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Configure the metrics collector
   * @param options Configuration options
   */
  public configure(options: {
    snapshotInterval?: number;
    maxSamples?: number;
    autoSnapshot?: boolean;
  }): void {
    if (options.snapshotInterval !== undefined) {
      this.snapshotInterval = options.snapshotInterval;
    }
    
    if (options.maxSamples !== undefined) {
      this.maxSamples = options.maxSamples;
    }

    if (options.autoSnapshot && !this.intervalId) {
      this.startAutoSnapshot();
    } else if (!options.autoSnapshot && this.intervalId) {
      this.stopAutoSnapshot();
    }
  }

  /**
   * Register a new metric
   * @param definition Metric definition
   */
  public registerMetric(definition: MetricDefinition): void {
    const { name, type } = definition;
    
    if (this.metrics.has(name)) {
      console.warn(`Metric ${name} already registered. Skipping.`);
      return;
    }
    
    this.metrics.set(name, definition);
    this.values.set(name, []);
    
    if (type === MetricType.HISTOGRAM || type === MetricType.TIMER) {
      this.histogramValues.set(name, []);
    }
  }

  /**
   * Increment a counter metric
   * @param name Metric name
   * @param value Value to increment by (default: 1)
   */
  public incrementCounter(name: string, value: number = 1): void {
    this.validateMetric(name, MetricType.COUNTER);
    
    const values = this.values.get(name) || [];
    const lastValue = values.length > 0 ? values[values.length - 1].value : 0;
    
    this.recordValue(name, lastValue + value);
  }

  /**
   * Set a gauge metric value
   * @param name Metric name
   * @param value Current value
   */
  public setGauge(name: string, value: number): void {
    this.validateMetric(name, MetricType.GAUGE);
    this.recordValue(name, value);
  }

  /**
   * Record a value for a histogram metric
   * @param name Metric name
   * @param value Value to record
   */
  public recordHistogram(name: string, value: number): void {
    this.validateMetric(name, MetricType.HISTOGRAM);
    
    // Record the raw value for histogram calculations
    const histValues = this.histogramValues.get(name) || [];
    histValues.push(value);
    this.histogramValues.set(name, histValues);
    
    // Calculate and record histogram statistics
    this.updateHistogramStats(name);
  }

  /**
   * Start a timer for the specified metric
   * @param name Metric name
   */
  public startTimer(name: string): void {
    this.validateMetric(name, MetricType.TIMER);
    this.timers.set(name, performance.now());
  }

  /**
   * Stop a timer and record the elapsed time
   * @param name Metric name
   * @returns Elapsed time in milliseconds
   */
  public stopTimer(name: string): number {
    this.validateMetric(name, MetricType.TIMER);
    
    const startTime = this.timers.get(name);
    if (startTime === undefined) {
      throw new Error(`Timer ${name} was not started`);
    }
    
    const endTime = performance.now();
    const elapsed = endTime - startTime;
    
    // Record the elapsed time in the histogram
    this.recordHistogram(name, elapsed);
    
    // Clean up the timer
    this.timers.delete(name);
    
    return elapsed;
  }

  /**
   * Get the current value of a metric
   * @param name Metric name
   * @returns Current metric value
   */
  public getCurrentValue(name: string): MetricValue | HistogramValue | undefined {
    const values = this.values.get(name);
    if (!values || values.length === 0) {
      return undefined;
    }
    
    return values[values.length - 1];
  }

  /**
   * Get a snapshot of all current metric values
   * @returns Metrics snapshot
   */
  public getSnapshot(): MetricsSnapshot {
    const snapshot: MetricsSnapshot = {
      timestamp: Date.now(),
      metrics: {}
    };
    
    this.metrics.forEach((definition, name) => {
      const currentValue = this.getCurrentValue(name);
      if (currentValue) {
        snapshot.metrics[name] = currentValue;
      }
    });
    
    return snapshot;
  }

  /**
   * Get historical values for a specific metric
   * @param name Metric name
   * @param limit Maximum number of values to return (default: all)
   * @returns Array of metric values
   */
  public getHistoricalValues(name: string, limit?: number): MetricValue[] | HistogramValue[] {
    const values = this.values.get(name) || [];
    
    if (limit && limit > 0) {
      return values.slice(-limit);
    }
    
    return values;
  }

  /**
   * Start automatic snapshot collection
   */
  public startAutoSnapshot(): void {
    if (this.intervalId) {
      return;
    }
    
    this.intervalId = setInterval(() => {
      this.getSnapshot();
      // In a real implementation, this would send the snapshot to a storage or monitoring system
    }, this.snapshotInterval) as unknown as number;
  }

  /**
   * Stop automatic snapshot collection
   */
  public stopAutoSnapshot(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Reset all metrics
   */
  public reset(): void {
    this.values.clear();
    this.histogramValues.clear();
    this.timers.clear();
    
    // Re-initialize empty arrays for each metric
    this.metrics.forEach((definition, name) => {
      this.values.set(name, []);
      
      if (definition.type === MetricType.HISTOGRAM || definition.type === MetricType.TIMER) {
        this.histogramValues.set(name, []);
      }
    });
  }

  /**
   * Validate that a metric exists and is of the expected type
   * @param name Metric name
   * @param expectedType Expected metric type
   */
  private validateMetric(name: string, expectedType: MetricType): void {
    const metric = this.metrics.get(name);
    
    if (!metric) {
      throw new Error(`Metric ${name} not registered`);
    }
    
    if (metric.type !== expectedType) {
      throw new Error(`Metric ${name} is of type ${metric.type}, expected ${expectedType}`);
    }
  }

  /**
   * Record a value for a metric
   * @param name Metric name
   * @param value Value to record
   */
  private recordValue(name: string, value: number): void {
    const values = this.values.get(name) || [];
    
    // Add the new value
    values.push({
      value,
      timestamp: Date.now()
    });
    
    // Trim to max samples
    if (values.length > this.maxSamples) {
      values.shift();
    }
    
    this.values.set(name, values);
  }

  /**
   * Update histogram statistics
   * @param name Metric name
   */
  private updateHistogramStats(name: string): void {
    const histValues = this.histogramValues.get(name) || [];
    
    if (histValues.length === 0) {
      return;
    }
    
    // Sort values for percentile calculations
    const sortedValues = [...histValues].sort((a, b) => a - b);
    
    // Calculate statistics
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const sum = sortedValues.reduce((acc, val) => acc + val, 0);
    const count = sortedValues.length;
    const avg = sum / count;
    
    // Calculate percentiles
    const p50 = this.calculatePercentile(sortedValues, 50);
    const p90 = this.calculatePercentile(sortedValues, 90);
    const p99 = this.calculatePercentile(sortedValues, 99);
    
    // Record the histogram value
    const values = this.values.get(name) || [];
    
    values.push({
      value: avg, // Use average as the primary value
      timestamp: Date.now(),
      min,
      max,
      sum,
      count,
      avg,
      p50,
      p90,
      p99
    } as HistogramValue);
    
    // Trim to max samples
    if (values.length > this.maxSamples) {
      values.shift();
    }
    
    this.values.set(name, values);
    
    // Trim raw histogram values if needed
    if (histValues.length > this.maxSamples * 10) {
      this.histogramValues.set(name, histValues.slice(-this.maxSamples * 10));
    }
  }

  /**
   * Calculate a percentile value from sorted data
   * @param sortedValues Sorted array of values
   * @param percentile Percentile to calculate (0-100)
   * @returns Percentile value
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) {
      return 0;
    }
    
    if (sortedValues.length === 1) {
      return sortedValues[0];
    }
    
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (upper >= sortedValues.length) {
      return sortedValues[lower];
    }
    
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }
}