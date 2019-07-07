class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {

    // Create a map based on Simplex noise. Unique to the game scene and referred to by several functions of the scene.
    this.map = new SimplexMap(this, 'tiles');

    // Get the external actor configurations designed to simplify actor creation and increase the data maintenance efficiency. 
    this.actorTypes = this.cache.json.get('actorTypes');

    // Get the external item configurations designed to simplify item creation and increase the data maintenance efficiency. 
    this.itemTypes = this.cache.json.get('itemTypes');

    // Create an FOV calculator used during the calculate FOV action of the player.
    this.fov = new ROT.FOV.PreciseShadowcasting(function (x, y) {

      // Get the tile name at the given position. The name of the tile is unique hence enough to determine its attributes including its transparency.
      let tile = this.map.getTileNameAt(x, y);

      // Return true if it is the player's position or if it is not opaque.
      return this.player.isAtXY(x, y) ||
        (tile !== 'bush' && tile !== 'tree' && tile !== 'mountain');
    }.bind(this));    

    // Create a scheduler specific to the game scene and set it up as a speed scheduler because all the different actions of a specific actor takes the same amount of time based only on the speed of that actor, so there is no need for a more complex scheduler. The scheduler has to be created before any actor, because every actor will be added to scheduler on creation.
    this.scheduler = new ROT.Scheduler.Speed();

    // Create an engine using the previously created scheduler that will keep calling all the actors to perform their next action in a sequence based on their current speed.
    this.engine = new ROT.Engine(this.scheduler);

    // Create the special actor that will be controlled by the player. Unique to the game scene and referred to by several functions of the scene and the enemies.
    this.player = new Player(this, 0, 0, 'tiles', this.actorTypes.elfMale);

    // Create a list for the enemies to track their activity.
    this.enemies = [];

    // Create a list for the items to track their position.
    this.items = []

    // Create a list for the actors that moved since the last action of the player to help animate the transitions between their previous and new positions.
    this.movingActors = [];

    // Create a list for the actors that attacked someone since the last action of the player to help animate them appropriately.
    this.attackingActors = [];

    // Create a list for the special effects that appeared since the last action of the player to help animate them appropriately.
    this.effects = [];

    // Create pointer marker that will show where the player can go.
    this.marker = this.add.graphics();
    this.marker.lineStyle(1, 0xffff00, 1);
    this.marker.strokeRect(0, 0, 24, 21);

    // Set the main camera viewport to the left side of the screen with the size of the player's maximum field of view.
    this.cameras.main.setViewport(372, 5, 27 * 24, 27 * 21);

    // Set the background black, the color of currently invisible areas.
    this.cameras.main.setBackgroundColor('#000000');

    // Start the engine, start the game.
    this.engine.start();

    // If the player died.
    this.events.on('playerDied', function () {

      // Load the death scene.
      this.start('DeathScene');
    }.bind(this));
  }

  // Returns the actor who is at the given position of the map.
  getActorAt(x, y) {

    // If the player is at the given position.
    if (this.player.isAtXY(x, y)) {

      // Return the player.
      return this.player;
    }

    // Else iterate through all the enemies.
    for (let i = 0; i < this.enemies.length; i += 1) {

      // If an enemy is at the given position.
      if (this.enemies[i].isAtXY(x, y)) {

        // Return that enemy.
        return this.enemies[i];
      }
    }
  }

  // Determine what is visible for the player. Collect the tiles, actors and items to show, to keep as visible and to hide. Make the visible enemies notice the player.
  computeFOV() {

    // Reset the list of tiles, items and actors to show in the current update. It needs to be set here even if the tiles to show are only added in the update FOV section, because the actors and items will be added here.
    this.objectsToShow = [];

    // Reset the list of tiles, items and actors to hide in the current update.
    this.objectsToHide = [];

    // As the show and hide animations of the objects are already played during the previous FOV update, it is safe to remove them and start collecting the objects to show and hide in the next FOV update. All the objects that were displayed in the last update are possible tiles to be hidden during the current update, so we set all of those to hide. If any of those should be displayed in the current update, it will be set not to hide during the FOV calculation. In the very first update, when there is no objects to show from previous updates, the list of objects to hide will be also empty. To set all tiles to be hide, iterate through all the tiles of the map.
    for (let i in this.map.tiles) {

      // If the current tile has an image it means it is currently displayed.
      if (this.map.tiles[i].image !== undefined) {

        // Set the previously displayed tile to hide, but don't hide the tile yet because it might still be visible after the current FOV update. The tiles to hide will be collected and will be hidden after the FOV calculation. In the other hand the tiles that were set to show in the last update were set back to not to show right after their animation to prevent them having the show animation again.
        this.map.tiles[i].toHide = true;
      }
    }

    // Iterate through all the tiles around the player and determine if they are in the line of sight of the player or not.
    this.fov.compute(this.player.tileX, this.player.tileY, 13, function (x, y) {

      // Keep the visible tile or add the tile that become visible to the scene. Tiles that became visible just now will be set to show as part of the add tile function. As the first step of the scene update all the already visible tiles were set to hide, but if a tile is still in the current field of view of the player, that tile will be set to not to hide. These also don't need to be set to show because they are already visible.
      this.map.addTile(x, y);

      // // If the tile is walkable by the player.
      // if (this.player.walksOnXY(x, y)) {

      //   // If the player clicks on the tile.
      //   tile.on('pointerup', function () {

      //     // Set that tile as the new target of the player.
      //     this.scene.player.target.x = x;
      //     this.scene.player.target.y = y;

      //     // Move the player towards the new target.
      //     this.scene.player.move();

      //     console.log(x, y);
      //   });

      //   // If the player's pointer is over the tile.
      //   tile.on('pointerover', function () {

      //     // Move the marker over the tile.
      //     this.scene.tweens.add({
      //       targets: this.scene.marker,
      //       x: this.x - 12,
      //       y: this.y - 11,
      //       ease: 'Quad.easeOut',
      //       duration: 100 / game.speed
      //     });
      //   });

        // // Get the enemy at the tile if there is one.
        // let enemy = this.getActorAt(x, y);

        // // If there is an enemy at the tile and not the player.
        // if (enemy && enemy !== this.player) {
          
        //   // If the enemy is not visible in result of an earlier hide animation that reduced his alpha to 0.
        //   if (enemy.alpha === 0) {

        //     // Add the enemy to the list of objects to show.
        //     this.objectsToShow.push(enemy);
        //   }

        //   // Make the enemy target the player.
        //   enemy.target = {
        //     x: this.player.tileX,
        //     y: this.player.tileY
        //   };
        // }
      //}
    }.bind(this));
  }

  // Update the screen in a speed-based amount of time to show the player what happened since his last action.
  updateFOV() {
    
    // Iterate through all the tiles.
    for (let i in this.map.tiles) {
      
      // If the current tile has an image it means it is currently displayed.
      if (this.map.tiles[i].image !== undefined) {
        
        // Disable the interactivity of every tile during the FOV update to prevent any player interaction with the yet to be updated scene.
        this.map.tiles[i].image.disableInteractive();

        // If the tile is set to show.
        if (this.map.tiles[i].toShow) {

          // Add the tile to the list of objects to show.
          this.objectsToShow.push(this.map.tiles[i].image);

          // Set the tile as not to show to prevent it playing the show animation again in the next update.
          this.map.tiles[i].toShow = false;
        }

        // If the tile is set to hide.
        if (this.map.tiles[i].toHide) {

          // Add the tile to the list of objects to hide, but don't set the tile as not to hide to prevent it playing the hide animation again in the next update because it will be needed after the update to determine which tiles needs to be destroyed.
          this.objectsToHide.push(this.map.tiles[i].image);
        }
      }
    }

    // The position of all the actors that moved since the player did something has been already updated, but their image still needs to be moved to its new position. These actors have been collected during the actions of the moving actors.
    this.tweens.add({
      targets: this.movingActors,
      props: {
        x: {
          ease: 'Quad.easeInOut',
          duration: 1000 / game.speed,
          value: {
            getEnd: function (target, key, value) {
              return target.tileX * 24 + 12;
            },
            getStart: function (target, key, value) {
              return value;
            }
          }
        },
        y: {
          ease: 'Quad.easeInOut',
          duration: 1000 / game.speed,
          value: {
            getEnd: function (target, key, value) {
              return target.tileY * 21 + 11;
            },
            getStart: function (target, key, value) {
              return value;
            }
          }
        }
      },
      
    });

    // To add some depth to the animation, the actors who moved will be scaled a little bit up and then back to normal like a yoyo.
    this.tweens.add({
      targets: this.movingActors,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500 / game.speed,
      ease: 'Quad.easeOut',
      yoyo: true
    });

    // Those actors who attacked someone in close combat since the last move of the player will jump towards their victim and then they go back to their original position like a yoyo. These actors have been collected during the actions of the attacking actors.
    this.tweens.add({
      targets: this.attackingActors,
      x: this.victimX * 24 + 12,
      y: this.victimY * 21 + 11,
      ease: 'Quad.easeInOut',
      duration: 500 / game.speed,
      yoyo: true
    });

    // To add some depth to the animation, the actors who attacked someone will be scaled a little bit up and then back to normal like a yoyo.
    this.tweens.add({
      targets: this.attackingActors,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500 / game.speed,
      ease: 'Quad.easeOut',
      yoyo: true
    });

    // All the inner state changes have their own special effect, that will be added to the actor and will be played from the second half of the screen update and will be removed long after all the other animations have ended to help the player follow the events. These effects have been collected during the actions of the triggering actors.
    this.time.delayedCall(500 / game.speed, function () {
      this.effects.forEach(effect => effect.visible = true);
    }.bind(this));
    this.tweens.add({
      targets: this.effects,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 1000 / game.speed,
      delay: 1000 / game.speed
    });

    // Hide the tiles, actors and items that are not visible anymore. These objects been have collected during the calculate FOV action initiated by the player.
    this.tweens.add({
      targets: this.objectsToHide,
      alpha: 0,
      duration: 1000 / game.speed
    });

    // Show the tiles, actors and items that become visible. These objects have been collected during the calculate FOV action initiated by the player.
    this.tweens.add({
      targets: this.objectsToShow,
      alpha: 1,
      duration: 1000 / game.speed
    });

    // Delay the next call until all the tweens are complete.
    this.time.delayedCall(1000 / game.speed, function () {

      // After computed the FOV the tiles to hide need to be removed from the map.
      for (let i in this.map.tiles) {

        // If the current tile has an image it means it is currently displayed.
        if (this.map.tiles[i].image !== undefined) {

          // If the tile is set to hide.
          if (this.map.tiles[i].toHide) {

            // Hide the tile.
            this.map.hide(this.map.tiles[i]);
          
          // If the tile is not set to hide but visible.
          } else {

            // Set the tiles interactive only after the tweens are complete so the player can react only to the current state of the scene.
            this.map.tiles[i].image.setInteractive();
          }
        }
      }

      // If the player hasn't reached his target yet because that's further than one step away and additional actions are needed to be performed automatically.
      if (!this.player.isAtXY(this.player.target.x, this.player.target.y)) {

        // Make him move towards his target.
        this.player.move();
      }
    }.bind(this));
  }
}