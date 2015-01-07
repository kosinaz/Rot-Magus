/*global RM*/
RM.Nasty = function (type, x, y, ai) {
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
RM.Nasty.extend(RM.Actor);

RM.Nasty.prototype.act = function () {
  'use strict';
  this.regenerate();
  this.scanFOV();
  this.moveTo(this.target);
};

RM.Nasty.prototype.scanFOV = function () {
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
