class Player extends Actor {
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame);
    this.isSelected = false;
    this.isWaitingForOrder = false;
    this.scene.events.on('order', this.setTarget, this);    
    this.scene.events.on('select', this.switchSelected, this);    
  }       

  // The act is getting called by the scheduler every time when this actor is the next to act.
  act() {
    
    // The first step is to lock the engine before it calls the next actor, so the screen can be updated and the player can have plenty of time to perform his next action. The engine needs to be locked even if the player's actor has a target and does not need additional orders, because every action takes time and no one should move in the meantime.
    this.scene.engine.lock();

    // Update the list of items on the ground based on the player's current position.
    this.getGround();

    this.updateEffects();

    // Determine what is visible for the player. Collect the tiles, actors and items to show, to keep as visible, and to hide.
    this.scene.computeFOV(this);

    // Update the FOV in a speed-based amount of time to show the player what happened since his last action.
    this.scene.updateFOV();
    
    if (!this.isAtXY(this.target.x, this.target.y)) {
      this.move();
      return;
    }    

    this.scene.time.delayedCall(50, function () {

      // Every other character will follow his already given order when their turn has come, but this character needs to be notified once the waiting should be over and an order is ready to be executed. This will be the way to identify that is is the actor waiting for that notification.
      this.isWaitingForOrder = true;

      // Automatically select the character that is waiting or orders and deselect all the others because they are on their way anyways.    
      this.scene.heroes.forEach(function (hero) {
        hero.setSelected(false);
      });
      this.setSelected(true);

      // Emit an event that notifies the GUI that the player is now ready act and it should see the current state of the ground.
      this.scene.events.emit('playerReady', this);
    }.bind(this));
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
      this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);
    }
    this.scene.events.emit('GUIUpdate');
  }

  switchSelected(i) {    
    if (this.scene.heroes[i] === this) {
      this.setSelected(!this.isSelected);
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