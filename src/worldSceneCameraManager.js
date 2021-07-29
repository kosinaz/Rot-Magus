/**
 * Represents a tool to handle the camera of the world scene.
 * @export
 * @class WorldSceneCameraManager
 */
export default class WorldSceneCameraManager {
  /**
   * Creates an instance of WorldSceneCameraManager.
   * @param {WorldScene} scene - The world scene.
   * @memberof WorldSceneCameraManager
   */
  constructor(scene) {
    // Set the scene.
    this.scene = scene;
    this.scene.cameras.main.scrollX = -512;
    this.scene.cameras.main.scrollY = -288;
    const keys =
      this.scene.input.keyboard.addKeys('W,A,S,D,UP,LEFT,DOWN,RIGHT');
    this.cursorControls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.scene.cameras.main,
      left: keys.LEFT,
      right: keys.RIGHT,
      up: keys.UP,
      down: keys.DOWN,
      speed: 0.5,
    });
    this.wasdControls = new Phaser.Cameras.Controls.FixedKeyControl({
      camera: this.scene.cameras.main,
      left: keys.A,
      right: keys.D,
      up: keys.W,
      down: keys.S,
      speed: 0.5,
    });
    document.addEventListener('mouseenter', () => {
      this.mouseover = true;
    });
    document.addEventListener('mouseleave', () => {
      this.mouseover = false;
    });
  }

  /**
   *
   *
   * @param {*} delta
   * @memberof WorldSceneCameraManager
   */
  update(delta) {
    this.cursorControls.update(delta);
    this.wasdControls.update(delta);
    if (this.mouseover) {
      if (this.scene.input.activePointer.x < 24) {
        this.scene.cameras.main.scrollX -= 8;
      };
      if (1000 < this.scene.input.activePointer.x) {
        this.scene.cameras.main.scrollX += 8;
      };
      if (this.scene.input.activePointer.y < 21) {
        this.scene.cameras.main.scrollY -= 8;
      };
      if (555 < this.scene.input.activePointer.y) {
        this.scene.cameras.main.scrollY += 8;
      };
    }
  }
}
