/*global RM*/
RM.Hero = function (type, x, y, ai) {
  'use strict';
  this.init(type, x, y, ai);
  this.fov = [];
};
RM.Hero.extend(RM.Actor);

RM.Hero.prototype.act = function () {
  'use strict';
  this.regenerate();
  RM.currentHero = this;
  this.fov = [];
  RM.map.shadowcasting.compute(this.x, this.y, 10, this.computeFOV.bind(this));
  RM.engine.lock();
  RM.subscribe('click', this);
};

RM.Hero.prototype.computeFOV = function (x, y) {
  'use strict';
  this.fov.push({
    x: x,
    y: y,
    tile: RM.map.getTile(x, y)
  });
};

RM.Hero.prototype.handleMessage = function (message, publisher, data) {
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

RM.Hero.prototype.order = function (target) {
  'use strict';
  var actor;
  if (!RM.map.isPassable(target.x, target.y)) {
    return false;
  }
  actor = RM.map.getPoint(target.x, target.y, RM.ACTOR);
  if (actor) {
    if (actor === this) {
      /* rest */
      RM.scheduler.setDuration(1.0 / this.agility);
      this.regenerate();
    } else {
      if (this.used.weapon && this.inventory.getPoint(
          this.used.weapon.x,
          this.used.weapon.y,
          RM.ITEM
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

RM.Hero.prototype.manageInventory = function (target) {
  'use strict';
  var item, category;
  item = RM.gui.inventory.content.map.getPoint(target.x, target.y, RM.ITEM);
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
    RM.gui.showInventory(this);
    RM.gui.showGround(this);
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
    RM.gui.showInventory(this);
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
    RM.gui.showGround(this);
    RM.gui.showInventory(this);
  }
};

RM.Hero.prototype.manageGround = function (target) {
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
    RM.gui.showInventory(this);
    RM.gui.showGround(this);
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
    RM.gui.showInventory(this);
    RM.gui.showGround(this);
  }
};

RM.Hero.prototype.use = function (item, target) {
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
