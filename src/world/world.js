import Speed from '../../lib/rot/scheduler/speed.js';
import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';
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
    this.map = new Map();
    this.visibleTiles = new Set();
    this.scheduler = new Speed();
    this.fovcomputer = new PreciseShadowcasting(this.isTransparent.bind(this));
    this.events = new Phaser.Events.EventEmitter();
  }

  /**
   *
   *
   * @memberof World
   */
  create() {
    for (let x = -10; x < 10; x += 1) {
      for (let y = -10; y < 10; y += 1) {
        this.createTerrain({
          layer: 'terrain',
          name: 'grass',
          transparent: true,
        }, x, y);
      }
    }
    this.actors = [];
    this.createActor(this.config.actorTypes.elfMale, 0, 0, true);
    this.createActor(this.config.actorTypes.djinn, 0, -9, true);
    this.createActor(this.config.actorTypes.demon, 2, 2);
    this.createActor(this.config.actorTypes.orch, 9, 9);
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
   * @param {*} actorType
   * @param {*} x
   * @param {*} y
   * @param {*} isPC
   * @memberof World
   */
  createActor(actorType, x, y, isPC) {
    const actor = new Actor(actorType, x, y, isPC);
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
    console.log(actor.type.name);
    this.updateVisibleTiles();

    // The world will stop - even if the player character has a target - to let
    // the scene animate the last action. When the animation is complete, the
    // controller will be notified by the scene, it will check if the actor has
    // a target and automatically resumes the world in that case. This way the
    // player can also interrupt the movement of the character with a left
    // click that cancels any orders.
    if (actor.isPC) {
      this.pausedFor = actor;
      this.selected = actor;
    } else {
      actor.act();
    }
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
        this.fovcomputer.compute(actor.x, actor.y, 3, (x, y) => {
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
                terrain.events.emit('show');
              }
            }
          }
        });
      }
    });

    // Get all the tiles that were visible before but not anymore.
    previouslyVisibleTiles.forEach((tile) => {
      this.map.get(`terrain,${tile}`).events.emit('hide');
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
}
