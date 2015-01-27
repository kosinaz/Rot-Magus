/*global RM*/
RM.Hero = function (type, x, y, ai) {
  'use strict';
  this.init(type, x, y, ai);
  this.fov = [];
  this.visibleItems = [];
  this.inventoryY = 0;
  this.updateVisibleItems();
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
    x: x + 10 - this.x,
    y: y + 10 - this.y,
    tile: this.getTile(x, y)
  });
};

RM.Hero.prototype.updateVisibleItems = function () {
  'use strict';
  var x, y, p;
  this.visibleItems = [];
  for (y = this.inventoryY; y < this.inventoryY + 4; y += 1) {
    for (x = 0; x < 3; x += 1) {
      this.visibleItems.push({
        x: x,
        y: y,
        tile: this.getItemTile(x, y)
      });
    }
  }
};

/**
 * Returns the tile coordinates of the data stored in an arbitrarily defined
 * point of the map.
 * @param   {String} p The coordinates of the point separated with commas,
 *                   or the first coordinate of the point, followed by the
 *                   others as additional arguments.
 * @returns {Object} The tile coordinates of the object stored in the
 *                   specified point of the map.
 */
RM.Hero.prototype.getTile = function (x, y) {
  'use strict';
  var i, mp;
  for (i = 2; i >= 0; i -= 1) {
    mp = RM.map.getPoint(x, y, i);
    if (mp) {
      return mp.tile;
    }
  }
  return null;
};

/**
 * Returns the tile coordinates of the data stored in an arbitrarily defined
 * point of the map.
 * @param   {String} p The coordinates of the point separated with commas,
 *                   or the first coordinate of the point, followed by the
 *                   others as additional arguments.
 * @returns {Object} The tile coordinates of the object stored in the
 *                   specified point of the map.
 */
RM.Hero.prototype.getItemTile = function (x, y) {
  'use strict';
  var i, item;
  for (i = 1; i >= 0; i -= 1) {
    item = this.inventory.getPoint(x, y, i);
    if (item) {
      return item.tile;
    }
  }
  return null;
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
    //RM.gui.log.setValue('');
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
