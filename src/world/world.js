import Speed from '../../lib/rot/scheduler/speed.js';
import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';
import Actor from './actor/actor.js';
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
    this.map = new Map();
    this.scheduler = new Speed();
    this.fovcomputer = new PreciseShadowcasting(this.isTransparent);
    this.events = new Phaser.Events.EventEmitter();
    for (let x = -10; x < 10; x += 1) {
      for (let y = -10; y < 10; y += 1) {
        this.map.set(`terrain,${x},${y}`, {
          layer: 'terrain',
          type: 'grass',
        });
      }
    }
    this.createActor(config.actorTypes.elfMale).isPC = true;
    this.createActor(config.actorTypes.djinn, 0, 2).isPC = true;
    this.createActor(config.actorTypes.demon, 2, 2);
    this.createActor(config.actorTypes.orch, 1, 3);
    this.nextActor();
  }

  /**
   *
   *
   * @param {*} actorType
   * @param {*} x
   * @param {*} y
   * @return {Actor}
   * @memberof World
   */
  createActor(actorType, x, y) {
    const actor = new Actor(actorType, x, y);
    this.map.set(`actor,${actor.xy}`, actor);
    this.scheduler.add(actor, true);
    actor.events.on('pause', (actor) => {
      this.pausedFor = actor;
    });
    actor.events.on('complete', this.nextActor, this);
    return actor;
  }

  /**
   *
   *
   * @memberof World
   */
  nextActor() {
    const actor = this.scheduler.next();
    console.log(actor.type.name);
    if (!actor) {
      return;
    }
    if (!actor.isPC) {
      actor.act();
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
    const terrain = this.terrain.get(`${x},${y}`);
    if (!terrain) {
      return false;
    }
    return terrain.transparent;
  }

  /**
   *
   *
   * @param {*} hero
   * @memberof World
   */
  updateFOV(hero) {
    // Reset the list of tiles that were visible for the hero in the previous
    // turn.
    hero.fov = [];

    // Iterate through all the tiles around the hero and determine if they
    // are in the line of sight of the hero or not.
    this.fovcomputer.compute(hero.x, hero.y, 13, (x, y) => {
      // Add the position of tile to list of positions visible by the hero.
      hero.fov.push({
        x: x,
        y: y,
      });
    });

    // Update the list of visible tiles.
    this.tiles = tiles;

    this.events.emit('update', hero.fov);
  }
}
