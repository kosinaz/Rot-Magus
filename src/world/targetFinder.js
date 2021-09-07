import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';

export default class TargetFinder {
  constructor(map, actors) {
    this.actors = actors;
    this.fovComputer = new PreciseShadowcasting((x, y) => {
      const terrain = map.get(`terrain,${x},${y}`);
      if (actors.hasPCAt(`${x},${y}`)) return true;
      if (!terrain) return false;
      return terrain.type.transparent;
    });
  }

  getTargets(x, y) {
    const targets = [];
    this.fovComputer.compute(x, y, 10, (x, y) => {
      const target = this.actors.getAt(`${x},${y}`);
      if (target) targets.push(target);
    });
    return targets;
  }
}