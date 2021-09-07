/* global Phaser */
import Speed from '../../lib/rot/scheduler/speed.js';
/**
 * Represents a group of actors which can act at a certain speed and their 
 * actions can be scheduled based on that.
 *
 * @export
 * @class Troupe
 */
export default class Troupe { 
  constructor() {
    this.actors = [];
    this.scheduler = new Speed();
    this.next = null;
    this.view = [];
    this.events = new Phaser.Events.EventEmitter();
  }

  add(actor) {
    this.actors.push(actor);
    this.scheduler.add(actor, true);
    this.events.emit('add', actor);
  }

  forEach(callbackFn, thisArg) {
    this.actors.forEach(callbackFn, thisArg);
  }

  forEachPC(callbackFn, thisArg) {
    this.actors.filter(actor => actor.isPC).forEach(callbackFn, thisArg);
  }

  updateVisibility() {
    this.actors.forEach(actor => {
      if (this.view.includes(actor.xy)) actor.show();
      else actor.hide();
    });
  }

  get pcs() {
    return this.actors.filter(actor => actor.isPC);
  }

  updateView() {
    const view = new Set();
    this.pcs.forEach(pc => pc.view.forEach(xy => view.add(xy)));
    this.view = [...view];
  }

  get hasVisibleNPC() {
    return this.actors.some(actor => !actor.isPC && actor.visible);
  }

  getAt(xy) {
    return this.actors.filter(actor => actor.isAt(xy))[0];
  }

  hasPCAt(xy) {
    return this.pcs.some(pc => pc.isAt(xy));
  }

  hasNPCAt(xy) {
    return !!this.actors.filter(actor => actor.isNPCAndAt(xy)).length;
  }
  
  getNext() {
    if (this.next) this.next.isNext = false;
    this.next = this.scheduler.next();
    this.next.isNext = true;
    return this.next;
  }
}
