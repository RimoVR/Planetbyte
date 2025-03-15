/**
 * Metrics collection for the PlanetByte game systems
 */

/**
 * Base metrics collector class
 */
export class MetricsCollector {
  protected static instance: MetricsCollector;
  
  protected counters: Map<string, number> = new Map();
  protected gauges: Map<string, number> = new Map();
  protected histograms: Map<string, number[]> = new Map();
  protected timers: Map<string, { start: number, total: number, count: number }> = new Map();
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  
  /**
   * Increment a counter
   * @param name Counter name
   * @param value Value to increment by (default: 1)
   */
  public incrementCounter(name: string, value: number = 1): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }
  
  /**
   * Set a gauge value
   * @param name Gauge name
   * @param value Gauge value
   */
  public setGauge(name: string, value: number): void {
    this.gauges.set(name, value);
  }
  
  /**
   * Record a value in a histogram
   * @param name Histogram name
   * @param value Value to record
   */
  public recordHistogram(name: string, value: number): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    this.histograms.get(name)!.push(value);
    
    // Limit histogram size to prevent memory issues
    const maxHistogramSize = 1000;
    const histogram = this.histograms.get(name)!;
    if (histogram.length > maxHistogramSize) {
      this.histograms.set(name, histogram.slice(-maxHistogramSize));
    }
  }
  
  /**
   * Start a timer
   * @param name Timer name
   */
  public startTimer(name: string): void {
    if (!this.timers.has(name)) {
      this.timers.set(name, { start: 0, total: 0, count: 0 });
    }
    this.timers.get(name)!.start = performance.now();
  }
  
  /**
   * Stop a timer
   * @param name Timer name
   */
  public stopTimer(name: string): void {
    if (!this.timers.has(name)) {
      return;
    }
    
    const timer = this.timers.get(name)!;
    const elapsed = performance.now() - timer.start;
    
    timer.total += elapsed;
    timer.count++;
  }
  
  /**
   * Get all metrics
   */
  public getMetrics(): any {
    const metrics: any = {
      counters: {},
      gauges: {},
      histograms: {},
      timers: {}
    };
    
    // Convert counters
    for (const [name, value] of this.counters.entries()) {
      metrics.counters[name] = value;
    }
    
    // Convert gauges
    for (const [name, value] of this.gauges.entries()) {
      metrics.gauges[name] = value;
    }
    
    // Convert histograms
    for (const [name, values] of this.histograms.entries()) {
      if (values.length === 0) continue;
      
      // Sort values for percentile calculations
      const sorted = [...values].sort((a, b) => a - b);
      
      metrics.histograms[name] = {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: values.reduce((sum, val) => sum + val, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      };
    }
    
    // Convert timers
    for (const [name, timer] of this.timers.entries()) {
      if (timer.count === 0) continue;
      
      metrics.timers[name] = {
        count: timer.count,
        total: timer.total,
        mean: timer.total / timer.count
      };
    }
    
    return metrics;
  }
  
  /**
   * Reset all metrics
   */
  public reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.timers.clear();
  }
}

/**
 * Interest management metrics
 */
export class InterestMetrics extends MetricsCollector {
  protected static instance: InterestMetrics;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): InterestMetrics {
    if (!InterestMetrics.instance) {
      InterestMetrics.instance = new InterestMetrics();
    }
    return InterestMetrics.instance;
  }
  
  /**
   * Start the processing timer
   */
  public startProcessingTimer(): void {
    this.startTimer('interest_processing');
  }
  
  /**
   * Stop the processing timer
   */
  public stopProcessingTimer(): void {
    this.stopTimer('interest_processing');
  }
  
  /**
   * Record grid cell density
   * @param density Number of entities in the cell
   */
  public recordGridCellDensity(density: number): void {
    this.recordHistogram('grid_cell_density', density);
  }
  
  /**
   * Record entity counts
   * @param candidateCount Number of candidate entities
   * @param relevantCount Number of relevant entities
   */
  public recordEntityCounts(candidateCount: number, relevantCount: number): void {
    this.recordHistogram('candidate_entities', candidateCount);
    this.recordHistogram('relevant_entities', relevantCount);
    
    // Calculate filtering efficiency
    if (candidateCount > 0) {
      const filteringEfficiency = 1 - (relevantCount / candidateCount);
      this.recordHistogram('filtering_efficiency', filteringEfficiency);
    }
  }
}

/**
 * View distance metrics
 */
export class ViewDistanceMetrics extends MetricsCollector {
  protected static instance: ViewDistanceMetrics;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ViewDistanceMetrics {
    if (!ViewDistanceMetrics.instance) {
      ViewDistanceMetrics.instance = new ViewDistanceMetrics();
    }
    return ViewDistanceMetrics.instance;
  }
  
  /**
   * Record a cache hit
   */
  public recordCacheHit(): void {
    this.incrementCounter('cache_hits');
  }
  
  /**
   * Record a cache miss
   */
  public recordCacheMiss(): void {
    this.incrementCounter('cache_misses');
  }
  
  /**
   * Get the cache hit rate
   */
  public getCacheHitRate(): number {
    const hits = this.counters.get('cache_hits') || 0;
    const misses = this.counters.get('cache_misses') || 0;
    const total = hits + misses;
    
    return total > 0 ? hits / total : 0;
  }
  
  /**
   * Record view distance calculation time
   * @param duration Duration in milliseconds
   */
  public recordCalculationTime(duration: number): void {
    this.recordHistogram('view_distance_calculation_time', duration);
  }
  
  /**
   * Record view distance value
   * @param viewDistance View distance value
   */
  public recordViewDistance(viewDistance: number): void {
    this.recordHistogram('view_distance', viewDistance);
  }
  
  /**
   * Record view cone check
   * @param isInCone Whether the target is in the view cone
   */
  public recordViewConeCheck(isInCone: boolean): void {
    this.incrementCounter('view_cone_checks');
    if (isInCone) {
      this.incrementCounter('view_cone_hits');
    }
  }
  
  /**
   * Get the view cone hit rate
   */
  public getViewConeHitRate(): number {
    const checks = this.counters.get('view_cone_checks') || 0;
    const hits = this.counters.get('view_cone_hits') || 0;
    
    return checks > 0 ? hits / checks : 0;
  }
  
  /**
   * Record cache size
   * @param size Cache size
   */
  public recordCacheSize(size: number): void {
    this.setGauge('cache_size', size);
  }
}