import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';

export default class ViewComputer {
  constructor(map, actors) {    
    this.map = map;
    this.actors = actors;
    this.fovComputer = new PreciseShadowcasting((x, y) => {
      const terrain = map.get(`terrain,${x},${y}`);
      if (actors.hasPCAt(`${x},${y}`)) return true;
      if (!terrain) return false;
      return terrain.type.transparent;
    });
    this.visibleTiles = new Set();
  }  

  updateVisibleTiles() {
    this.tilesToHide = new Set(this.visibleTiles);
    this.visibleTiles.clear();
    this.actors.forEachPC(this.updateFov, this);
    this.tilesToHide.forEach(this.hideTile, this);
  }
  
  updateFov(actor) {
    actor.fov.clear();
    this.currentActor = actor;
    this.fovComputer.compute(actor.x, actor.y, 10, this.updateTile.bind(this));
  }

  updateTile(x, y) {
    const xy = `${x},${y}`;
    this.currentActor.fov.add(xy);

    // If the tile is not already visible for any other PC then add it to the
    // list of currently visible tiles.
    this.visibleTiles.add(xy);

    // And try to remove it from the list of previously visible tiles, to only
    // keep those tiles there that are not visible now and will need to be
    // hidden.
    // If couldn't that means this tile is newly explored, so we need to check
    // what's there and show it.
    if (!this.tilesToHide.delete(xy)) this.showTile(x, y);
  }

  showTile(x, y) {
    const tile = `terrain,${x},${y}`;

    // If there is nothing at the given position, create it.
    if (!this.map.has(tile)) this.addChunkFor(x, y);

    // Then show what's there.
    this.map.get(tile).events.emit('reveal');
  }

  hideTile(tile) {
    this.map.get(`terrain,${tile}`).events.emit('hide');
  }
}