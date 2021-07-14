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
    if (pointer.button === 0 && targeted.layer === 'actor') {
      console.log('left clicked', targeted.type.name);
      selected = targeted;
      this.world.select(targeted);
      console.log('selected', targeted.type.name);
    }
    if (pointer.button === 2 &&
      selected &&
      this.world.actors.includes(selected)) {
      if (targeted.layer === 'actor') {
        console.log('right clicked', targeted.type.name);
        if (selected === this.world.pausedFor) {
          console.log(selected.type.name, 'acted on', targeted.type.name);
          selected.events.emit('complete');
        } else {
          console.log(selected.type.name, 'will act on', targeted.type.name);
        }
      } else {
        console.log('right clicked', targeted.x, targeted.y);
        console.log('selected', selected.type.name);
        console.log('pausedFor', this.world.pausedFor.type.name);
        if (selected === this.world.pausedFor) {
          console.log(selected.type.name, 'moved');
          this.world.giveOrder(selected, 'move', targeted.x, targeted.y);
          selected.act();
        } else {
          console.log(selected.type.name, 'will move');
          this.world.giveOrder(selected, 'move', targeted.x, targeted.y);
        }
      }
    }
  }
}
