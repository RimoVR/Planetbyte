/**
 * InterestMetrics - Specialized metrics collection for the interest management system
 * 
 * This class extends the base MetricsCollector functionality with specific metrics
 * related to the interest management system, including entity filtering efficiency,
 * network bandwidth usage, and processing time.
 */

import { MetricsCollector, MetricType } from './MetricsCollector';

export class InterestMetrics {
  private static instance: InterestMetrics;
  private metricsCollector: MetricsCollector;
  
  // Metric names
  private static readonly METRIC_ENTITY_COUNT_BEFORE = 'interest.entity_count.before';
  private static readonly METRIC_ENTITY_COUNT_AFTER = 'interest.entity_count.after';
  private static readonly METRIC_FILTERING_RATIO = 'interest.filtering_ratio';
  private static readonly METRIC_PROCESSING_TIME = 'interest.processing_time';
  private static readonly METRIC_GRID_CELL_DENSITY = 'interest.grid_cell.density';
  private static readonly METRIC_BYTES_SENT = 'interest.network.bytes_sent';
  private static readonly METRIC_BYTES_SAVED = 'interest.network.bytes_saved';
  private static readonly METRIC_UPDATE_FREQUENCY = 'interest.network.update_frequency';
  private static readonly METRIC_MEMORY_USAGE = 'interest.memory_usage';

  private constructor() {
    this.metricsCollector = MetricsCollector.getInstance();
    this.registerMetrics();
  }

  /**
   * Get the singleton instance of InterestMetrics
   */
  public static getInstance(): InterestMetrics {
    if (!InterestMetrics.instance) {
      InterestMetrics.instance = new InterestMetrics();
    }
    return InterestMetrics.instance;
  }

  /**
   * Register all interest management metrics
   */
  private registerMetrics(): void {
    // Entity filtering metrics
    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_ENTITY_COUNT_BEFORE,
      type: MetricType.GAUGE,
      description: 'Number of entities before interest filtering'
    });

    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_ENTITY_COUNT_AFTER,
      type: MetricType.GAUGE,
      description: 'Number of entities after interest filtering'
    });

    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_FILTERING_RATIO,
      type: MetricType.GAUGE,
      description: 'Ratio of entities filtered out (higher is better)'
    });

    // Performance metrics
    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_PROCESSING_TIME,
      type: MetricType.TIMER,
      description: 'Time taken to process interest management calculations'
    });

    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_GRID_CELL_DENSITY,
      type: MetricType.HISTOGRAM,
      description: 'Number of entities per grid cell'
    });

    // Network metrics
    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_BYTES_SENT,
      type: MetricType.HISTOGRAM,
      description: 'Bytes sent per client update'
    });

    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_BYTES_SAVED,
      type: MetricType.COUNTER,
      description: 'Cumulative bytes saved by interest filtering'
    });

    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_UPDATE_FREQUENCY,
      type: MetricType.HISTOGRAM,
      description: 'Updates sent per second to each client'
    });

    // Resource usage metrics
    this.metricsCollector.registerMetric({
      name: InterestMetrics.METRIC_MEMORY_USAGE,
      type: MetricType.GAUGE,
      description: 'Memory usage of the interest management system'
    });
  }

  /**
   * Record entity counts before and after filtering
   * @param beforeCount Number of entities before filtering
   * @param afterCount Number of entities after filtering
   */
  public recordEntityCounts(beforeCount: number, afterCount: number): void {
    this.metricsCollector.setGauge(InterestMetrics.METRIC_ENTITY_COUNT_BEFORE, beforeCount);
    this.metricsCollector.setGauge(InterestMetrics.METRIC_ENTITY_COUNT_AFTER, afterCount);
    
    // Calculate and record filtering ratio
    const filteringRatio = beforeCount > 0 ? (beforeCount - afterCount) / beforeCount : 0;
    this.metricsCollector.setGauge(InterestMetrics.METRIC_FILTERING_RATIO, filteringRatio);
  }

  /**
   * Start timing the interest management processing
   */
  public startProcessingTimer(): void {
    this.metricsCollector.startTimer(InterestMetrics.METRIC_PROCESSING_TIME);
  }

  /**
   * Stop timing the interest management processing and record the elapsed time
   * @returns Elapsed time in milliseconds
   */
  public stopProcessingTimer(): number {
    return this.metricsCollector.stopTimer(InterestMetrics.METRIC_PROCESSING_TIME);
  }

  /**
   * Record the number of entities in a grid cell
   * @param cellId Identifier for the grid cell
   * @param entityCount Number of entities in the cell
   */
  public recordGridCellDensity(entityCount: number): void {
    this.metricsCollector.recordHistogram(InterestMetrics.METRIC_GRID_CELL_DENSITY, entityCount);
  }

  /**
   * Record bytes sent to a client
   * @param bytesSent Number of bytes sent
   * @param bytesSaved Number of bytes saved by filtering (compared to sending full state)
   */
  public recordNetworkUsage(bytesSent: number, bytesSaved: number): void {
    this.metricsCollector.recordHistogram(InterestMetrics.METRIC_BYTES_SENT, bytesSent);
    this.metricsCollector.incrementCounter(InterestMetrics.METRIC_BYTES_SAVED, bytesSaved);
  }

  /**
   * Record update frequency for a client
   * @param updatesPerSecond Number of updates sent per second
   */
  public recordUpdateFrequency(updatesPerSecond: number): void {
    this.metricsCollector.recordHistogram(InterestMetrics.METRIC_UPDATE_FREQUENCY, updatesPerSecond);
  }

  /**
   * Record memory usage of the interest management system
   * @param memoryUsageBytes Memory usage in bytes
   */
  public recordMemoryUsage(memoryUsageBytes: number): void {
    this.metricsCollector.setGauge(InterestMetrics.METRIC_MEMORY_USAGE, memoryUsageBytes);
  }

  /**
   * Get a snapshot of all interest management metrics
   * @returns Object containing all interest management metrics
   */
  public getMetricsSnapshot(): Record<string, any> {
    const snapshot = this.metricsCollector.getSnapshot();
    
    // Filter to only include interest management metrics
    const interestMetrics: Record<string, any> = {};
    Object.keys(snapshot.metrics).forEach(key => {
      if (key.startsWith('interest.')) {
        interestMetrics[key] = snapshot.metrics[key];
      }
    });
    
    return {
      timestamp: snapshot.timestamp,
      metrics: interestMetrics
    };
  }
}