/**
 * Represents the game world displayed for the player.
 * @export
 * @class WorldView
 */
export class WorldView {
  /**
   * Creates an instance of WorldView.
   * @param {WorldMap} map - The map that has content to show.
   * @memberof WorldView
   */
  constructor(map) {
    // Set the map.
    this.map = map;
  }
}
