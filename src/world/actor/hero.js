/**
 * Represents an Actor that can be controlled by the player.
 *
 * @export
 * @class Hero
 * @extends {Actor}
 */
export class Hero extends Actor {
  /**
   * Creates an instance of Actor.
   * @param {Phaser.Scene} scene - The scene the Actor belongs to.
   * @param {string} type - The actorTypes.json typename of the Actor.
   * @param {number} [x=0] - The x coordinate of the Actor's position.
   * @param {number} [y=0] - The y coordinate of the Actor's position.
   * @memberof Actor
   */
  constructor(scene, type, x = 0, y = 0) {
    super(scene, type, x, y);
    this.isSelected = false;
    this.isWaitingForOrder = false;
    this.scene.events.on('order', this.setTarget, this);
    this.scene.events.on('select', this.switchSelected, this);
  }

  /**
   * The act is getting called by the scheduler every time when the hero is the
   * next to act based on his speed. The act will be played out in two
   * different ways based on his current state.
   *
   * If he received an order from the player that still needs multiple turns to
   * complete, he will be in an ordered state.
   *
   * If he is in that state and not selected by the player currently, his
   * internal properties still need to be updated and the next step of the
   * order needs to be executed, but there is no need to stop the game and
   * show what he can see awaiting for the player's reaction.
   *
   * If he is in that state and selected, the player should see the current
   * state, should see the animations about what happened so far, and finally
   * should see how the hero executes the next step of the order. If there is
   * no enemy around, there is no need at all to lock the engine, and the hero
   * should continue to execute the remaining steps of his order.
   *
   * In the other hand, if the hero completed his order and it is his turn to
   * act, the game should be locked, the hero should be selected if he wasn't
   * selected initially, and the player should see the current state, should
   * see the animations about what happened so far, and should be able to react
   * by giving an order to the hero.
   *
   * @memberof Hero
   */
  act() {
    // Notify the listeners that this actor's turn to act has come by emitting
    // the act event.
    // Listeners:
    // - Effect: decreaseTime
    //
    this.events.emit('act');

    // If the actor is not selected and not ordered by the player.
    if (!this.isSelected && !this.isOrdered) {
      // If the actor is currently not executing an order but it's his turn to
      // act, automatically make him selected and all the others deselected by
      // the player.
      // not selected - not ordered
      this.select();
    }

    // If the actor was selected by the player or just became automatically
    // selected because he doesn't have an order.
    if (this.isSelected) {
      // Update the list of items on the ground based on the player's current
      // position. This can't be called on the end of player's previous turn,
      // because enemies can throw items at the player afterwards that needs to
      // be displayed on the beginning of the player's turn. Even if the
      // character is executing an order and only passing by, the player should
      // see what was there in case he wants to stop there or return.
      // selected
      this.updateGround();

      // When the player's character is selected, even if he is currently
      // executing an order, the first step is to lock the engine before it
      // calls the next actor, so the screen can be updated and the player can
      // have plenty of time to perform his next action. If the actor is not
      // selected and currently executing an order, there is no need to wait
      // for the player's input, so there is no need to stop the game.
      // selected
      this.lock();
    }
  }

  /**
   * Locks the engine to show the player what happened so far and to let him
   * give an order.
   *
   * @memberof Hero
   */
  lock() {
    // Lock the engine of the scene.
    this.scene.engine.lock();
  }

  /**
   * Make this hero selected and all the others deselected. Notify the scene
   * about the selection.
   *
   * @memberof Hero
   */
  select() {
    // Deselect all heroes of the scene.
    this.scene.heroes.forEach((hero) => hero.isSelected = false);

    // Select this hero.
    this.isSelected = true;

    // Update the last selected hero of the scene.
    this.scene.lastSelected = this;
  }

  /**
   * Move the camera to this character only after the actions have been
   * animated from the previous character's perspective. Then collect all the
   * currently displayed tiles, gradually hide those that are not visible for
   * the player anymore and start to display those that just became visible.
   *
   * @memberof Hero
   */
  showFOV() {
    // Move the camera to the this hero.
    this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);

    // Gradually hide then destroy those currently visible tile, item and actor
    // images that are not visible for this hero.
    this.tweens.add({
      targets: this.scene.images.filter(
          (image) => !this.tiles.find(
              (tile) => tile.x === image.tileX && tile.y === image.tileY,
          ),
      ),
      alpha: 0,
      duration: 1000 / game.speed,
      onComplete: () => {
        // eslint-disable-next-line new-cap
        Phaser.Utils.Array.Remove(this.scene.images, this.targets);
        this.targets.forEach((tile) => tile.destroy());
      },
    });

    // Create a list for the new tile, item and actor images.
    const newImages = [];

    // Find those tiles, items and actors that just became visible for the hero,
    // create an image for them and add them to the list of new images to let
    // them gradually show right away.
    this.tiles.forEach((tile) => {
      // If the scene already has an image at the currently visible tile
      // position.
      if (this.scene.images.find(
          (image) => tile.x === image.tileX && tile.y === image.tileY,
      )) {
        // Keep the image as is, and continue with the next visible tile
        // position.
        return;
      }

      // If the scene doesn't have an image for this tile yet, then create an
      // image for the tile and if needed for the item and actor that can be
      // found there as well, then add them to the list of images that needs to
      // be displayed gradually.
      this.scene.map.getFrames(x, y).forEach((frame) => {
        // If there is a tile, item or actor there.
        if (frame) {
          // Create an image for it and add it to the list of images to show.
          newImages.push(new ActiveImage({
            alpha: 0,
            scene: this.scene,
            frame: frame,
            texture: 'tiles',
            tileX: tile.x,
            tileY: tile.y,
            x: tile.x * 24 + 12,
            y: tile.y * 21 + 11,
          }));
        }
      });
    }, this);

