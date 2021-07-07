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
    addEventListener('contextmenu', (event) => event.preventDefault());
  }

  /**
   *
   *
   * @param {*} pointer
   * @param {*} target
   * @param {*} event
   * @memberof World
   */
  onClick(pointer, target) {
    console.log('mouse button ID', pointer.button);
    if (pointer.button === 0) {
      console.log('left clicked', target.getData('data').type.name);
      this.selected = target.getData('data');
      console.log('selected', target.getData('data').type.name);
    } else if (pointer.button === 2 && this.selected && this.selected.isPC) {
      console.log('right clicked', target.getData('data').type.name);
      console.log(this.selected.type.name, 'acted on',
          target.getData('data').type.name);
    }
  }
}
