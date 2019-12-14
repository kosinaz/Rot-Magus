import {color} from './consts.js';
import WorldMap from './world/worldMap.js';
/**
 * Represents the scene that loads all the resources that the game uses.
 *
 * @export
 * @class LoadScene
 * @extends {Phaser.Scene}
 */
export default class LoadScene extends Phaser.Scene {
  /**
   * Creates an instance of LoadScene.
   * @memberof LoadScene
   */
  constructor() {
    // Create the LoadScene just like any Phaser scene.
    super('LoadScene');
  }

  /**
   * Loads all the resources that the game uses.
   *
   * @memberof LoadScene
   */
  preload() {
    this.load.atlas('tiles', 'images/tiles.png', 'images/tiles.json');
    this.load.atlas('gui', 'images/gui.png', 'images/gui.json');
    this.load.json('actorTypes', 'data/actorTypes.json');
    this.load.json('itemTypes', 'data/itemTypes.json');
    this.load.json('guiElements', 'data/guiElements.json');
    this.load.json('mapConfig', 'data/mapConfig.json');
    this.load.json('levels', 'data/levels.json');
    this.showLoading();
    if (GJAPI.bActive) {
      // eslint-disable-next-line new-cap
      GJAPI.UserFetchCurrent((response) => {
        if (response.users) {
          game.username = response.users[0].username;
        }
      });
    }
  }

  /**
   * Displays a random loading animation.
   *
   * @memberof LoadScene
   */
  showLoading() {
    // Set the background color black.
    this.cameras.main.setBackgroundColor(color.black);

    // Add the loading message.
    this.add.text(400, 250, 'Traversing Hyperspace...');

    // Create a collection of stars to display.
    const stars = [];
    for (let i = 0; i < 5; i += 1) {
      stars.push(this.add.graphics());
      stars[i].x = 487 + ~~(Math.random() * 50);
      stars[i].y = 280 + ~~(Math.random() * 50);
    }
    const addDot = function(graphics, color) {
      graphics.lineStyle(1, color, 1);
      graphics.lineBetween(2.5, 2, 2.5, 3);
    };
    const addSmallCross = function(graphics, color) {
      graphics.lineStyle(1, color, 1);
      graphics.lineBetween(2.5, 1, 2.5, 4);
      graphics.lineBetween(1, 2.5, 4, 2.5);
    };
    const addBigCross = function(graphics, color) {
      graphics.lineStyle(1, color, 1);
      graphics.lineBetween(2.5, 0, 2.5, 5);
      graphics.lineBetween(0, 2.5, 5, 2.5);
    };
    addDot(stars[0], color.lightgray);
    addSmallCross(stars[1], color.lightgray);
    addDot(stars[1], color.white);
    addBigCross(stars[2], color.lightgray);
    addSmallCross(stars[2], color.white);
    addSmallCross(stars[3], color.lightgray);
    addDot(stars[3], color.white);
    addDot(stars[4], color.lightgray);
    this.time.addEvent({
      delay: 150,
      callback: () => {
        for (let i = 0; i < 4; i += 1) {
          stars[i].x = stars[i + 1].x;
          stars[i].y = stars[i + 1].y;
        }
        stars[4].x = 487 + ~~(Math.random() * 50);
        stars[4].y = 280 + ~~(Math.random() * 50);
      },
      loop: true,
    });
  }
  /**
   * Starts the Menu after it has loaded everything.
   *
   * @memberof LoadScene
   */
  create() {
    // Configure the world map generator.
    WorldMap.setConfig(
        this.cache.json.get('mapConfig'),
        this.cache.json.get('itemTypes'),
        this.cache.json.get('actorTypes'),
    );

    // Start the Menu.
    this.scene.start('MenuScene');
  }
}