    // Gradually show those currently invisible tiles, items, and actors that
    // are now visible for this hero.
    this.tweens.add({
      targets: newImages,
      alpha: 1,
      duration: 1000 / game.speed,
    });

    // Add the new list to the remaining list of visible images.
    this.scene.images = this.scene.images.concat(newImages);
  }

  /**
   * Update the list of tiles currently visible for the hero and if there is an
   * enemy, stop him to let the player decide what to do with them. In the
   * meanwhile make all the visible enemies also notice the hero.
   *
   * @memberof Hero
   */
  updateFOV() {
    // Reset the list of tiles that were visible for the hero in the previous
    // turn.
    const tiles = [];

    // Iterate through all the tiles around the player and determine if they
    // are in the line of sight of the player or not.
    this.scene.fov.compute(this.tileX, this.tileY, 13, (x, y) => {
      // Add the position of tile to list of positions visible by the player.
      tiles.push({
        x: x,
        y: y,
      });
    });

    // Update the list of visible tiles.
    this.tiles = tiles;
  }

  /**
   * Update the list of items found at the current position of the hero. These
   * are the only items on the ground that he can pick up currently, and this
   * is the list in which the dropped items will be added to.
   *
   * @memberof Hero
   */
  updateGround() {
    // If there are already items on the ground at the hero's current position,
    // set their list as the ground that the hero can interact with. If there
    // is no item at the current position, just return an empty list.
    this.ground = this.scene.map.getItems(this.tileX, this.tileY);
  }

  // Order the player to move towards the specified position or make him rest if it is the player's current position. This action can be called as a direct result of a click on a tile walkable by the player or during every upcoming action of the player before he reaches his destination.
  move() {

    // The player moves the same way as an actor, except the engine and the player moved event.
    super.move();     

    // The scene should also emit an event that one of the player's attributes has been updated, and the ground section of the GUI should react to that.
    this.scene.events.emit('playerMoved', this);

    // Make the currently visible enemies notice the player.
    this.scene.updateEnemyTargets(this);

    // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor.
    this.scene.engine.unlock();
  }

  rangedAttack(actor) {

    super.rangedAttack(actor);

    // Make the currently visible enemies notice the player.
    this.scene.updateEnemyTargets(this);

    // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor.
    this.scene.engine.unlock();
  }

  castSpellOn(spell, actor) {

    super.castSpellOn(spell, actor);

    // Make the currently visible enemies notice the player.
    this.scene.updateEnemyTargets(this);

    // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor.
    this.scene.engine.unlock();
  }

  summonAt(x, y, spell) {
    this.mana -= spell.manaCost;
    let hit = ROT.RNG.getUniformInt(1, 20);
    if (hit > this.wisdom) {
      return;
    }
    let tile = this.scene.map.getTileNameAt(x, y);
    if (this.scene.actorTypes[spell.summons].walksOn || (
        tile !== 'waterTile' &&
        tile !== 'marsh' &&
        tile !== 'bush' &&
        tile !== 'tree' &&
        tile !== 'palmTree' &&
        tile !== 'stoneWall' &&
        tile !== 'mountain'
      )) {
      let servant = new Player(this.scene, x, y, 'tiles', spell.summons);
      this.teammates.push(servant);
      servant.teammates = this.teammates;
      this.createEffect(servant, spell.effect);
    }

    // Make the currently visible enemies notice the player.
    this.scene.updateEnemyTargets(this);

    // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor.
    this.scene.engine.unlock();
  }

  // Make the player rest until the his next action and get back a health point.
  rest() {
    
    // The player rests the same way as an actor, except the update attribute event. Even if the player would have been already on full health, these steps were not skipped to let him wait for his enemy.
    super.rest();
    
    // The scene should also emit an event that one of the player's attributes has been updated, and the GUI should react to that.
    this.scene.events.emit('attributesUpdated', this);
  }

  // Give some XP to the player for killing an enemy.
  earnXP(amount) {

    // Increase the XP of the player with the given amount.
    this.xp += amount;

    // If the player collected enough XP to level up.
    if (this.xp >= this.xpMax) {

      // Decrease his XP with the target amount.
      this.xp -= this.xpMax;

      // Increase the level of the player.
      this.level += 1;

      // Increase to target XP.
      this.xpMax = this.scene.levels[this.level].xp;

      // Increase the maximum health of the player.
      this.healthMax += 10;

      // Heal up the player.
      this.health = this.healthMax;
      
      // If the player has wisdom.
      if (this.wisdom > 0) {

        // Increase the maximum mana of the player.
        this.manaMax += 10;

        // Regenerate the player.
        this.mana = this.manaMax;
      }
    }

    // Emit an GUI update event.
    this.scene.events.emit('attributesUpdated', this);
  }

  // Kill the player.
  die() {

    // Emit the player died event.
    if (this.lifespan === undefined) {
      this.scene.events.emit('playerDied');
    } else {

      this.scene.player = this.teammates[0];

      // Remove from the sceduler.
      this.scene.scheduler.remove(this);

      // Destroy.
      this.destroy();

      this.dead = true;
    }
  }
}