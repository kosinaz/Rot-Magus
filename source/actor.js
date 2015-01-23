/*global RM, ROT*/
RM.Actor = function (type, x, y, ai) {
  'use strict';
  this.init(type, x, y, ai);
};

RM.Actor.prototype.init = function (type, x, y, ai) {
  'use strict';
  var i;
  RM.scheduler.add(this, true);
  this.x = x;
  this.y = y;
  this.ai = ai;
  this.fov = {};
  this.target = {};
  this.newTarget = {};
  this.path = [];
  this.level = 0;
  this.xp = 0;
  this.type = type;
  this.tile = type.tile;
  this.maxHealth = type.health;
  this.health = type.health;
  this.maxMana = type.mana;
  this.mana = type.mana;
  this.strength = type.strength;
  this.wisdom = type.wisdom;
  this.agility = type.agility;
  this.precision = type.precision;
  this.inventory = new RM.Map();
  this.burden = 0;
  if (type.inventory) {
    for (i = 0; i < type.inventory.length; i += 1) {
      this.inventory.setPoint(new RM.Item(RM.items[type.inventory[i]]),
                             i % 4, Math.floor(i / 4), 1);
      this.burden += RM.items[type.inventory[i]].weight;
    }
  }
  this.used = {
    weapon: {
      x: this.type.weapon % 4,
      y: Math.floor(this.type.weapon / 4)
    },
    cloak: {
      x: this.type.cloak % 4,
      y: Math.floor(this.type.weapon / 4)
    }
  };
};

RM.Actor.prototype.regenerate = function () {
  'use strict';
  this.heal(1 / this.agility);
};

RM.Actor.prototype.heal = function (amount) {
  'use strict';
  this.health = Math.min(this.maxHealth, this.health + amount);
};

RM.Actor.prototype.moveTo = function (target) {
  'use strict';
  var x, y, enemy, damage, i;
  if (target.x === undefined) {
    return false;
  }
  this.computePath(target.x, target.y);
  if (this.path.length < 2) {
    return false;
  }
  x = this.path[1][0];
  y = this.path[1][1];
  RM.scheduler.setDuration(1.0 / this.agility);
  enemy = RM.map.getPoint(x, y, RM.ACTOR);
  if (enemy) {
    enemy.damage(this);
  } else {
    RM.map.move(this.x + ',' + this.y + ',' + RM.ACTOR,
                x + ',' + y + ',' + RM.ACTOR);
    this.x = x;
    this.y = y;
  }
};

RM.Actor.prototype.attackRanged = function (target) {
  'use strict';
  var weapon, munition;
  weapon = this.inventory.getPoint(this.used.weapon.x,
                                   this.used.weapon.y, RM.ITEM);
  if (weapon.type.usesArrows) {
    if (this.used.munition) {
      munition = this.inventory.getPoint(
        this.used.munition.x,
        this.used.munition.y,
        RM.ITEM
      );
      if (munition) {
        RM.map.getPoint(target.x, target.y, RM.ACTOR).damage(this);
        RM.scheduler.setDuration(1.0 / this.agility);
        munition.count -= 1;
        if (munition.count === 0) {
          RM.gui.inventory.selected.munition = null;
          this.inventory.setItem(
            this.used.munition.x,
            this.used.munition.y,
            null
          );
          this.used.munition = null;
        }
      } else {
        this.moveTo(target);
      }
    } else {
      this.moveTo(target);
    }
  } else {
    this.moveTo(target);
  }
};

RM.Actor.prototype.computePath = function (x, y) {
  'use strict';
  var a = new ROT.Path.AStar(x, y, function (x, y) {
    var actor = RM.map.getPoint(x, y, RM.ACTOR);
    if (RM.map.isPassable(x, y)) {
      if (actor) {
        if (actor === this) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }.bind(this));
  this.path = [];
  a.compute(this.x, this.y, function (x, y) {
    this.path.push([x, y]);
  }.bind(this));
};

RM.Actor.prototype.damage = function (source) {
  'use strict';
  var damage, weaponDamage, log;
  damage = ROT.RNG.getUniformInt(1, 6);
  if (damage === 6) {
    damage += 6;
  }
  if (source.inventory !== undefined &&
      source.used.weapon !== undefined &&
      source.inventory.getPoint(source.used.weapon.x, source.used.weapon.y,
                                RM.ITEM)) {
    damage += source.inventory.getPoint(source.used.weapon.x,
                                        source.used.weapon.y,
                                        RM.ITEM).type.damage;
  }
  source.gainXP(1);
  this.health -= damage;

  log = this.type.name + ' has lost ' + damage + ' health point' +
    (damage !== 1 ? 's' : '');
  if (this.health < 1) {
    log += ' and died';
    if (!this.ai) {
      RM.engine.lock();
      RM.c.drawImage(RM.gameover, 0, 0);
      RM.canvas.removeEventListener('mousemove', RM.gui.map);
      RM.canvas.removeEventListener('mousemove', RM.gui.inventory);
      RM.canvas.removeEventListener('mousemove', RM.gui.ground);
      RM.canvas.addEventListener('click', RM.start);
    }
    RM.scheduler.remove(this);
    RM.map.setActor(this.x, this.y, null);
    source.gainXP(2);
  }
  //RM.gui.log.setValue(log + '.');
};

RM.Actor.prototype.gainXP = function (amount) {
  'use strict';
  this.xp += amount;
  if (this.xp > 50 * Math.pow(2, this.level)) {
    this.xp = 0;
    this.level += 1;
    this.maxHealth += 10;
    this.maxMana += this.maxMana ? 10 : 0;
    this.health += 10;
    this.mana += this.maxMana ? 10 : 0;
  }
};
