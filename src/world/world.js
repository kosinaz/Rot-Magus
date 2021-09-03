/* global Phaser */
import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';
import AStar from '../../lib/rot/path/astar.js';
import Terrain from './terrain.js';
import ActorGroup from './actorGroup.js';

/**
 * Represents the game world.
 *
 * @export
 * @class World
 */
export default class World {
  /**
   *Creates an instance of World.
   * @param {*} config
   * @memberof World
   */
  constructor(config) {
    this.config = config;
    this.selected = null;
    this.map = new Map();
    this.visibleTiles = new Set();
    this.fovcomputer = new PreciseShadowcasting(this.isTransparent.bind(this));
    this.events = new Phaser.Events.EventEmitter();
  }

  /**
   *
   *
   * @param {*} config
   * @memberof World
   */
  create() {
    this.actors = new ActorGroup();
    this.actors.events.on('add', (actor) => this.events.emit('add', actor));
    this.config.pcs.forEach((pc) => this.actors.add(pc));
    this.actors.events.on('next', this.controlActor, this);
    this.actors.next();
  }

  addChunk(chunkX, chunkY) {
    for (let x = chunkX * 50; x < chunkX * 50 + 50; x += 1) {
      for (let y = chunkY * 50; y < chunkY * 50 + 50; y += 1) {
        const floor = chunkX % 2 ? 
          chunkY % 2 ? 'dirt' : 'gravel' :
          chunkY % 2 ? 'grass' : 'sand';
        const wall = chunkX % 2 ?
          chunkY % 2 ? 'mountain' : 'mountain' :
          chunkY % 2 ? 'tree' : 'palmTree';
        const tile = Math.random() > 0.1 ? floor : wall;
        this.createTerrain({
          layer: 'terrain',
          image: tile,
          name: tile,
          walkable: !['mountain', 'tree', 'palmTree'].includes(tile),
          transparent: !['mountain', 'tree', 'palmTree'].includes(tile),
        }, x, y);
      }
    }
  }

  /**
   *
   *
   * @param {*} terrainType
   * @param {*} x
   * @param {*} y
   * @param {*} isPC
   * @memberof World
   */
  createTerrain(terrainType, x, y) {
    const terrain = new Terrain(terrainType, x, y);
    this.map.set(terrain.position, terrain);
    this.events.emit('add', terrain);
  }

  /**
   *
   *
   * @memberof World
   */
  controlActor(actor) {
    let targets = this.possibleTargets(actor);
    if (actor.isPC) this.controlPC(actor, targets);
    else this.controlNPC(actor, targets);
  }

  controlPC(actor, targets) {
    // The world will stop if the player character doesn't have any actions 
    // left from their last order to let the player give another order. 
    // Otherwise the player character will scan their surroundings for enemies
    // or newly discovered items, and the world will stop just like in the 
    // other case, if there is any. 
    // All that happened since the player's last action, will be revealed now. 
    // However, if there is none, there is no reason for the player character 
    // not to continue towards their target, so the game won't stop and won't 
    // reveal anything until any of the above conditions are true again. 
    const targetInSight = !!(targets.filter(target => !target.isPC)[0]);
    if (!actor.orders.length || targetInSight) this.revealAndWait(actor);
    else actor.act();
  }

  controlNPC(actor, targets) {
    const target = targets.filter(target => target.isPC)[0];
    if (target) this.giveOrder(actor, target.x, target.y);
    actor.act();
  }

  revealAndWait(actor) {
    this.updateVisibleTiles();
    this.pause(actor);
    this.select(actor);
  }

  /**
   *
   * @param {*} actor
   * @memberof World
   */
  select(actor) {
    this.selected = actor;
    this.events.emit('select', actor);
  }

  /**
   *
   * @param {*} actor
   * @memberof World
   */
  pause(actor) {
    this.pausedFor = actor;
    this.events.emit('pause', actor);
  }

