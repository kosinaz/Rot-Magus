import Actor from './world/actor/actor.js';
import WorldScene from './worldScene.js';

/**
 * Represents the scene where the player can create the player characters.
 *
 * @export
 * @class CreateCharacterScene
 * @extends {Phaser.Scene}
 */
export default class CreateCharacterScene extends Phaser.Scene {
  /**
   * Creates an instance of CreateCharacterScene.
   * @memberof CreateCharacterScene
   */
  constructor() {
    // Create the CreateCharacterScene just like any Phaser scene.
    super('CreateCharacterScene');
  }

  /**
   *
   *
   * @memberof CreateCharacterScene
   */
  create() {
    const actorTypes = this.cache.json.get('actorTypes');
    const config = {
      pcs: [
        new Actor(actorTypes.druidMale, 0, 0, true),
        new Actor(actorTypes.orch, 9, 9, true),
      ],
    };

    // Add the world scene with the already created PC's.
    this.scene.add('WorldScene', WorldScene, true, config);

    // Start the world scene.
    this.scene.start('WorldScene');
  }
}
