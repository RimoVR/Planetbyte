import { PlayerEntity } from '../entities/PlayerEntity';
import { Faction } from '../components/Faction';

export class FactionVisibility {
  canSee(observer: PlayerEntity, target: PlayerEntity): boolean {
    // Same faction always visible
    if (observer.faction === target.faction) {
      return true;
    }

    // TODO: Add visibility rules based on abilities and items
    return true; // Default to visible for now
  }
}