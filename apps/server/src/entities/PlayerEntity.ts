import { Component } from '@colyseus/ecs';
import { Position } from '../components/Position';
import { Faction } from '../components/Faction';

export class PlayerEntity extends Component {
  id: string;
  position: Position;
  faction: Faction;
  viewDistance: number;

  static readonly isComponent = true;
  static schema = {
    id: 'string',
    position: Position,
    faction: Faction,
    viewDistance: 'number'
  };

  constructor(id: string, x: number, y: number, faction: Faction, viewDistance: number) {
    super();
    this.id = id;
    this.position = new Position(x, y);
    this.faction = faction;
    this.viewDistance = viewDistance;
  }

  sendUpdates(entities: Component[]) {
    // TODO: Implement network update sending
    console.log(`Sending updates for ${entities.length} entities to player ${this.id}`);
  }
}