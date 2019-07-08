class Player extends Actor {
  constructor(scene, x, y, texture, config) {
    super(
      scene, 
      x, 
      y, 
      texture,
      config,
    );

    // Make the camera follow the player.
    this.scene.cameras.main.startFollow(this, true, 1, 1, 0, 0);
  }

  // The act is getting called by the scheduler every time when this actor is the next to act.
  act() {
    
    // The first step is to lock the engine before it calls the next actor, so the screen can be updated and the player can have plenty of time to perform his next action. The engine needs to be locked even if the player's actor has a target and does not need additional orders, because every action takes time and no one should move in the meantime.
    this.scene.engine.lock();
    
    // Determine what is visible for the player. Collect the tiles, actors and items to show, to keep as visible, and to hide. Make the visible enemies notice the player.
    this.scene.computeFOV();
    
    // Update the FOV in a speed-based amount of time to show the player what happened since his last action.
    this.scene.updateFOV();    
  }

  // Order the player to move towards the specified position or make him rest if it is the player's current position. This action can be called as a direct result of a click on a tile walkable by the player or during every upcoming action of the player before he reaches his destination.
  move() {

    // The player moves the same way as an actor, except the engine and the player moved event.
    super.move();

    // Since this counts as a valid action, there is nothing left to do for the player as part of his current action, so the engine should be unlocked, and the scheduler should continue with the next actor.
    this.scene.engine.unlock();

    // The scene should also emit an event that one of the player's attributes has been updated, and the ground section of the GUI should react to that.
    this.scene.events.emit('playerMoved', this);
  }

  // Make the player rest until the his next action and get back a health point.
  rest() {
    
    // The player rests the same way as an actor, except the update attribute event. Even if the player would have been already on full health, these steps were not skipped to let him wait for his enemy.
    super.rest();
    
    // The scene should also emit an event that one of the player's attributes has been updated, and the GUI should react to that.
    this.scene.events.emit('updateAttribute', this);
  }

  // Give some XP to the player for killing an enemy.
  earnXP(amount) {

    // Increase the XP of the player with the given amount.
    this.xp += amount;

    // If the player collected enough XP to level up.
    if (this.xp >= this.xpMax) {

      // Decrease his XP with the target amount.
      this.xp -= this.xpMax;

      // Increase to target XP.
      this.xpMax *= 2;

      // Increase the level of the player.
      this.level += 1;
    }

    // Emit an GUI update event.
    this.scene.events.emit('updateAttribute', this);
  }

  // Kill the player.
  die() {

    // Emit the player died event.
    this.scene.events.emit('playerDied');
  }
}