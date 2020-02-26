import {World} from './world/world';

/**
 * Represents the scene where the gameplay itself happens.
 *
 * @class WorldScene
 * @extends {Phaser.Scene}
 */
export class WorldScene extends Phaser.Scene {
  /**
   * Creates an instance of WorldScene.
   * @memberof WorldScene
   */
  constructor() {
    // Create the WorldScene just like any Phaser scene.
    super('WorldScene');
  }

  /**
   * Creates the content of the world.
   *
   * @param {*} heroes
   * @memberof WorldScene
   */
  create(heroes) {
    this.world = new World();
    this.world.on('update', this.show);
    heroes.forEach((hero) => {
      this.world.setActor(hero);
    });
  }

  // // If the player died.
  // this.events.on('playerDied', function() {
  //   game.score = this.player.xp;
  //   for (let i = 0; i < this.player.level; i += 1) {
  //     game.score += this.levels[i].xp;
  //   }
  //   game.rank = this.levels[this.player.level].name;

  //   this.events.off('attributesUpdated');
  //   this.events.off('playerReady');

  //   // Load the death scene.
  //   this.scene.setVisible(false, 'GUIScene');
  //   this.scene.start('DeathScene');
  // }.bind(this));

  // this.events.on('gameTerminated', function() {
  //   this.events.off('attributesUpdated');
  //   this.events.off('playerReady');

  //   // Load the death scene.
  //   this.scene.setVisible(false, 'GUIScene');
  //   this.scene.start('MenuScene');
  // }.bind(this));
  
}
