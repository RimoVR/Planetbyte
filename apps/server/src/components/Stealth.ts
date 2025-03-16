export enum StealthState {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  COOLDOWN = 'COOLDOWN',
  PARTIAL = 'PARTIAL'
}

export class Stealth {
  isActive: boolean;
  stealthLevel: number;
  cooldownRemaining: number;
  duration: number;
  durationRemaining: number;
  state: StealthState;

  constructor(
    isActive: boolean = false,
    stealthLevel: number = 1.0,
    cooldownRemaining: number = 0,
    duration: number = 10000, // 10 seconds default
    durationRemaining: number = 0
  ) {
    this.isActive = isActive;
    this.stealthLevel = stealthLevel;
    this.cooldownRemaining = cooldownRemaining;
    this.duration = duration;
    this.durationRemaining = durationRemaining;
    this.state = StealthState.INACTIVE;
  }

  /**
   * Activate stealth ability
   * @returns True if stealth was activated, false if on cooldown
   */
  activate(): boolean {
    if (this.cooldownRemaining > 0 || this.isActive) {
      return false;
    }

    this.isActive = true;
    this.durationRemaining = this.duration;
    this.state = StealthState.ACTIVE;
    return true;
  }

  /**
   * Deactivate stealth ability
   */
  deactivate(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    this.durationRemaining = 0;
    this.cooldownRemaining = this.getCooldownDuration();
    this.state = StealthState.COOLDOWN;
  }

  /**
   * Update stealth state based on elapsed time
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  update(deltaTime: number): void {
    // Update duration if active
    if (this.isActive && this.durationRemaining > 0) {
      this.durationRemaining -= deltaTime;
      
      // Check if duration expired
      if (this.durationRemaining <= 0) {
        this.deactivate();
      }
    }
    
    // Update cooldown if not active
    if (!this.isActive && this.cooldownRemaining > 0) {
      this.cooldownRemaining -= deltaTime;
      
      // Check if cooldown expired
      if (this.cooldownRemaining <= 0) {
        this.cooldownRemaining = 0;
        this.state = StealthState.INACTIVE;
      }
    }
  }

  /**
   * Get the current stealth effectiveness (0-1)
   * 0 = not stealthed, 1 = fully stealthed
   */
  getEffectiveness(): number {
    if (!this.isActive) {
      return 0;
    }

    // Could implement partial stealth based on movement, etc.
    return this.stealthLevel;
  }

  /**
   * Get the cooldown duration in milliseconds
   */
  private getCooldownDuration(): number {
    // Base cooldown of 30 seconds
    return 30000;
  }
}