/**
 * Represents the collection of methods responsible for listening to the events
 * of the world scene emitted by the interactions of the user, processing them,
 * and sending them to the world model.
 *
 * @export
 * @class WorldController
 */
export default class WorldController {
  /**
   * Creates an instance of WorldController.
   *
   * @param {World} world
   * @memberof WorldController
   */
  constructor(world) {
    this.world = world;
    addEventListener('contextmenu', (event) => event.preventDefault());
  }

  /**
   *
   *
   * @param {*} pointer
   * @param {*} target
   * @memberof World
   */
  onClick(pointer, target) {
    let selected = this.world.selected;
    const targeted = target.getData('data');
    if (pointer.button === 0 && targeted && targeted.layer === 'actor') {
      selected = targeted;
      this.world.select(targeted);
    }
    if (pointer.button === 2 &&
      selected &&
      this.world.actors.includes(selected)) {
      if (targeted.layer === 'actor') {
        if (selected === this.world.pausedFor) {
          selected.events.emit('complete');
        } else {
        }
      } else {
        if (selected === this.world.pausedFor) {
          this.world.giveOrder(selected, targeted.x, targeted.y);
          selected.act();
        } else {
          this.world.giveOrder(selected, targeted.x, targeted.y);
        }
      }
    }
  }
}
