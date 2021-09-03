/* global Phaser */
import Speed from '../../lib/rot/scheduler/speed.js';
/**
 * Represents the collection of entities which can act at a certain speed and
 * their actions can be scheduled based on that.
 *
 * @export
 * @class WorldController
 */
export default class ActorGroup { 
  /**
   * Creates an instance of ActorGroup.
   *
   * @memberof ActorGroup
   */
  constructor() {
    this.scheduler = new Speed();
    this.actors = [];
    this.events = new Phaser.Events.EventEmitter();
  }

  add(actor) {
    this.actors.push(actor);
    this.scheduler.add(actor, true);
    actor.events.on('complete', this.next, this);
    this.events.emit('add', actor);
  }

  next() {
    this.events.emit('next', this.scheduler.next());
  }

  forEach(callbackFn, thisArg) {
    this.actors.forEach(callbackFn, thisArg);
  }

  forEachPC(callbackFn, thisArg) {
    this.actors.filter(actor => actor.isPC).forEach(callbackFn, thisArg);
  }

  includes(actor) {
    return this.actors.includes(actor);
  }

  hasPCAt(xy) {
    return !!this.actors.filter(this.isPCAt, {xy: xy}).length;
  }

  isPCAt(actor) {
    return actor.isPC && actor.isAt(this.xy);
  }
}
