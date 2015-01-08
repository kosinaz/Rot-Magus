/*global RM*/
RM.GUI = function () {
  'use strict';
  RM.c.drawImage(RM.hud, 0, 0);
  this.xp = new RM.Bar(40, 9, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.health = new RM.Bar(40, 30, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.mana = new RM.Bar(40, 51, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.burden = new RM.Bar(40, 72, 72, 21, {
    x: 24 * 4,
    y: 21 * 11
  });
  this.strength = new RM.Label(16, 114, 24, 21);
  this.wisdom = new RM.Label(40, 114, 24, 21);
  this.agility = new RM.Label(64, 114, 24, 21);
  this.precision = new RM.Label(88, 114, 24, 21);
  this.map = new RM.Frame(128, 9, 504, 441, {
    map: RM.map,
    x: 0,
    y: 0,
    width: 21,
    height: 21,
    empty: RM.guitiles.invisible
  });
  this.inventory = new RM.Frame(16, 135, 96, 168, {
    map: RM.map.getActor(0, 0).inventory,
    x: 0,
    y: 0,
    width: 4,
    height: 8,
    empty: RM.guitiles.empty
  });
  this.ground = new RM.Frame(16, 345, 96, 84, {
    x: 0,
    y: 0,
    width: 4,
    height: 4,
    empty: RM.guitiles.empty
  });
  this.log = new RM.Label(16, 455, 608, 21, 'left');
};

RM.GUI.prototype.update = function (actor) {
  'use strict';
  this.showStats(actor);
  this.showInventory(actor);
  this.showGround(actor);
  this.showFOV(actor);
};

RM.GUI.prototype.showStats = function (actor) {
  'use strict';
  this.xp.setValue(actor.xp, 50 * Math.pow(2, actor.level), '#e3e300');
  this.health.setValue(Math.floor(actor.health), actor.maxHealth,
                        actor.health > actor.maxHealth / 4
                        ? '#00e300' : '#e30000');
  this.mana.setValue(actor.mana, actor.maxMana, '#4261e7');
  this.burden.setValue(actor.burden, actor.strength, '#844121');
  this.strength.setValue(actor.strength);
  this.wisdom.setValue(actor.wisdom);
  this.agility.setValue(actor.agility);
  this.precision.setValue(actor.precision);
};

RM.GUI.prototype.showInventory = function (actor) {
  'use strict';
  var x, y;
  this.inventory.content.map = actor.inventory;
  for (x = this.inventory.content.x;
       x < this.inventory.content.width; x += 1) {
    for (y = this.inventory.content.y;
         y < this.inventory.content.height; y += 1) {
      this.inventory.process(x, y);
    }
  }
  this.inventory.show();
};

RM.GUI.prototype.showGround = function (actor) {
  'use strict';
  var x, y, im;
  this.ground.content.map = RM.map.getItemMap(actor.x, actor.y);
  for (x = RM.gui.ground.content.x;
       x < RM.gui.ground.content.width; x += 1) {
    for (y = RM.gui.ground.content.y;
         y < RM.gui.ground.content.height; y += 1) {
      this.ground.process(x, y);
    }
  }
  this.ground.show();
};

RM.GUI.prototype.showFOV = function (actor) {
  'use strict';
  this.map.center(actor.x, actor.y);
  this.map.clear(this.map.invisible);
  RM.map.shadowcasting.compute(actor.x, actor.y, 10,
                               this.map.process.bind(this.map));
  this.map.show();
};
