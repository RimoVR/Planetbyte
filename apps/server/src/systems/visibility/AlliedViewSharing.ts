import { PlayerEntity } from '../../entities/PlayerEntity';
import { Vector2, WORLD_CONSTANTS } from '../../types/common';

/**
 * Manages view sharing between allied players
 */
export class AlliedViewSharing {
  // Cache of allied visibility graphs to avoid recalculating every frame
  private visibilityGraphCache: Map<string, AlliedVisibilityNode[]> = new Map();
  private cacheExpiryTime: number = 1000; // Cache expires after 1 second
  private lastCacheUpdateTime: Map<string, number> = new Map();
  
  /**
   * Get the additional view distance provided by nearby allies
   * @param player The player entity
   * @param allPlayers All player entities
   * @returns The additional view distance
   */
  getAdditionalViewDistance(player: PlayerEntity, allPlayers: PlayerEntity[]): number {
    // Get allies within sharing distance
    const allies = this.getNearbyAllies(player, allPlayers);
    
    if (allies.length === 0) {
      return 0;
    }
    
    // Calculate additional view distance from allies
    let additionalViewDistance = 0;
    
    for (const ally of allies) {
      // Calculate distance to ally
      const distance = this.calculateDistance(player.position, ally.position);
      
      // Calculate share percentage based on distance
      // Closer allies provide more of their view distance
      const sharePercentage = this.calculateSharePercentage(distance);
      
      // Add ally's contribution to additional view distance
      const allyContribution = ally.viewDistance * sharePercentage * WORLD_CONSTANTS.ALLIED_VIEW_SHARE_PERCENTAGE;
      additionalViewDistance += allyContribution;
    }
    
    return additionalViewDistance;
  }
  
  /**
   * Check if a target is visible to a player through allied vision
   * @param observer The observing player
   * @param target The target to check visibility for
   * @param allPlayers All player entities
   * @returns True if the target is visible through allied vision
   */
  isVisibleThroughAllies(observer: PlayerEntity, target: PlayerEntity, allPlayers: PlayerEntity[]): boolean {
    // If target is already directly visible, no need to check allies
    if (this.isDirectlyVisible(observer, target)) {
      return true;
    }
    
    // Get the visibility graph for the observer's faction
    const visibilityGraph = this.getVisibilityGraph(observer, allPlayers);
    
    // Check if any ally can see the target
    for (const node of visibilityGraph) {
      if (node.playerId !== observer.id && this.isDirectlyVisible(node.player, target)) {
        // Check if the observer is connected to this ally in the visibility graph
        if (this.areConnectedInGraph(observer.id, node.playerId, visibilityGraph)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Get nearby allies for a player
   * @param player The player entity
   * @param allPlayers All player entities
   * @returns Array of nearby allied players
   */
  private getNearbyAllies(player: PlayerEntity, allPlayers: PlayerEntity[]): PlayerEntity[] {
    return allPlayers.filter(otherPlayer => 
      otherPlayer !== player && // Not the same player
      otherPlayer.faction === player.faction && // Same faction
      this.calculateDistance(player.position, otherPlayer.position) <= WORLD_CONSTANTS.ALLIED_VIEW_SHARE_DISTANCE // Within sharing distance
    );
  }
  
  /**
   * Calculate the distance between two positions
   * @param a First position
   * @param b Second position
   * @returns The distance between the positions
   */
  private calculateDistance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * Calculate the share percentage based on distance
   * @param distance The distance between players
   * @returns The share percentage (0-1)
   */
  private calculateSharePercentage(distance: number): number {
    // Linear falloff from 100% at distance 0 to 0% at max share distance
    return Math.max(0, 1 - (distance / WORLD_CONSTANTS.ALLIED_VIEW_SHARE_DISTANCE));
  }
  
  /**
   * Check if a target is directly visible to an observer
   * @param observer The observing player
   * @param target The target player
   * @returns True if the target is directly visible
   */
  private isDirectlyVisible(observer: PlayerEntity, target: PlayerEntity): boolean {
    // Calculate distance between observer and target
    const distance = this.calculateDistance(observer.position, target.position);
    
    // Check if target is within observer's view distance
    return distance <= observer.viewDistance;
  }
  
  /**
   * Get the visibility graph for a player's faction
   * @param player The player entity
   * @param allPlayers All player entities
   * @returns The visibility graph for the player's faction
   */
  private getVisibilityGraph(player: PlayerEntity, allPlayers: PlayerEntity[]): AlliedVisibilityNode[] {
    const factionId = player.faction;
    const now = Date.now();
    
    // Check if we have a cached graph that's still valid
    if (
      this.visibilityGraphCache.has(factionId) &&
      this.lastCacheUpdateTime.has(factionId) &&
      now - (this.lastCacheUpdateTime.get(factionId) || 0) < this.cacheExpiryTime
    ) {
      return this.visibilityGraphCache.get(factionId) || [];
    }
    
    // Get all players in the faction
    const factionPlayers = allPlayers.filter(p => p.faction === factionId);
    
    // Create nodes for each player
    const nodes: AlliedVisibilityNode[] = factionPlayers.map(p => ({
      playerId: p.id,
      player: p,
      connections: []
    }));
    
    // Create connections between players who can see each other
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const playerA = nodes[i].player;
        const playerB = nodes[j].player;
        
        // Calculate distance between players
        const distance = this.calculateDistance(playerA.position, playerB.position);
        
        // Check if players are within view sharing distance of each other
        if (distance <= WORLD_CONSTANTS.ALLIED_VIEW_SHARE_DISTANCE) {
          // Add bidirectional connection
          nodes[i].connections.push(nodes[j].playerId);
          nodes[j].connections.push(nodes[i].playerId);
        }
      }
    }
    
    // Cache the graph
    this.visibilityGraphCache.set(factionId, nodes);
    this.lastCacheUpdateTime.set(factionId, now);
    
    return nodes;
  }
  
  /**
   * Check if two players are connected in the visibility graph
   * @param startId The starting player ID
   * @param targetId The target player ID
   * @param graph The visibility graph
   * @returns True if the players are connected
   */
  private areConnectedInGraph(startId: string, targetId: string, graph: AlliedVisibilityNode[]): boolean {
    // If they're the same player, they're connected
    if (startId === targetId) {
      return true;
    }
    
    // Find the start node
    const startNode = graph.find(node => node.playerId === startId);
    if (!startNode) {
      return false;
    }
    
    // Breadth-first search to find a path to the target
    const visited = new Set<string>();
    const queue: string[] = [startId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      if (currentId === targetId) {
        return true;
      }
      
      if (visited.has(currentId)) {
        continue;
      }
      
      visited.add(currentId);
      
      // Find the current node
      const currentNode = graph.find(node => node.playerId === currentId);
      if (currentNode) {
        // Add all unvisited connections to the queue
        for (const connectionId of currentNode.connections) {
          if (!visited.has(connectionId)) {
            queue.push(connectionId);
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Clear the visibility graph cache
   */
  clearCache(): void {
    this.visibilityGraphCache.clear();
    this.lastCacheUpdateTime.clear();
  }
}

/**
 * Represents a node in the allied visibility graph
 */
interface AlliedVisibilityNode {
  playerId: string;
  player: PlayerEntity;
  connections: string[]; // IDs of connected players
}