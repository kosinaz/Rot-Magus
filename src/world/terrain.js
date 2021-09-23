/* global Phaser */
/**
 * Represents a part of the world.
 * @class Terrain
 */
export default class Terrain {
  /**
   * Creates an instance of Terrain.
   * @param {Object} type - The terrainType config object of the terrain.
   * @param {number} [x=0] - The x coordinate of the terrain's position.
   * @param {number} [y=0] - The y coordinate of the terrain's position.
   * @memberof Terrain
   */
  constructor(type, x = 0, y = 0) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.visible = false;
    this.events = new Phaser.Events.EventEmitter();
  }

  get xy() {
    return `${this.x},${this.y}`;
  }

  set xy(xy) {
    this.x = xy.x;
    this.y = xy.y;
  }

  /**
   *
   *
   * @memberof Terrain
   */
  show() {
    this.events.emit('show');
    this.visible = true;
  }

  /**
   *
   *
   * @memberof Terrain
   */
  hide() {
    this.events.emit('hide');
    this.visible = false;
  }
}
