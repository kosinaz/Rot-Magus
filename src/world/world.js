/* global Phaser */
import Director from './director.js';
import Troupe from './troupe.js';
import WorldMap from './worldMap.js';

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
    this.map = new WorldMap();
    this.map.events.on('add', terrain => this.events.emit('add', terrain));
    this.actors = new Troupe();
    this.events = new Phaser.Events.EventEmitter();
    this.actors.events.on('add', actor => this.events.emit('add', actor));
    this.actors.events.on('select', pc => this.events.emit('select', pc));
    this.director = new Director(this.map, this.actors);
  }

  start() {
    this.config.pcs.forEach(pc => this.actors.add(pc));
    this.director.direct(this.actors.getNext());
  }
}
