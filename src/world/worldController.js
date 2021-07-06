/**
 * Represents the game world controller.
 *
 * @export
 * @class WorldController
 */
export default class WorldController {
  /**
   *Creates an instance of World.
   * @param {*} world
   * @memberof WorldController
   */
  constructor(world) {
  }

  /**
   *
   *
   * @param {*} target
   * @memberof World
   */
  onPointerDown(target) {
    target.data.events.emit('complete');
  }
}
