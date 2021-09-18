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
    const tweening = !!this.tweens.getAllTweens().length;
    if (tweening) return;
    const targeted = target.getData('data');
    if (!targeted) return;
    if (pointer.button === 0) this.controller.handleLeftClick(targeted);
    if (pointer.button === 2) this.controller.handleRightClick(targeted);
  }

  handleLeftClick(targeted) {
    if (targeted.layer === 'actor') this.world.actors.select(targeted);
  }

  handleRightClick(targeted) {
    const selected = this.world.actors.selected;
    if (!selected) return;
    if (targeted.layer !== 'actor' && !targeted.type.walkable) return;
    this.world.director.giveOrder(selected, targeted.xy);
    if (selected.next) this.world.director.followOrder(selected);
  }
}
