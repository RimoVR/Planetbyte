import { Component } from '@colyseus/ecs';
import { Position } from '../components/Position';
import { Faction } from '../components/Faction';
import { Stealth } from '../components/Stealth';

export class PlayerEntity extends Component {
  id: string;
  position: Position;
  faction: Faction;
  viewDistance: number;
  stealth: Stealth;
  rotation: number = 0; // Added rotation for view cone and direction
  lastUpdateTime: number = 0;
  updateCount: number = 0;
  totalBytesSent: number = 0;
  totalBytesSaved: number = 0;

  static readonly isComponent = true;
  static schema = {
    id: 'string',
    position: Position,
    faction: Faction,
    viewDistance: 'number',
    stealth: Stealth,
    rotation: 'number'
  };

  constructor(id: string, x: number, y: number, faction: Faction, viewDistance: number) {
    super();
    this.id = id;
    this.position = new Position(x, y);
    this.faction = faction;
    this.viewDistance = viewDistance;
    this.stealth = new Stealth();
  }

  /**
   * Update player state
   * @param deltaTime Time elapsed since last update in milliseconds
   */
  update(deltaTime: number): void {
    // Update stealth component
    this.stealth.update(deltaTime);
  }

  /**
   * Activate stealth ability
   * @returns True if stealth was activated
   */
  activateStealth(): boolean {
    return this.stealth.activate();
  }

  /**
   * Deactivate stealth ability
   */
  deactivateStealth(): void {
    this.stealth.deactivate();
  }

  /**
   * Check if player has stealth active
   * @returns True if stealth is active
   */
  hasStealthActive(): boolean {
    return this.stealth.isActive;
  }

  /**
   * Get stealth effectiveness (0-1)
   * @returns Stealth effectiveness value
   */
  getStealthEffectiveness(): number {
    return this.stealth.getEffectiveness();
  }

  /**
   * Send updates to the client
   * @param updates Array of updates to send
   */
  sendUpdates(updates: any[]): void {
    // In a real implementation, this would send the updates to the client
    // For now, just log that we're sending updates
    
    // Calculate update frequency (updates per second)
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    // Only calculate frequency if not the first update
    if (this.updateCount > 0 && timeSinceLastUpdate > 0) {
      const updatesPerSecond = 1000 / timeSinceLastUpdate;
      console.log(`Player ${this.id} update frequency: ${updatesPerSecond.toFixed(2)} updates/second`);
    }
    
    // Track update count
    this.updateCount++;
    
    // Track bytes sent and saved
    let bytesSent = 0;
    let bytesSaved = 0;
    
    updates.forEach(update => {
      if (update.stats) {
        bytesSent += update.stats.compressedSize;
        bytesSaved += update.stats.originalSize - update.stats.compressedSize;
      } else {
        // Estimate size if stats not available
        bytesSent += JSON.stringify(update).length;
      }
    });
    
    this.totalBytesSent += bytesSent;
    this.totalBytesSaved += bytesSaved;
    
    // Log total bytes sent and saved
    if (this.updateCount % 10 === 0) {
      console.log(`Player ${this.id} total: ${this.totalBytesSent} bytes sent, ${this.totalBytesSaved} bytes saved (${(this.totalBytesSaved / (this.totalBytesSent + this.totalBytesSaved) * 100).toFixed(2)}% reduction)`);
    }
  }
}