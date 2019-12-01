/**
 * Represents a tool to handle the area of the game world that is seen by the
 * Actor at any given moment.
 * @export
 * @class FOVManager
 */
export class FOVManager {
  /**
   * Creates an instance of FOVManager.
   * @param {Actor} viewer - The Actor who looks at the game world.
   * @memberof FOVManager
   */
  constructor(viewer) {
    // Set the viewer.
    this.viewer = viewer;

    // Set the tool to compute the FOV of the viewer based on what is
    // transparent for him.
    this.fovcomputer =
      new ROT.FOV.PreciseShadowcasting(viewer.isTransparent.bind(this));
  }
}
