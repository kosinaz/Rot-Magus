import {WorldMap} from './world/worldMap';
import {WorldView} from './world/worldView';
import Speed from '../lib/rot/scheduler/speed';
import Engine from '../lib/rot/engine';

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
   * @memberof WorldScene
   */
  create() {
    // Create a scheduler specific to the game scene and set it up as a speed
    // scheduler because all the different actions of a specific actor takes
    // the same amount of time based only on the speed of that actor, so there
    // is no need for a more complex scheduler. The scheduler has to be created
    // before any actor, because every actor will be added to scheduler on
    // creation.
    this.scheduler = new Speed();

    // Create an engine using the previously created scheduler that will keep
    // calling all the actors to perform their next action in a sequence based
    // on their current speed.
    this.engine = new Engine(this.scheduler);

    // Create the world map.
    this.map = new WorldMap(this);

    // Create the special actors that the player will control.
    this.map.addHero('elfMale', 0, 0);
    this.map.addHero('duckMageMale', 1, 0);
    this.map.addHero('knightMale', 2, 0);

    // Create the view that will show the world.
    this.view = new WorldView(this.map);

    // Create the view that will show the properties of the selected actor.
    this.scene.launch('GUIScene');

    // Start the engine, start the game.
    this.engine.start();

    // If the player died.
    this.events.on('playerDied', function() {
      game.score = this.player.xp;
      for (let i = 0; i < this.player.level; i += 1) {
        game.score += this.levels[i].xp;
      }
      game.rank = this.levels[this.player.level].name;

      this.events.off('attributesUpdated');
      this.events.off('playerReady');

      // Load the death scene.
      this.scene.setVisible(false, 'GUIScene');
      this.scene.start('DeathScene');
    }.bind(this));

    this.events.on('gameTerminated', function() {
      this.events.off('attributesUpdated');
      this.events.off('playerReady');

      // Load the death scene.
      this.scene.setVisible(false, 'GUIScene');
      this.scene.start('MenuScene');
    }.bind(this));
  }
}