  /**
   *
   *
   * @param {*} x
   * @param {*} y
   * @return {Boolean}
   * @memberof World
   */
  isTransparent(x, y) {
    const terrain = this.map.get(`terrain,${x},${y}`);
    if (this.actors.hasPCAt(`${x},${y}`)) return true;
    if (!terrain) return false;
    return terrain.type.transparent;
  }

  /**
   * Updates all the tiles of the world currently visible for the player by
   * updating the FOV of all the player characters.
   *
   * @param {*} actor
   * @memberof World
   */
  updateVisibleTiles() {
    // Add the newly visible tiles.
    const previouslyVisibleTiles = new Set(this.visibleTiles);
    this.visibleTiles.clear();
    this.actors.forEachPC((actor) => {
      // Reset the list of tiles that are visible for the actor.
      actor.fov.clear();

      // Iterate through all the tiles around the actor and determine if they
      // are in the line of sight of the actor or not.
      this.fovcomputer.compute(actor.x, actor.y, 13, (x, y) => {
        // Add the position of tile to list of positions visible for the
        // actor to help it determine if it can be ranged attacked by the
        // actor.
        actor.fov.add(`${x},${y}`);

        // If the tile is not already visible for any other PC.
        if (!this.visibleTiles.has(`${x},${y}`)) {
          // Then add it.
          this.visibleTiles.add(`${x},${y}`);

          // And remove it from the list of previously visible tiles, to only
          // keep those tiles that are not visible now and will need to be
          // hidden.
          if (!previouslyVisibleTiles.delete(`${x},${y}`)) {
            // But if nothing to remove, because the tile was not visible
            // before, then check what's there.
            let terrain = this.map.get(`terrain,${x},${y}`);

            // If there is nothing.
            if (!terrain) {
              // Then create it.
              this.addChunk(Math.floor(x / 50), Math.floor(y / 50));

              // Check what's there.
              terrain = this.map.get(`terrain,${x},${y}`);
            }              
            // Then show it.
            terrain.events.emit('reveal');
          }
        }
      });
    });

    // Get all the tiles that were visible before but not anymore.
    previouslyVisibleTiles.forEach((tile) => {
      const terrain = this.map.get(`terrain,${tile}`);
      if (terrain) {
        terrain.events.emit('hide');
      }
    });

    // Show visible actors and hide the rest.
    this.actors.forEach((actor) => {
      if (this.visibleTiles.has(`${actor.xy}`)) {
        actor.show();
      } else {
        actor.hide();
      }
    });
  }

  /**
   *
   *
   * @param {*} actor
   * @memberof World
   */
  possibleTargets(actor) {
    const targets = [];
    // Iterate through all the tiles around the actor and determine if they
    // are in the line of sight of the actor or not.
    this.fovcomputer.compute(actor.x, actor.y, 13, (x, y) => {
      this.actors.forEach((otherActor) => {
        if (otherActor.x === x && otherActor.y === y) {
          targets.push(otherActor);
        }
      });
    });
    return targets;
  }

  /**
   * Give the actor an order.
   *
   * @param {*} actor
   * @param {*} x
   * @param {*} y
   * @memberof Actor
   */
  giveOrder(actor, x, y) {
    // Initialize a new astar pathmap based on the given target.
    const a = new AStar(x, y, (x, y) => {
      const terrain = this.map.get(`terrain,${x},${y}`);
      if (actor.x === x && actor.y === y) {
        return true;
      }
      if (terrain && terrain.type.walkable) {
        return true;
      }
      return false;
    });

    // After generated the pathmap create a new path for the actor.
    actor.orders = [];

    // Compute the shortest path between the actor's current position and the
    // given target position based on the astar map.
    a.compute(actor.x, actor.y, (x, y) => {
      // Add the next position of the shortest path to the actor's path.
      actor.orders.push({
        x: x,
        y: y,
      });
    });

    // Remove the first order, because that's current position of the actor.
    actor.orders.shift();
  }
}
