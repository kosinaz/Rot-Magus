/* global Phaser */
import Terrain from './terrain.js';
/**
 * Represents a collection of terrain information.
 *
 * @export
 * @class WorldMap
 */
export default class WorldMap {
  constructor() {
    this.map = new Map();
    this.events = new Phaser.Events.EventEmitter();
  }

  isTransparentAt(x, y) {
    if (!this.map.has(`${x},${y}`)) this.addChunkFor(x, y);
    return this.map.get(`${x},${y}`).type.transparent;
  } 
  
  addChunkFor(x, y) {
    const chunkX = Math.floor(x / 50);
    const chunkY = Math.floor(y / 50);
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

  createTerrain(terrainType, x, y) {
    const terrain = new Terrain(terrainType, x, y);
    this.map.set(`${x},${y}`, terrain);
    this.events.emit('add', terrain);
  }  

  updateVisibility(xys) {
    this.map.forEach(terrain => terrain.hide());
    xys.forEach(this.show, this);
  }

  show(xy) {
    this.map.get(xy).show();
  }
}