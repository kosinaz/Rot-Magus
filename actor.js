/*global RM, ROT*/

RM.Actor = function (type, x, y, ai) {
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
      this.inventory.setItem(i % 4, Math.floor(i / 4),
                             new RM.Item(RM.items[type.inventory[i]]));
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

RM.Actor.prototype.act = function () {
  'use strict';
  this.regenerate();
  if (this.ai) {
    this.scanFOV();
    this.moveTo(this.target);
  } else {
    RM.engine.lock();
    RM.subscribe('click', this);
    this.showStats();
    this.showInventory();
    this.showGround();
    this.showFOV();
  }
};

RM.Actor.prototype.regenerate = function () {
  'use strict';
  this.heal(1 / this.agility);
};

RM.Actor.prototype.heal = function (amount) {
  'use strict';
  this.health = Math.min(this.maxHealth, this.health + amount);
};

RM.Actor.prototype.showFOV = function () {
  'use strict';
  RM.gui.map.center(this.x, this.y);
  RM.gui.map.clear(RM.gui.map.invisible);
  RM.map.shadowcasting.compute(this.x, this.y, 10,
                               RM.gui.map.process.bind(RM.gui.map));
  RM.gui.map.show();
};

RM.Actor.prototype.showInventory = function () {
  'use strict';
  var x, y;
  RM.gui.inventory.content.map = this.inventory;
  for (x = RM.gui.inventory.content.x;
       x < RM.gui.inventory.content.width; x += 1) {
    for (y = RM.gui.inventory.content.y;
         y < RM.gui.inventory.content.height; y += 1) {
      RM.gui.inventory.process(x, y);
    }
  }
  RM.gui.inventory.show();
};

RM.Actor.prototype.showGround = function () {
  'use strict';
  var x, y, im;
  RM.gui.ground.content.map = RM.map.getItemMap(this.x, this.y);
  if (RM.gui.ground.content.map === undefined) {
    RM.map.setItemMap(this.x, this.y, new RM.Map());
    RM.gui.ground.content.map = RM.map.getItemMap(this.x, this.y);
  }
  for (x = RM.gui.ground.content.x;
       x < RM.gui.ground.content.width; x += 1) {
    for (y = RM.gui.ground.content.y;
         y < RM.gui.ground.content.height; y += 1) {
      RM.gui.ground.process(x, y);
    }
  }
  RM.gui.ground.show();
};

RM.Actor.prototype.showStats = function () {
  'use strict';
  RM.gui.xp.setValue(this.xp, 50 * Math.pow(2, this.level), '#e3e300');
  RM.gui.health.setValue(Math.floor(this.health), this.maxHealth,
                        this.health > this.maxHealth / 4
                        ? '#00e300' : '#e30000');
  RM.gui.mana.setValue(this.mana, this.maxMana, '#4261e7');
  RM.gui.burden.setValue(this.burden, this.strength, '#844121');
  RM.gui.strength.setValue(this.strength);
  RM.gui.wisdom.setValue(this.wisdom);
  RM.gui.agility.setValue(this.agility);
  RM.gui.precision.setValue(this.precision);
};

RM.Actor.prototype.scanFOV = function () {
  'use strict';
  this.newTarget = null;
  RM.map.shadowcasting.compute(this.x, this.y, 10, function (x, y) {
    if (!this.newTarget && RM.map.isPlayer(x, y)) {
      this.newTarget = {
        x: x,
        y: y
      };
    }
  }.bind(this));
  if (this.newTarget) {
    this.target = this.newTarget;
  }
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
  enemy = RM.map.getActor(x, y);
  if (enemy) {
    enemy.damage(this);
  } else {
    RM.map.setActor(this.x, this.y, null);
    this.x = x;
    this.y = y;
    RM.map.setActor(this.x, this.y, this);
  }
};

RM.Actor.prototype.attackRanged = function (target) {
  'use strict';
  var weapon, munition;
  weapon = this.inventory.getItem(this.used.weapon.x, this.used.weapon.y);
  if (weapon.type.usesArrows) {
    if (this.used.munition) {
      munition = this.inventory.getItem(
        this.used.munition.x,
        this.used.munition.y
      );
      if (munition) {
        RM.map.getActor(target.x, target.y).damage(this);
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
    var actor = RM.map.getActor(x, y);
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
      source.inventory.getItem(source.used.weapon.x, source.used.weapon.y)) {
    damage += source.inventory.getItem(source.used.weapon.x,
                                      source.used.weapon.y).type.damage;
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
  RM.gui.log.setValue(log + '.');
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

RM.Actor.prototype.handleMessage = function (message, publisher, data) {
  'use strict';
  if (message === 'click') {
    switch (publisher) {
    case RM.gui.map:
      this.order(data);
      break;
    case RM.gui.inventory:
      this.manageInventory(data);
      break;
    case RM.gui.ground:
      this.manageGround(data);
      break;
    }
  }
};

RM.Actor.prototype.order = function (target) {
  'use strict';
  var actor;
  if (!RM.map.isPassable(target.x, target.y)) {
    return false;
  }
  actor = RM.map.getActor(target.x, target.y);
  if (actor) {
    if (actor === this) {
      /* rest */
      RM.scheduler.setDuration(1.0 / this.agility);
      this.regenerate();
    } else {
      if (this.used.weapon && this.inventory.getItem(
          this.used.weapon.x,
          this.used.weapon.y
        ).type.ranged) {
        this.attackRanged(target);
      }
    }
  } else {
    this.moveTo(target);
    RM.gui.log.setValue('');
  }
  RM.unsubscribe('click', this);
  RM.engine.unlock();
};

RM.Actor.prototype.manageInventory = function (target) {
  'use strict';
  var item, category;
  item = RM.gui.inventory.content.map.getItem(target.x, target.y);
  if (item) {
    if (RM.gui.inventory.isSelected('select', target)) {
      this.use(item, target);
    } else {
      RM.gui.inventory.selected.select = {
        x: target.x,
        y: target.y,
        tile: RM.guitiles.pointer
      };
    }
    RM.gui.ground.selected.select = null;
    this.showInventory();
    this.showGround();
  } else if (RM.gui.inventory.selected.select) {
    this.inventory.setItem(target.x, target.y, this.inventory.getItem(
      RM.gui.inventory.selected.select.x,
      RM.gui.inventory.selected.select.y
    ));
    item = this.inventory.getItem(
      RM.gui.inventory.selected.select.x,
      RM.gui.inventory.selected.select.y
    );
    category = item.type.category;
    if (RM.gui.inventory.isSelected(category,
                                    RM.gui.inventory.selected.select)) {
      RM.gui.inventory.selected[category] = {
        x: target.x,
        y: target.y,
        tile: RM.guitiles.use
      };
    }
    this.inventory.setItem(RM.gui.inventory.selected.select.x,
                           RM.gui.inventory.selected.select.y, null);
    RM.gui.inventory.selected.select = null;
    this.showInventory();
  } else if (RM.gui.ground.selected.select) { //pick up item from the ground
    this.inventory.setItem(target.x, target.y,
                                      RM.gui.ground.content.map.getItem(
        RM.gui.ground.selected.select.x,
        RM.gui.ground.selected.select.y
      ));
    RM.gui.ground.content.map.setItem(RM.gui.ground.selected.select.x,
                                      RM.gui.ground.selected.select.y, null);
    RM.gui.ground.selected.select = null;
    RM.gui.burden.setValue(this.burden, this.strength, '#844121');
    this.showGround();
    this.showInventory();
  }
};

RM.Actor.prototype.manageGround = function (target) {
  'use strict';
  var item, category;
  if (!RM.gui.ground.content.map) {
    return false;
  }
  item = RM.gui.ground.content.map.getItem(target.x, target.y);
  if (item) {
    RM.gui.ground.selected.select = {
      x: target.x,
      y: target.y,
      tile: RM.guitiles.pointer
    };
    RM.gui.inventory.selected.select = null;
    this.showInventory();
    this.showGround();
  } else if (RM.gui.ground.selected.select) {
    RM.gui.ground.content.map.setItem(target.x, target.y,
                                      RM.gui.ground.content.map.getItem(
        RM.gui.ground.selected.select.x,
        RM.gui.ground.selected.select.y
      ));
    RM.gui.ground.content.map.setItem(RM.gui.ground.selected.select.x,
                                      RM.gui.ground.selected.select.y, null);
    RM.gui.ground.selected.select = null;
    this.showGround();
  } else if (RM.gui.inventory.selected.select) { //drop item
    RM.gui.ground.content.map.setItem(target.x, target.y,
                                      this.inventory.getItem(
        RM.gui.inventory.selected.select.x,
        RM.gui.inventory.selected.select.y
      ));
    item = this.inventory.getItem(
      RM.gui.inventory.selected.select.x,
      RM.gui.inventory.selected.select.y
    );
    category = item.type.category;
    if (RM.gui.inventory.isSelected(category,
                                    RM.gui.inventory.selected.select)) {
      RM.gui.inventory.selected[category] = null;
    }
    this.inventory.setItem(RM.gui.inventory.selected.select.x,
                           RM.gui.inventory.selected.select.y, null);
    RM.gui.inventory.selected.select = null;

    this.burden -= RM.gui.ground.content.map.getItem(
      target.x,
      target.y
    ).type.weight;
    RM.gui.burden.setValue(this.burden, this.strength, '#844121');
    this.showInventory();
    this.showGround();
  }
};

RM.Actor.prototype.use = function (item, target) {
  'use strict';
  if (RM.gui.inventory.isSelected(item.type.category, target)) {
    RM.gui.inventory.selected[item.type.category] = null;
    RM.gui.inventory.selected.select = null;
    this.used[item.type.category] = null;
  } else {
    RM.gui.inventory.selected[item.type.category] = {
      x: target.x,
      y: target.y,
      tile: RM.guitiles.use
    };
    RM.gui.inventory.selected.select = null;
    this.used[item.type.category] = target;
  }
};
