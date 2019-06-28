const scheduler = new ROT.Scheduler.Action();
const engine = new ROT.Engine(scheduler)
let map;
let heightmap;
let player;
let marker;
let enemies = [];
let engineLocked = false;
let isAcceptingOrders = false;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create = function () {

    // create a map based on Simplex noise
    this.ground = new SimplexMap(this, 'tiles');

    // create a blank item layer to show items on top of the ground
    this.items = {};

    // create a FOV calculator
    this.fov = new ROT.FOV.PreciseShadowcasting(this.isTransparent.bind(this));

    let actors = this.cache.json.get('actors');
    this.items = this.cache.json.get('items');

    player = new Actor(this, 10, 0, 'tiles', this.ground, actors.elf);
    player.name = 'Atlian';
    
    // // create zombies
    // this.grassTiles = layer.filterTiles(function (tile) {
    //   return this.noiseMap.getTileIndexAt(tile.x, tile.y) == 'grass';
    // }, this);
    // for (let i = 0; i < 40; i += 1) {
    //   tile = ROT.RNG.getItem(this.grassTiles);
    //   let enemy = new Actor(this, tile.x, tile.y, 'tiles', layer, actors.zombie);
    //   enemy.name += ' ' + (i + 1);
    //   enemies.push(enemy); 
    // }
    // for (let i = 0; i < 30; i += 1) {
    //   tile = ROT.RNG.getItem(this.grassTiles);
    //   let enemy = new Actor(this, tile.x, tile.y, 'tiles', layer, actors.skeleton);
    //   enemy.name += ' ' + (i + 1);
    //   enemies.push(enemy);
    // }
    // for (let i = 0; i < 20; i += 1) {
    //   tile = ROT.RNG.getItem(this.grassTiles);
    //   let enemy = new Actor(this, tile.x, tile.y, 'tiles', layer, actors.goblin);
    //   enemy.name += ' ' + (i + 1);
    //   enemies.push(enemy);
    // }
    // for (let i = 0; i < 10; i += 1) {
    //   tile = ROT.RNG.getItem(this.grassTiles);
    //   let enemy = new Actor(this, tile.x, tile.y, 'tiles', layer, actors.hobgoblin);
    //   enemy.name += ' ' + (i + 1);
    //   enemies.push(enemy);
    // }
    // for (let i = 0; i < 5; i += 1) {
    //   tile = ROT.RNG.getItem(this.grassTiles);
    //   let enemy = new Actor(this, tile.x, tile.y, 'tiles', layer, actors.troll);
    //   enemy.name += ' ' + (i + 1);
    //   enemies.push(enemy);
    // }

    // create pointer marker
    marker = this.add.graphics();
    marker.lineStyle(1, 0xffff00, 1);
    marker.strokeRect(0, 0, 24, 21);

    // set the camera
    this.cameras.main.setViewport(372, 5, 27 * 24, 27 * 21);

    // set the background black, the color of invisible areas
    this.cameras.main.setBackgroundColor('#000000');

    engine.start();

    this.events.on('playerDied', function () {
      this.scene.start('DeathScene');
    }.bind(this));
  };

  // check if the tile is transparent for the player at the given position
  isTransparent = function (x, y) {

    // get the tile at the given position
    let tile = this.ground.getTileNameAt(x, y);

    // return true if it is the player's position or if it is not opaque
    return (x === player.tileX && y === player.tileY)
      || (tile !== 'bush' && tile !== 'tree' && tile !== 'mountain');
  };
  
}