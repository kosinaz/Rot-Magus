// eslint-disable-next-line no-unused-vars
import WorldMap from './worldMap.js';
// eslint-disable-next-line no-unused-vars
import Troupe from './troupe.js';
import PreciseShadowcasting from '../../lib/rot/fov/precise-shadowcasting.js';
import AStar from '../../lib/rot/path/astar.js';

export default class Director {
  /**
   * Creates an instance of Director.
   * @param {WorldMap} map
   * @param {Troupe} actors
   * @memberof Director
   */
  constructor(map, actors) {
    this.map = map;
    this.actors = actors;
    this.viewUpdater = new PreciseShadowcasting((x, y) => {
      if (actors.hasPCAt(x, y)) return true;
      return map.isTransparentAt(x, y);
    });
  }

  direct(actor) {
    actor.clearView();
    this.viewUpdater.compute(actor.x, actor.y, 10, actor.addToView.bind(actor));
    this.actors.updateView();
    if (actor.isPC) this.directPC(actor);
    else this.directNPC(actor);
  }

  directPC(pc) {
    console.log('directPC', pc.type.name, pc.isPC);
    this.map.updateVisibility(this.actors.view);

    // The world will stop if the player character doesn't have any actions 
    // left from their last order to let the player give another order. 
    // Otherwise the player character will scan their surroundings for enemies
    // or newly discovered items, and the world will stop just like in the 
    // other case, if there is any. 
    // However, if there is none, there is no reason for the player character 
    // not to continue towards their target, so the game won't stop and won't 
    // reveal anything until any of the above conditions are true again.
    if (pc.hasOrder || this.actors.hasVisibleNPC) this.followOrder(pc);
    else this.waitForOrder(pc);
  }

  followOrder(actor) {
    if (!actor.hasOrder) return this.direct(this.actors.getNext());
    const xy = actor.orders.shift();
    actor.xy = xy;
    actor.events.emit('move');
    actor.waiting = false;
    this.direct(this.actors.getNext());
  }

  waitForOrder(pc) {
    this.actors.updateVisibility();
    pc.wait();
    this.actors.select(pc);
  }

  directNPC(npc) {
    console.log('directNPC', npc.type.name, !!npc.isPC);
    const pc = npc.view.filter(xy => this.actors.hasPCAt(xy))[0];
    if (pc) this.giveOrder(npc, pc);
    this.followOrder(npc);
  }

  /**
   * Give the actor an order.
   *
   * @param {*} actor
   * @param {*} x
   * @param {*} y
   * @memberof Actor
   */
  giveOrder(actor, xy) {
    xy = xy.split(',');
    const x = parseInt(xy[0], 10);
    const y = parseInt(xy[1], 10);
    // Initialize a new astar pathmap based on the given target.
    const a = new AStar(x, y, (x, y) => {
      if (actor.isAt(`${x},${y}`)) return true;
      return this.map.isWalkableAt(x, y);
    });

    // After generated the pathmap create a new path for the actor.
    actor.orders = [];

    // Compute the shortest path between the actor's current position and the
    // given target position based on the astar map.
    a.compute(actor.x, actor.y, (x, y) => actor.orders.push({x, y}));

    // Remove the first order, because that's current position of the actor.
    actor.orders.shift();
  }
}