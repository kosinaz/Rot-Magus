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
   * @memberof World
   */
  onClick(pointer, target) {
    console.log('mouse button ID', pointer.button);
    const data = target.getData('data');
    if (pointer.button === 0 && data.layer === 'actor') {
      console.log('left clicked', data);
      console.log('left clicked', data.type.name);
      this.selected = data;
      console.log('selected', data.type.name);
    }
    if (pointer.button === 2 && this.selected && this.selected.isPC) {
      if (data.layer === 'actor') {
        console.log('right clicked', data.type.name);
        console.log('selected', this.selected, 'paused', this.world.pausedFor);
        if (this.selected === this.world.pausedFor) {
          console.log(this.selected.type.name, 'acted on',
              data.type.name);
        } else {
          console.log(this.selected.type.name, 'will act on',
              data.type.name);
        }
      } else {
        console.log('right clicked', data.type);
        console.log('selected', this.selected, 'paused', this.world.pausedFor);
        if (this.selected === this.world.pausedFor) {
          console.log(this.selected.type.name, 'moved');
        } else {
          console.log(this.selected.type.name, 'will move');
        }
      }
    }
  }
}
