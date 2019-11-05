class Actor extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture, frame) {
    super(scene, x * 24 + 12, y * 21 + 11, texture, frame);
    this.config = this.scene.actorTypes[frame];
    this.name = this.config.name;
    this.tileX = x;
    this.tileY = y;
    this.tileName = frame;
    this.target = {
      x: this.tileX,
      y: this.tileY
    }
    this.path = null;      
    this.xp = this.config.xp || 0;
    this.xpMax = 50;
    this.level = 0;
    this.health = this.config.health;
    this.healthMax = this.health;
    this.mana = this.config.mana;
    this.manaMax = this.mana;
    this.speed = this.config.speed;
    this.speedBase = this.speed;
    this.speedMod = 0;
    this.strength = this.config.strength;    
    this.strengthBase = this.strength;  
    this.strengthMod = 0;  
    this.agility = this.config.agility;
    this.agilityBase = this.agility;
    this.agilityMod = 0;
    this.wisdom = this.config.wisdom;
    this.wisdomBase = this.wisdom;
    this.wisdomMod = 0;
    this.walksOn = this.config.walksOn || [];
    this.damage = 1 + (this.strength >> 2);
    this.damageMax = this.damage + 19;
    this.rangedDamage = 1 + (this.strength >> 2);
    this.rangedDamageMax = this.rangedDamage + 19;
    this.chanceToHit = 0;
    this.usedWeapons = 0;
    this.defense = 0;
    this.inventory = [];
    this.initInventory();
    this.equipped = {};
    this.ground = [];
    this.load = 0;
    this.updateAttributes();
    this.scene.add.existing(this);
    this.scene.scheduler.add(this, true);
    this.depth = 3;
    this.actions = [];
    this.scene.events.on('playerReady', function () {
      if (this.dead) {
        return;
      }
      let timeline = this.scene.tweens.createTimeline();
      let actionDuration = (1000 / game.speed) / this.actions.length;
      this.actions.forEach(function (action) {
        if (action.type === 'move') {
          timeline.add({
            targets: this,
            props: {
              x: {
                ease: 'Quad.easeInOut',
                duration: actionDuration,
                value: action.x * 24 + 12,
              },
              y: {
                ease: 'Quad.easeInOut',
                duration: actionDuration,
                value: action.y * 21 + 11
              },
              scaleX: {
                ease: 'Quad.easeOut',
                duration: actionDuration / 3,
                yoyo: true,
                value: 1.2
              },
              scaleY: {
                ease: 'Quad.easeOut',
                duration: actionDuration / 3,
                yoyo: true,
                value: 1.2
              },
            }
          });
        } else if (action.type === 'attack') {
          timeline.add({
            targets: this,
            x: action.x * 24 + 12,
            y: action.y * 21 + 11,
            scaleX: 1.2,
            scaleY: 1.2,
            ease: 'Quad.easeOut',
            duration: actionDuration / 3,
            yoyo: true
          });
        }
      }.bind(this));
      timeline.play();
      this.actions = [];
    }.bind(this));
  }

  initInventory() {
    this.config.inventory.forEach(function (itemName) {
      let item = Object.assign({}, this.scene.itemTypes[itemName]);
      item.frame = itemName;
      this.inventory.push(item);
    }.bind(this));
  }

  // The act is getting called by the scheduler every time when this actor is the next to act.
  act() {
    
    this.getGround();

    this.autoEquip();

    // If the actor hasn't reached his target yet because that's further than one step away and additional actions are needed to be performed automatically.
    if (!this.isAtXY(this.target.x, this.target.y)) {

      // Make him move towards his target or attack from afar if possible.
      this.order();
    }
  }

  getGround() {

    if (!this.scene.map.tiles[this.tileX + ',' + this.tileY]) {
      return [];
    }

    // If the there are already items on the ground at the player's current position, set their list as the ground to be displayed on the UI.
    this.ground = this.scene.map.tiles[this.tileX + ',' + this.tileY].itemList 
      || [];
  }

  autoEquip() {
    if (this.inventory) {
      this.inventory.forEach(function (item, i) {
        if (item) { 
          if (!this.equipped.rightHand
            && (item.equips === 'hands' 
            || item.equips === 'hand')) {
              this.equipped.rightHand = item;
              this.inventory[i] = null;
          } else if (item.equips && !this.equipped[item.equips]) {
            this.equipped[item.equips] = item;
            this.inventory[i] = null;
          }
        }
      }, this);
    }
    this.updateAttributes();
  }

  setItem(item, slot, i) {
    slot[i] = item ? Object.assign({}, item) : undefined;
    this.updateAttributes();
    if (slot === this.ground) {
      if (slot.some(function (value) {
        return value;
      })) {        
        this.scene.map.putItem(this.tileX, this.tileY, slot);
      } else {
        this.scene.map.removeItem(this.tileX, this.tileY);
      }
    }
  }

  updateAttributes() {        
    this.updateDefense();
    this.updateStrength();
    this.updateLoad();
    this.updateSpeed();
    this.updateAgility();
    this.updateWisdom();
    this.updateDamage();
    this.updateRangedDamage();

    // Emit the GUI update just in case the target is the player.
    this.scene.events.emit('attributesUpdated', this);
  }

  updateLoad() {
    this.load = 0;
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        this.load += this.equipped[item].weight || 0;
      }
    }.bind(this));
    this.inventory.forEach(function (item) {
      if (item) {
        this.load += item.weight || 0;
      }
    }.bind(this));
  }

  /**
   * Update the damage and maximum damage attributes of the actor to have the values handy when he wants to hit someone and to keep the player informed about them if needed.
   *
   * @memberof Actor
   */
  updateDamage() {

    // Every time the attributes get updated, the damage will be calculated from scratch to prevent asynchronicity. The maximum damage - as the bit-shifted strength of the actor increased by 1 - is granted. Even if the actor is dual-wielding, the strength-based damage won't be doubled.
    this.damageMax = (this.strength >> 2) + 1;

    // If the actor wields a weapon in his left hand.
    if (this.equipped.leftHand) {

      // Add the weapon damage to the maximum damage.
      this.damageMax += this.equipped.leftHand.damage;
    }

    // If the actor wields a weapon in his right hand.
    if (this.equipped.rightHand) {

      // Add the weapon damage to the maximum damage.
      this.damageMax += this.equipped.rightHand.damage;
    }

    // Set the minimum damage as half of the maximum damage.
    this.damage = ~~(this.damageMax / 2);
  }

  /**
   * Update the ranged damage and maximum ranged damage attributes of the actor to have the values handy when he wants to hit someone and to keep the player informed about them if needed.
   *
   * @memberof Actor
   */
  updateRangedDamage() {

    // Every time the attributes get updated, the ranged damage will be calculated from scratch to prevent asynchronicity. The maximum damage - as the bit-shifted agility of the actor - is granted. In the original game this was only true for throwing weapons, but here it is simplified to help the player more easily decide between melee and ranged attack. Even if the actor is dual-wielding, the agility-based damage won't be doubled.
    this.rangedDamageMax = this.agility >> 1;

    // If the actor wields a ranged weapon in his left hand.
    if (this.equipped.leftHand) {

      // Add the weapon ranged damage to the maximum ranged damage.
      this.rangedDamageMax += this.equipped.leftHand.damageRanged || 0;
    }

    // If the actor wields a ranged weapon in his right hand.
    if (this.equipped.rightHand) {

      // Add the weapon ranged damage to the maximum ranged damage.
      this.rangedDamageMax += this.equipped.rightHand.damageRanged || 0;
    }

    // Set the minimum damage as half of the maximum damage.
    this.rangedDamage = ~~(this.rangedDamageMax / 2);
  }

  updateDefense() {
    this.defense = 0;
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        this.defense += this.equipped[item].defense || 0;
      }
    }.bind(this));
  }

  updateSpeed() {
    this.speedMod = 0;
    if (this.load > this.strength * 2) {
      this.speedMod = -this.speedBase;
    } else if (this.load > this.strength * 1.5) {
      this.speedMod = -~~((this.speedBase / 3) * 2);
    } else if (this.load > this.strength) {
      this.speedMod = -~~(this.speedBase / 3);
    }
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        if (this.equipped[item].speed) {
          this.speedMod += this.equipped[item].speed;
        }
      }
    }.bind(this));
    this.speed = this.speedBase + this.speedMod;
  }

  updateStrength() {
    this.strengthMod = 0;
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        if (this.equipped[item].strength) {
          this.strengthMod += this.equipped[item].strength;
        }
      }
    }.bind(this));
    this.strength = this.strengthBase + this.strengthMod;
  }

  updateWisdom() {
    this.wisdomMod = 0;
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        if (this.equipped[item].wisdom) {
          this.wisdomMod += this.equipped[item].wisdom;
        }
      }
    }.bind(this));
    this.wisdom = this.wisdomBase + this.wisdomMod;
  }

  /**
   * Update the agility and agility modifier attributes of the actor to have the values handy when he wants to hit someone and to keep the player informed about them if needed.
   *
   * @memberof Actor
   */
  updateAgility() {

    // Every time the agility gets updated, the modifier will be calculated from scratch to prevent asynchronicity.
    this.agilityMod = 0;

    // Iterate through all the equipment of the actor and search for agility modifier enchantments on them.
    Object.keys(this.equipped).forEach(function (item) {

      // If the actor's given equipment slot is not empty.
      if (this.equipped[item]) {

        // And if the given equipment slot contains an item that modifies the agility.
        if (this.equipped[item].agility) {

          // Add this modifier value to the agility modifier.
          this.agilityMod += this.equipped[item].agility;
        }
      }
    }, this);

    // If the actor is dual-wielding.
    if (
      this.equipped.leftHand && 
      (this.equipped.leftHand.damage || this.equipped.leftHand.damageRanged) &&
      this.equipped.rightHand && 
      (this.equipped.rightHand.damage || this.equipped.rightHand.damageRanged)
    ) {

      // Reduce his agility.
      this.agilityMod -= 5;
    }

    // The modified agility has to be limited to a number between 0 and 19 to keep the chance to hit between 0% and 95%. If the agility modifier would increase or decrease the base agility so much that it would end up out of this range, the modifier will be limited as well to keep the displayed values consistent.
    // If the modified agility became more than the maximum value.
    if (this.agilityBase + this.agilityMod > 19) {

      // Set the agility modifier as the difference between the base agility and the max value.
      this.agilityMod = 19 - this.agilityBase;

    // Else if the modified agility became less than the minimum value.
    } else if (this.agilityBase + this.agilityMod < 0) {

      // Set the agility modifier as the negative counterpart of the base agility.
      this.agilityMod = -this.agilityBase;
    }

    // Update the agility based on the current sum of the above-modified and limited values.
    this.agility = this.agilityBase + this.agilityMod;

    // Update the chance to hit based on the current agility.
    this.chanceToHit = (this.agility * 5) + '%';
  }

  order() {
    if (this.speed < 1) {
      return;
    }
    if (this.isEquippedForRangedAttack()) {
      let actor = this.scene.getActorAt(this.target.x, this.target.y);
      if (actor 
        && this.isEnemyFor(actor)
        && (Math.abs(this.target.x - this.tileX) > 1
        || Math.abs(this.target.y - this.tileY) > 1)) {
        this.rangedAttack(actor);
        this.target = {
          x: this.tileX,
          y: this.tileY
        }
      } else {
        this.move();
      }
    } else {
      this.move();
    }
  }

  regenerate() {
    Object.keys(this.equipped).forEach(function (item) {
      if (this.equipped[item]) {
        if (this.equipped[item].healthRegen) {

          // If the actor's health did not reach the maximum yet.
          if (this.health < this.healthMax) {

            // Make the actor get back one health point. 
            this.health = Math.min(this.health + 3, this.healthMax);
            this.scene.events.emit('attributesUpdated', this);
          }
        }
        if (this.equipped[item].manaRegen) {

          // If the actor's health did not reach the maximum yet.
          if (this.mana < this.manaMax) {

            // Make the actor get back one health point. 
            this.mana = Math.min(this.mana + 3, this.manaMax);
            this.scene.events.emit('attributesUpdated', this);
          }
        }
      }
    }.bind(this));
  }

  // This function is required for the Speed scheduler to determine the sequence of actor actions.
  getSpeed() {

    // Return the speed of the actor.
    return this.speed;
  }

  // Return true if the target tile is walkable by the actor. This is called by the calculate shortest path function and by the GUI when determining where the pointer marker can be displayed.
  walksOnXY(x, y) {

    // Get the tile name at the given position. The name of the tile is unique hence enough to determine its attributes including its walkabilty.
    let tile = this.scene.map.getTileNameAt(x, y);

    // Return true if the actor is able to walk on that type of tiles or if it is generally walkable by every actor.
    return this.walksOn.includes(tile) || (
      tile !== 'waterTile' &&
      tile !== 'marsh' &&
      tile !== 'bush' &&
      tile !== 'tree' &&
      tile !== 'palmTree' &&
      tile !== 'stoneWall' &&
      tile !== 'mountain'
    );
  }

  isEquippedForRangedAttack() {
    let leftHand = this.equipped.leftHand;
    let rightHand = this.equipped.rightHand;
    let returningArrows = false;
    this.usedArrowI = -1;
    if (leftHand && leftHand.ranged ||
      rightHand && rightHand.ranged ||
      leftHand && leftHand.throwable ||
      rightHand && rightHand.throwable
    ) {
      return true;
    }
    if (leftHand && leftHand.usesArrow || rightHand && rightHand.usesArrow) {
      returningArrows = this.inventory.some(function (item) {
        if (!item) {
          return false;
        }
        return item.arrow && item.returns;
      });
      if (returningArrows) {
        return true;
      }
      this.usedArrowI = this.inventory.findIndex(function (item) {
        if (!item) {
          return false;
        }
        return item.arrow && item.amount;
      });
      if (this.usedArrowI !== -1) {
        return true;
      }     
    }    
    return false;
  }

  isEnemyFor(actor) {
    return this.scene.enemies.includes(this) 
    === !this.scene.enemies.includes(actor)
  }

  // Calculate the shortest path between the actor's current position and the given target position.
  addPath(x, y) {

    // Initialize a new astar pathmap based on the given target.
    let a = new ROT.Path.AStar(x, y, this.walksOnXY.bind(this));

    // After generated the pathmap create a new path for the actor.
    this.path = [];

    // Compute the shortest path between the actor's current position and the given target position based on the astar map.
    a.compute(this.tileX, this.tileY, function (x, y) {

      // Add the next position of the shortest path to the actor's path.
      this.path.push({
        x: x,
        y: y
      });
    }.bind(this));
  }

  // Check if the actor is at the given position.
  isAtXY(x, y) {

    // Return true if the actor's tileX and tileY attributes are matching with the given x and y values.
    return this.tileX === x && this.tileY === y;
  }

  // Order the actor to move towards the specified position or make him rest if it is the actor's current position. This action can be called during every action of the actor before he reaches his destination.
  move() {

    // If the actor has been ordered to move to his current position that means the actor would like to have some rest or use the currently held item on himself. This action can't be reached as part of a continues movement towards a target further away, since that option has been already handled as part of the act function, and this function can be reached from there only if the actor is not standing at the target position.
    if (this.isAtXY(this.target.x, this.target.y)) {

      if (this.equipped.leftHand && this.equipped.leftHand.consumable) {        
        this.healthMax += this.equipped.leftHand.healthMax || 0;
        this.health += this.equipped.leftHand.healthMax || 0;
        this.manaMax += this.equipped.leftHand.manaMax || 0;
        this.mana += this.equipped.leftHand.manaMax || 0;
        this.speedBase += this.equipped.leftHand.speedBase || 0;
        this.strengthBase += this.equipped.leftHand.strengthBase || 0;
        this.agilityBase = Math.max(
          0, 
          this.agilityBase + (this.equipped.leftHand.agilityBase || 0)
        );
       
        this.wisdomBase = Math.max(
          0,
          this.wisdomBase + (this.equipped.leftHand.wisdomBase || 0)
        );        
        this.earnXP(this.equipped.leftHand.xp || 0);
        this.equipped.leftHand = undefined;
      }
      if (this.equipped.rightHand && this.equipped.rightHand.consumable) {
        this.healthMax += this.equipped.rightHand.healthMax || 0;
        this.health += this.equipped.rightHand.healthMax || 0;
        this.manaMax += this.equipped.rightHand.manaMax || 0;
        this.mana += this.equipped.rightHand.manaMax || 0;
        this.speedBase += this.equipped.rightHand.speedBase || 0;
        this.strengthBase += this.equipped.rightHand.strengthBase || 0;
        this.agilityBase = Math.max(
          0,
          this.agilityBase + (this.equipped.rightHand.agilityBase || 0)
        );
        this.wisdomBase = Math.max(
          0,
          this.wisdomBase + (this.equipped.rightHand.wisdomBase || 0)
        );
        this.earnXP(this.equipped.rightHand.xp || 0);
        this.equipped.rightHand = undefined;
      }
      this.updateAttributes();

      // Make the actor rest until his next action and get back a health point.
      this.rest();
      this.regenerate();

      // Since the actor only wanted to rest there is no need for further actions.
      return;
    }

    // If the actor has been ordered to a different position and just started to move towards that position there can't be an already calculated path for him. Or if the actor just arrived to its destination during his last action, the last step will be still there as the last remaining element of the path, and that will be the actor's current position. That path can be ignored and no further automatic action should be performed. So in both cases this part of the code has been reached because the actor has been given a new order.
    if (!this.path || this.path.length < 2) {

      // Calculate a new path for the actor towards his new target.
      this.addPath(this.target.x, this.target.y);
    }

    // Remove the first element of the path because that's the actor's current position.
    this.path.shift();

    // If the target is unreachable
    if (!this.path[0]) {
      return;
    }

    // Get any actor at the previously second, now first element of the path, that will be the next step of this actor.
    let actor = this.scene.getActorAt(this.path[0].x, this.path[0].y);

    // If there is an actor at the next step. 
    if (actor) {

      // If that actor is in a different team, the moving actor will damage his victim.
      if (this.isEnemyFor(actor)) {

        // Damage that actor.
        this.causeDamage(actor, ROT.RNG.getUniformInt(this.damage, this.damageMax));

        // Set the enemy as the current victim of the actor so the attack animation can be targetted correctly.
        this.victimX = this.path[0].x;
        this.victimY = this.path[0].y;

        this.actions.push({
          type: 'attack',
          x: this.victimX,
          y: this.victimY
        });

        this.regenerate();
      
      // If that actor is in the same team, this will be only a friendly bump, that still counts as a valid action so this actor can be skipped.
      } else {

        // Stop the blocked actor.
        this.target = {
          x: this.tileX,
          y: this.tileY
        };

        // Reset his path and let him recalculate it as his next action.
        this.path = [];
      }

    // If there isn't any actor in the way of the actor.
    } else {

      // Move the actor.
      this.tileX = this.path[0].x;
      this.tileY = this.path[0].y;

      this.actions.push({
        type: 'move',
        x: this.tileX,
        y: this.tileY
      });

      this.regenerate();
    }
  }

  // Make the actor rest until the his next action and get back a health point.
  rest() {

    // Check all the enemies.
    if (this.scene.enemies.some(function (enemy) {

      // If there is at least one enemy that is still heading towards the last seen position of the player.
      return !enemy.isAtXY(enemy.target.x, enemy.target.y);
    })) {

      // If the actor's health did not reach the maximum yet.
      if (this.health < this.healthMax) {

        // Make the actor get back one health point. 
        this.health += 1;
      }
    
    // If every enemy is either idle or dead. 
    } else {

      // The player has plenty of time to rest.
      this.health = this.healthMax;
    }
  }

  
  /**
   * Decides if the attack was successful then reduces the health of the victim with a value based on the actor's weapon and strength, and the victim's defense.
   *
   * @param {Actor} actor The target of the current actor the will suffer the damage.
   * @param {Number} damage The pre-calculated, randomly selected melee or ranged damage.
   * @param {String} [effectType] The name of the special effect that should be displayed in case of special weapons.
   * @returns null if the attempt was unsuccessful.
   * @memberof Actor
   */
  causeDamage(actor, damage, effectType) {    

    // Prepare to store the effect that informs the player about a hit or a miss.
    let effect;

    let hit = ROT.RNG.getUniformInt(1, 20);
    if (hit > this.agility) {
      effect = this.scene.add.sprite(actor.x, actor.y, 'tiles', 'huh');
      effect.actor = actor;
      effect.depth = 4;
      effect.visible = false;
      this.scene.effects.push(effect);
      return;
    }

    // Decrease the damage with the victim's defense.
    damage = Math.max(damage - actor.defense, 0);

    if (damage === 0) {
      return;
    }

    // Decrease the health of the target actor with the remaining damage.
    actor.health -= damage;

    // Add a new effect to the list of effects to be displayed during this update based on the amount of damage.
    effectType = effectType || (damage > 19 ? 'zok' : 'bif');
    effect = this.scene.add.sprite(actor.x, actor.y, 'tiles', effectType);
    effect.actor = actor;
    effect.depth = 4;
    effect.visible = false;
    this.scene.effects.push(effect);

    // If the target actor's health reached zero.
    if (actor.health < 1) {

      // Kill the actor.
      actor.die();
    }

    // Emit the GUI update just in case the target is the player.
    this.scene.events.emit('attributesUpdated', this);
  }

  rangedAttack(actor) {

    let leftHand = this.equipped.leftHand;
    let rightHand = this.equipped.rightHand;
    let effect;

    if (this.usedArrowI !== -1) {
      this.inventory[this.usedArrowI].amount -= 1;
      if (this.inventory[this.usedArrowI].amount === 0) {
        this.inventory[this.usedArrowI] = undefined;
      }
    }

    // Damage that actor.
    if (leftHand && leftHand.effect) {
      effect = leftHand.effect;
    }
    if (rightHand && rightHand.effect) {
      effect = rightHand.effect;
    }
    this.causeDamage(actor, ROT.RNG.getUniformInt(this.rangedDamage, this.rangedDamageMax), effect);
    if (leftHand && leftHand.throwable) {
      if (rightHand && rightHand.throwable) {
        this.causeDamage(actor, ROT.RNG.getUniformInt(this.rangedDamage, this.rangedDamageMax), effect);
      }
      this.equipped.leftHand = undefined;  
      this.scene.map.addItem(actor.tileX, actor.tileY, [leftHand]);
    }
    if (rightHand && rightHand.throwable) {
      this.equipped.rightHand = undefined;
      this.scene.map.addItem(actor.tileX, actor.tileY, [rightHand]);
    }

    this.regenerate();

    // Emit the GUI ground update just in case the target is the player.
    this.scene.events.emit('playerMoved', this);
    this.updateAttributes();
  }

  // Kill this actor.
  die() {

    // Give some XP to the player.
    this.scene.player.earnXP(this.xp);
    this.scene.events.emit('attributesUpdated', this);
    if (this.equipped) {
      for (let i in this.equipped) {
        this.inventory.push(this.equipped[i]);
      }      
    }
    this.inventory = this.inventory.filter(item => item !== null);
    if (this.inventory) {
      this.scene.map.addItem(this.tileX, this.tileY, this.inventory);
    }

    // Show the remains of the enemy.
    let remains = 
      this.scene.add.sprite(this.x, this.y, 'tiles', this.tileName);
    
    remains.setDepth(4);

    // Wait until the damage effect is emitted
    this.scene.time.delayedCall(500 / game.speed, function () {

      // Destroy the remains.
      remains.destroy();
    });

    // Remove the enemy from the list of enemies.
    this.scene.enemies.splice(this.scene.enemies.indexOf(this), 1);

    // Remove the enemy from the sceduler.
    this.scene.scheduler.remove(this);

    // Destroy the enemy.
    this.destroy();

    this.dead = true;
  }
}