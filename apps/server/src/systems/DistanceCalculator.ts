import { PlayerEntity } from '../entities/PlayerEntity';

export class DistanceCalculator {
  private baseViewDistance: number;

  constructor(baseViewDistance: number) {
    this.baseViewDistance = baseViewDistance;
  }

  isInRange(observer: PlayerEntity, target: PlayerEntity): boolean {
    const distance = this.calculateDistance(observer.position, target.position);
    const effectiveViewDistance = this.getEffectiveViewDistance(observer);
    return distance <= effectiveViewDistance;
  }

  private calculateDistance(a: {x: number, y: number}, b: {x: number, y: number}): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private getEffectiveViewDistance(player: PlayerEntity): number {
    // Start with base view distance
    let viewDistance = this.baseViewDistance;

    // Apply player-specific modifiers
    viewDistance *= player.viewDistance;

    // TODO: Add day/night cycle and ability modifiers
    return viewDistance;
  }
}