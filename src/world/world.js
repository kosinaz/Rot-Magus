/* global Phaser */
import Speed from '../../lib/rot/scheduler/speed.js';
import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';
import AStar from '../../lib/rot/path/astar.js';
import Actor from './actor/actor.js';
import Terrain from './terrain.js';

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
    this.scheduler = new Speed();
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
    for (let x = -50; x < 50; x += 1) {
      for (let y = -50; y < 50; y += 1) {
        const tile = Math.random() > 0.1 ? 'grass' : 'tree';
        this.createTerrain({
          layer: 'terrain',
          image: tile,
          name: tile,
          walkable: tile === 'grass',
          transparent: tile === 'grass',
        }, x, y);
      }
    }
    this.actors = [];
    this.config.pcs.forEach((pc) => this.addActor(pc));
    this.addActor(new Actor(this.config.actorTypes.djinn, 0, 25));
    this.addActor(new Actor(this.config.actorTypes.demon, 1, 25));
    this.addActor(new Actor(this.config.actorTypes.orchArcher, 2, 25));
    this.addActor(new Actor(this.config.actorTypes.duckMageMale, 3, 25));
    this.nextActor();
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
   * @param {*} actor
   * @memberof World
   */
  addActor(actor) {
    this.actors.push(actor);
    this.scheduler.add(actor, true);
    actor.events.on('complete', this.nextActor, this);
    this.events.emit('add', actor);
  }

  /**
   *
   *
   * @memberof World
   */
  nextActor() {
    const actor = this.scheduler.next();

    // The world will stop if the player character doesn't have a target to let
    // the player choose one. All that happened since the player's last action, 
    // will be revealed now. Otherwise the player character will scan their 
    // surroundings for enemies or newly discovered items, and the world will
    // stop just like in the other case, if there is any. However, if there is
    // none, there is no reason for the player character not to continue towards
    // their target, so the game won't stop and won't reveal anything until any
    // of the above conditions are true again.
    if (actor.isPC) {
      if (!actor.orders.length) {
        this.pause(actor);
        this.select(actor);
        this.updateVisibleTiles();
      } else {
        actor.act();
      }
    } else {
      const targets = this.possibleTargets(actor);
      if (targets[0]) {
        this.giveOrder(actor, targets[0].x, targets[0].y);
      }
      actor.act();
    }
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
    let transparent = false;
    this.actors.forEach((actor) => {
      if (actor.isPC && actor.x === x && actor.y === y) {
        transparent = true;
      }
    });
    if (transparent) {
      return true;
    }
    if (!terrain) {
      return false;
    }
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
    this.actors.forEach((actor) => {
      if (actor.isPC) {
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
              const terrain = this.map.get(`terrain,${x},${y}`);

              // If there is something.
              if (terrain) {
                // Then show it.
                terrain.events.emit('reveal');
              }
            }
          }
        });
      }
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
        if (otherActor.isPC && otherActor.x === x && otherActor.y === y) {
          targets.push({
            x: x,
            y: y,
          });
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
