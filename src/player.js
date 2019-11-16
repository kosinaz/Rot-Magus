class Player extends Actor {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.isSelected = false;
    this.isWaitingForOrder = false;
    this.scene.events.on('order', this.setTarget, this);    
    this.scene.events.on('select', this.switchSelected, this);    
  }       

  // The act is getting called by the scheduler every time when the player character is the next to act based on his speed. The act will be played out in two different ways based on his current state. If he received an order from the player that still needs multiple turns to complete, he will be in an ordered state. If he is in that state and not selected by the player currently, his internal properties still need to be updated and the next step of the order needs to be executed, but there is no need to stop the game and show what he can see awaiting for the player's reaction.
  act() {

    // Update the effects currently affecting the player by reducing the number of remaining turns they will be active.
    // always
    this.updateEffects();

    // Update the list of tiles currently visible for the player and if there is an enemy, stop him to let the player decide what to do with them. In the meanwhile make all the visible enemies also notice the player. 
    // always
    this.updateFOV();

    // If the actor is not selected and not ordered by the player.
    if (!this.isSelected && !this.isOrdered) {
    
      // If the actor is currently not executing an order but it's his turn to act, automatically make him selected and all the others deselected by the player.
      // not selected - not ordered
      this.select();
    }

    // If the actor was selected by the player or just became automatically selected because he doesn't have an order.
    if (this.isSelected) {

      // Update the list of items on the ground based on the player's current position. This can't be called on the end of player's previous turn, because enemies can throw items at the player afterwards that needs to be displayed on the beginning of the player's turn. Even if the character is executing an order and only passing by, the player should see what was there in case he wants to stop there or return.
      // selected
      this.updateGround();
      
      // When the player's character is selected, even if he is currently executing an order, the first step is to lock the engine before it calls the next actor, so the screen can be updated and the player can have plenty of time to perform his next action. If the actor is not selected and currently executing an order, there is no need to wait for the player's input, so there is no need to stop the game.
      // selected
      this.lock();

      // Animate all the actions that have been executed since the last animation. After that, allow the player to order the actor or automatically execute the order given to him in one of the previous turns. Either way after the actor performed the action, unlock the engine and let the next actor take his turn. If the actor is not selected, the action will be displayed in the turn of next player character. When this character will be the next to act with his previous order already completed, only the result of his action will be displayed, and only those enemies will be animated, whose turn came after the next player character's turn. If the actor is selected even if it is executing a previous order, the current action needs to be animated and the result needs to be displayed for the player before switching to the next player character. So the actions should be animated for the player from the perspective of the last player character. For the current one it will be enough to show the current state. 
      // selected
      this.showActions();

      // Move the camera to this character only after the actions have been animated from the previous character's perspective. Then collect all the currently displayed tiles, gradually hide those that are not visible for the player anymore and start to display the newly visible tiles.
      // selected
      this.showFOV();
    }
  }

  lock() {
    this.scene.engine.lock();
  }

  setTarget(x, y) {
    if (!this.isSelected) {
      return;
    }
    this.target = {
      x: x,
      y: y
    }
    this.updateTargetBasedOnEffects();

    // If this was the actor waiting for orders.
    if (this.isWaitingForOrder) {
      
      // Make sure that he won't execute new orders even if he was selected and ordered when another actor is waiting for orders. This way he can note the order but won't execute it until his time has come. This needs to be changed before executing the order because that would end with an engine unlock that leads to another act before this change is made.
      this.isWaitingForOrder = false;
      
      // Make him start executing it.
      this.order();     
    }
  }

  setSelected(selected) {
    this.isSelected = selected;
    if (selected) {
      this.scene.lastSelected = this;
      // Determine what is visible for the player. Collect the tiles, actors and items to show, to keep as visible, and to hide.
      this.scene.computeFOV(this);

      // Update the FOV in a speed-based amount of time to show the player what happened since his last action.
      this.scene.updateFOV();
      this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);
    }
    this.scene.events.emit('GUIUpdate');
  }

  switchSelected(i) {    
    if (this.scene.heroes[i] === this) {
      this.setSelected(!this.isSelected);
    } else {
      this.setSelected(false);
    }
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